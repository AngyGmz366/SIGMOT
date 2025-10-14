// /app/api/reservas/[id]/route.ts
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

const upperOrNull = (v?: string | null) => (v ? String(v).toUpperCase() : null);
const lower = (v: any) => (v ?? '').toString().toLowerCase();
const mapRow = (r: any) => ({
  id: r.Id_Reserva_PK,
  idCliente: r.IdCliente,
  cliente: r.Cliente,
  tipo: lower(r.Tipo),
  ruta: r.Ruta,
  unidad: r.Unidad,
  asiento_peso: r.Asiento_Peso,
  estado: lower(r.Estado),
  fecha: r.Fecha_Reserva,
});

// ==============================
//  GET /api/reservas/[id]
// ==============================
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'id inválido' }, { status: 400 });
  }

  const conn = await db.getConnection();
  try {
    const [rows]: any = await conn.query(
      `SELECT * FROM VW_ADMIN_RESERVAS WHERE Id_Reserva_PK = ? LIMIT 1;`,
      [id]
    );
    const data = normalizeCallResult(rows);
    if (!data?.length) {
      return NextResponse.json({ error: 'No existe la reservación' }, { status: 404 });
    }
    return NextResponse.json(mapRow(data[0]), { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.sqlMessage || e?.message || 'Error' }, { status: 500 });
  } finally {
    conn.release();
  }
}

// ==============================
//  PUT /api/reservas/[id]
// ==============================
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'id inválido' }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const idCliente    = body?.id_cliente ?? null;
  const idViaje      = body?.id_viaje ?? null;
  const idEncomienda = body?.id_encomienda ?? null;
  const idAsiento    = body?.id_asiento ?? null;   // 🆕 nuevo
  const costo        = body?.costo ?? null;        // 🆕 nuevo
  const fecha        = body?.fecha ? new Date(body.fecha) : null;
  const estado       = upperOrNull(body?.estado); // PENDIENTE/CONFIRMADA/CANCELADA
  const tipo         = upperOrNull(body?.tipo);   // VIAJE/ENCOMIENDA

  // Validaciones
  if (tipo !== 'VIAJE' && tipo !== 'ENCOMIENDA') {
    return NextResponse.json({ error: 'tipo debe ser VIAJE o ENCOMIENDA' }, { status: 400 });
  }
  if (tipo === 'VIAJE' && idViaje == null) {
    return NextResponse.json({ error: 'id_viaje es obligatorio cuando tipo=VIAJE' }, { status: 400 });
  }
  if (tipo === 'ENCOMIENDA' && idEncomienda == null) {
    return NextResponse.json({ error: 'id_encomienda es obligatorio cuando tipo=ENCOMIENDA' }, { status: 400 });
  }

  const conn = await db.getConnection();
  try {
    await conn.query(
      `CALL sp_reserva_actualizar(?,?,?,?,?,?,?,?,?)`,
      [id, idCliente, idViaje, idEncomienda, idAsiento, costo, fecha, estado, tipo]
    );
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.sqlMessage || e?.message || 'Error al actualizar reservación' },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}

// ==============================
//  DELETE /api/reservas/[id]
// ==============================
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'id inválido' }, { status: 400 });
  }

  const conn = await db.getConnection();
  try {
    await conn.query('CALL sp_reserva_eliminar(?)', [id]);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.sqlMessage || e?.message || 'Error al eliminar reservación' },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}

