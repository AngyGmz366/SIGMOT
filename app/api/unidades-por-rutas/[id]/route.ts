// /app/api/unidades-por-ruta/[id]/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

function normalizeCallResult(rows: any): any[] {
    if (Array.isArray(rows)) {
        if (Array.isArray(rows[0])) return rows[0];
        if (rows.length && typeof rows[0] === 'object' && !('affectedRows' in rows[0])) return rows;
    }
    return [];
}

function formatHora(hora: any): string | null {
    if (!hora) return null;
    try {
        const date = new Date(hora);
        return date.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
        const match = String(hora).match(/\d{2}:\d{2}/);
        return match ? match[0] : hora;
    }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    const idRuta = Number(params.id);
    if (!Number.isFinite(idRuta)) {
        return NextResponse.json({ error: 'ID de ruta inválido' }, { status: 400 });
    }

    const conn = await db.getConnection();
    try {
        const [rows]: any = await conn.query(
            `SELECT 
                v.Id_Viaje_PK as idViaje,
                v.Id_Unidad_FK as idUnidad,
                u.Numero_Placa,
                CONCAT(u.Marca_Unidad, ' ', u.Modelo) as marcaModelo,
                v.Hora_Salida,
                v.Hora_Estimada_Llegada,
                v.Fecha as fecha
              FROM mydb.TBL_VIAJES v
              INNER JOIN mydb.TBL_UNIDADES u ON v.Id_Unidad_FK = u.Id_Unidad_PK
              WHERE v.Id_Rutas_FK = ?
              ORDER BY v.Hora_Salida ASC`,
            [idRuta]
        );

        const data = normalizeCallResult(rows);

        const items = data.map((r: any) => ({
            idViaje: r.idViaje,
            idUnidad: r.idUnidad,
            unidad: `${r.Numero_Placa} - ${r.marcaModelo}`,
            numeroPlaca: r.Numero_Placa,
            marcaModelo: r.marcaModelo,
            fecha: r.fecha,
            horaSalida: formatHora(r.Hora_Salida),
            horaLlegada: formatHora(r.Hora_Estimada_Llegada)
        }));

        console.log('🔍 Debug - Unidades por ruta:', JSON.stringify(items, null, 2));

        if (!items.length) {
            const [spRows]: any = await conn.query('CALL sp_unidades_por_ruta(?)', [idRuta]);
            const spData = normalizeCallResult(spRows);
            if (spData.length) {
                const fallbackItems = spData.map((r: any) => ({
                    idViaje: r.idViaje ?? r.Id_Viaje_PK,
                    idUnidad: r.idUnidad ?? r.Id_Unidad_PK,
                    unidad: r.unidad ?? `${r.Numero_Placa} - ${r.Marca_Unidad}`,
                    horaSalida: formatHora(r.Hora_Salida),
                    horaLlegada: formatHora(r.Hora_Estimada_Llegada)
                }));
                return NextResponse.json({ items: fallbackItems }, { status: 200 });
            }
            return NextResponse.json({ error: 'No se encontraron unidades para esta ruta' }, { status: 404 });
        }

        return NextResponse.json({ items }, { status: 200 });
    } catch (e: any) {
        console.error('❌ Error al obtener unidades por ruta:', e);
        return NextResponse.json({ error: e?.sqlMessage || e?.message || 'Error al obtener unidades por ruta' }, { status: 500 });
    } finally {
        conn.release();
    }
}
