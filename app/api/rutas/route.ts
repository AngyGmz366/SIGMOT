// /app/api/rutas/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const NuevoRutoSchema = z.object({
    tiempo_estimado: z
        .string()
        .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, 'Formato HH:mm inválido')
        .refine((val) => val !== '00:00', 'El tiempo no puede ser 00:00'),
    horarios: z.array(z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, 'Formato HH:mm inválido'))
});

export async function GET() {
    let conn;
    try {
        conn = await db.getConnection();

        const [rows] = await conn.query(`
      SELECT
        r.Id_Ruta_PK,
        r.Origen,
        r.Destino,
        r.Distancia,
        r.Tiempo_Estimado,
        r.Descripcion,
        r.Estado,
        r.Precio,
        r.Horarios,
        r.Coordenadas,
        o.Latitud AS Latitud_Origen,
        o.Longitud AS Longitud_Origen,
        d.Latitud AS Latitud_Destino,
        d.Longitud AS Longitud_Destino,
        (
          SELECT JSON_ARRAYAGG(v.Id_Unidad_FK)
          FROM TBL_VIAJES v 
          WHERE v.Id_Rutas_FK = r.Id_Ruta_PK
        ) AS unidades
      FROM mydb.TBL_RUTAS r
      LEFT JOIN mydb.TBL_LOCALIDADES o ON UPPER(o.Nombre_Localidad) = UPPER(r.Origen)
      LEFT JOIN mydb.TBL_LOCALIDADES d ON UPPER(d.Nombre_Localidad) = UPPER(r.Destino)
      ORDER BY r.Id_Ruta_PK DESC;
    `);

        return NextResponse.json({ ok: true, data: rows });
    } catch (error: any) {
        console.error('❌ Error al listar rutas:', error);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}

// El POST permanece exactamente igual...
export async function POST(req: Request) {
    let conn;
    try {
        const body = await req.json();

        const validationResult = NuevoRutoSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({ error: 'Datos inválidos', detalles: validationResult.error.flatten().fieldErrors }, { status: 400 });
        }

        const { distancia, tiempo_estimado, origen, destino, descripcion, estado, precio, horarios, unidades } = body;

        conn = await db.getConnection();

        console.log('📤 Creando ruta con unidades:', { origen, destino, unidades, horarios });

        await conn.query('CALL sp_rutas_crear_max5(?, ?, ?, ?, ?, ?, ?, ?)', [distancia || 0, tiempo_estimado || '00:00:00', origen, destino, descripcion || '', estado || 'ACTIVA', precio || 0, JSON.stringify(horarios || [])]);

        const [queryResult]: any = await conn.query('SELECT @nuevo_id AS id');
        const idNuevo = queryResult?.[0]?.id || null;

        console.log('✅ Ruta creada con ID:', idNuevo);

        if (idNuevo && unidades && unidades.length > 0 && horarios && horarios.length > 0) {
            console.log('🔗 Asociando unidades con horarios:', { unidades, horarios });

            await conn.query('CALL sp_asociar_unidades_activas_a_rutas_con_horarios(?, ?, ?)', [idNuevo, JSON.stringify(horarios), JSON.stringify(unidades)]);

            console.log('✅ Unidades asociadas correctamente');
        }

        return NextResponse.json({
            ok: true,
            message: 'Ruta creada correctamente con unidades asociadas.',
            id: idNuevo
        });
    } catch (error: any) {
        console.error('❌ Error al crear ruta:', error);
        return NextResponse.json(
            {
                ok: false,
                error: error.sqlMessage || error.message
            },
            { status: 500 }
        );
    } finally {
        if (conn) conn.release();
    }
}
