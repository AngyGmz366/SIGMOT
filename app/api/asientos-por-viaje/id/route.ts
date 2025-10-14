// /app/api/asientos-por-viaje/[id]/route.ts
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
  const idViaje = Number(params.id);
  if (!Number.isFinite(idViaje)) {
    return NextResponse.json({ error: 'ID de viaje inválido' }, { status: 400 });
  }

  const conn = await db.getConnection();
  try {
    const [rows]: any = await conn.query('CALL sp_asientos_disponibles_por_viaje(?)', [idViaje]);
    const data = normalizeCallResult(rows);

    const items = data.map((r: any) => ({
      id: r.idAsiento ?? r.Id_Asiento_PK,
      numero: r.numeroAsiento ?? r.Numero_Asiento,
    }));

    if (!items.length) {
      return NextResponse.json({ error: 'No hay asientos disponibles para este viaje' }, { status: 404 });
    }

    return NextResponse.json({ items }, { status: 200 });
  } catch (e: any) {
    console.error('❌ Error en asientos-por-viaje:', e);
    return NextResponse.json(
      { error: e?.sqlMessage || e?.message || 'Error al obtener asientos disponibles' },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}