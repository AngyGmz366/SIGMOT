export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
const pool = db;

/* ============================================================
   GET → Obtener mantenimiento por ID o por placa
   Llama al SP: sp_mantenimiento_obtener
============================================================ */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const placa = searchParams.get('placa'); // si viene ?placa=HAA-1234
    const { id } = params;
    let query: string;
    let values: any[];

    if (placa) {
      // 🔹 Buscar por número de placa
      query = `CALL sp_mantenimiento_obtener(NULL, ?);`;
      values = [placa];
    } else if (!isNaN(Number(id)) && Number(id) > 0) {
      // 🔹 Buscar por ID
      query = `CALL sp_mantenimiento_obtener(?, NULL);`;
      values = [id];
    } else {
      return NextResponse.json({ error: 'Debe enviar un ID o una placa válida.' }, { status: 400 });
    }

    const [rows]: any = await pool.query(query, values);
    const data = rows[0];

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Mantenimiento no encontrado.' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Error al obtener mantenimiento:', error);
    return NextResponse.json({ error: 'Error al obtener mantenimiento.' }, { status: 500 });
  }
}


/* ============================================================
   PUT → Actualizar mantenimiento
   Llama al SP: sp_mantenimiento_actualizar
============================================================ */
export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = Number(params.id);
        const body = await req.json();

        const {
            Id_TipoManto_FK,
            Id_EstadoManto_FK,
            Fecha_Programada,
            Fecha_Realizada,
            Proximo_Mantenimiento,
            Kilometraje,
            Descripcion,
            Costo_Total,
            Taller,
            Repuestos,
        } = body;

        const [rows]: any = await pool.query(
            `CALL sp_mantenimiento_actualizar(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
                id, // Id_Mantenimiento_PK
                Id_TipoManto_FK,
                Id_EstadoManto_FK,
                Fecha_Programada,
                Fecha_Realizada,
                Proximo_Mantenimiento,
                Kilometraje,
                Descripcion,
                Costo_Total,
                Taller,
                Repuestos,
            ]
        );

        const result = rows[0]?.[0] || {};
        return NextResponse.json({
            message: result.Mensaje || 'Mantenimiento actualizado correctamente.',
        });
    } catch (error: any) {
        console.error('❌ Error al actualizar mantenimiento:', error);
        return NextResponse.json({ error: 'Error al actualizar mantenimiento.' }, { status: 500 });
    }
}

/* ============================================================
   DELETE → Eliminar mantenimiento
   Llama al SP: sp_mantenimiento_eliminar
============================================================ */
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = Number(params.id);
        const [rows]: any = await pool.query(`CALL sp_mantenimiento_eliminar(?);`, [id]);
        const result = rows[0]?.[0] || {};
        return NextResponse.json({
            message: result.Mensaje || 'Mantenimiento eliminado correctamente.',
        });
    } catch (error: any) {
        console.error('❌ Error al eliminar mantenimiento:', error);
        return NextResponse.json({ error: 'Error al eliminar mantenimiento.' }, { status: 500 });
    }
}
