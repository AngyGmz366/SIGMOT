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

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const idRuta = Number(params.id);
  if (!Number.isFinite(idRuta)) return NextResponse.json({ error: 'id inválido' }, { status: 400 });

  const conn = await db.getConnection();
  try {
    const [rows]: any = await conn.query('CALL sp_unidades_por_ruta(?)', [idRuta]);
    const data = normalizeCallResult(rows);
    const items = data.map((r: any) => ({
      idViaje: r.Id_Viaje_PK,
      idUnidad: r.Id_Unidad_PK,
      unidad: `${r.Numero_Placa} - ${r.Marca_Unidad}`,
      fecha: r.Fecha,
      horaSalida: r.Hora_Salida,
      horaLlegada: r.Hora_Estimada_Llegada,
    }));
    return NextResponse.json({ items }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.sqlMessage || e?.message || 'Error' }, { status: 500 });
  } finally {
    conn.release();
  }
}
