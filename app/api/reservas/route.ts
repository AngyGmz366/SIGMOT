// /app/api/reservas/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

function normalizeCallResult(rows: any): any[] {
  if (Array.isArray(rows)) {
    if (Array.isArray(rows[0])) return rows[0]; // típico CALL devuelve [[rows], [fields]]
    if (rows.length && typeof rows[0] === 'object' && !('affectedRows' in rows[0])) return rows;
  }
  return [];
}
const upperOrNull = (v?: string | null) => (v ? String(v).toUpperCase() : null);
const lower = (v: any) => (v ?? '').toString().toLowerCase();

function mapRow(r: any) {
  return {
    id: String(r.Id_Reserva_PK),
    idCliente: r.IdCliente,
    cliente: r.Cliente,
    tipo: lower(r.Tipo),        // 'viaje' | 'encomienda'
    ruta: r.Ruta,
    unidad: r.Unidad,
    estado: lower(r.Estado),    // 'pendiente' | 'confirmada' | 'cancelada'
    fecha: r.Fecha_Reserva,
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get('limit')) || 10;
  const offset = Number(url.searchParams.get('offset')) || 0;
  const estado = upperOrNull(url.searchParams.get('estado')); // PENDIENTE/CONFIRMADA/CANCELADA
  const tipo = upperOrNull(url.searchParams.get('tipo'));     // VIAJE/ENCOMIENDA

  const conn = await db.getConnection();
  try {
    const [rows]: any = await conn.query('CALL sp_reserva_listar(?,?,?,?)', [limit, offset, estado, tipo]);
    const items = normalizeCallResult(rows).map(mapRow);
    return NextResponse.json({ items }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.sqlMessage || e?.message || 'Error' }, { status: 500 });
  } finally {
    conn.release();
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const tipo = upperOrNull(body?.tipo);    // VIAJE | ENCOMIENDA
  const correo = body?.correo as string;
  const fecha = body?.fecha ? new Date(body.fecha) : new Date();

  if (tipo !== 'VIAJE' && tipo !== 'ENCOMIENDA') {
    return NextResponse.json({ error: 'tipo debe ser VIAJE o ENCOMIENDA' }, { status: 400 });
  }
  if (!correo) {
    return NextResponse.json({ error: 'correo es obligatorio' }, { status: 400 });
  }

  const conn = await db.getConnection();
  try {
    await conn.query('SET @out := NULL');

    if (tipo === 'VIAJE') {
      const idViaje = Number(body?.id_viaje);
      if (!Number.isFinite(idViaje)) {
        return NextResponse.json({ error: 'id_viaje es obligatorio y numérico' }, { status: 400 });
      }
      await conn.query('CALL sp_reserva_crear_viaje_por_correo(?,?,?,@out)', [correo, idViaje, fecha]);
    } else {
      const idEncomienda = Number(body?.id_encomienda);
      if (!Number.isFinite(idEncomienda)) {
        return NextResponse.json({ error: 'id_encomienda es obligatorio y numérico' }, { status: 400 });
      }
      await conn.query('CALL sp_reserva_crear_encomienda_por_correo(?,?,?,@out)', [correo, idEncomienda, fecha]);
    }

    const [outRows]: any = await conn.query('SELECT @out AS id');
    const id = outRows?.[0]?.id ?? null;
    return NextResponse.json({ id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.sqlMessage || e?.message || 'Error' }, { status: 500 });
  } finally {
    conn.release();
  }
}
