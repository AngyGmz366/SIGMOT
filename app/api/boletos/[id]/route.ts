export const runtime = 'nodejs';
import { db } from '@/lib/db_api';

/* ===== Helpers ===== */
function json(data: any, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
function jsonError(message: string, status = 500, extra?: any) {
  return json({ ok: false, error: message, ...(extra ? { detail: extra } : {}) }, status);
}

/* ================== GET /api/boletos/[id] ================== */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id || isNaN(id)) return jsonError('Id inválido', 400);

  const conn = await db.getConnection();
  try {
    const [resultSets]: any = await conn.query(`CALL mydb.sp_ticket_obtener(?);`, [id]);
    const result = Array.isArray(resultSets) ? resultSets[0] : [];
    const ticket = result?.[0];
    if (!ticket) return jsonError('Boleto no encontrado', 404);

    return json({ ok: true, item: ticket }, 200);
  } catch (e: any) {
    console.error('❌ GET /boletos/[id]:', e?.sqlMessage || e?.message);
    return jsonError(e?.sqlMessage || e?.message || 'Error al obtener boleto', 500);
  } finally {
    conn.release();
  }
}

/* ================== PUT /api/boletos/[id] ================== */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id || isNaN(id)) return jsonError('Id inválido', 400);

  const body = await req.json().catch(() => ({}));
  const {
    Fecha_Hora_Compra,
    Precio_Total,
    Id_Viaje_FK,
    Id_Cliente_FK,
    Id_PuntoVenta_FK,
    Id_MetodoPago_FK,
    Id_EstadoTicket_FK,
    Id_Asiento_FK,
  } = body || {};

  const conn = await db.getConnection();
  try {
    await conn.query(
      `CALL mydb.sp_ticket_actualizar(?,?,?,?,?,?,?,?,?);`,
      [
        id,
        Fecha_Hora_Compra,
        Precio_Total,
        Id_Viaje_FK,
        Id_Cliente_FK,
        Id_PuntoVenta_FK,
        Id_MetodoPago_FK,
        Id_EstadoTicket_FK,
        Id_Asiento_FK,
      ]
    );

    return json({ ok: true, message: 'Ticket actualizado correctamente', result: { Id_Ticket_PK: id } }, 200);
  } catch (e: any) {
    console.error('❌ PUT /boletos/[id]:', e?.sqlMessage || e?.message);
    return jsonError(e?.sqlMessage || e?.message || 'Error al actualizar ticket', 500);
  } finally {
    conn.release();
  }
}

/* ================== DELETE /api/boletos/[id] ================== */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id || isNaN(id)) return jsonError('Id inválido', 400);

  // 👉 Puedes obtener el usuario admin del body o del token
  const body = await req.json().catch(() => ({}));
  const Id_UsuarioAdmin = Number(body.Id_UsuarioAdmin ?? 1); // usa 1 por defecto si no se envía

  const conn = await db.getConnection();
  try {
    await conn.query(`CALL mydb.sp_ticket_eliminar(?, ?);`, [id, Id_UsuarioAdmin]);
    return json(
      { ok: true, message: 'Ticket eliminado correctamente', result: { Id_Ticket_PK: id } },
      200
    );
  } catch (e: any) {
    console.error('❌ DELETE /boletos/[id]:', e?.sqlMessage || e?.message);
    return jsonError(e?.sqlMessage || e?.message || 'Error al eliminar ticket', 500);
  } finally {
    conn.release();
  }
}
