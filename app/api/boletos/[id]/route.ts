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
  console.error(`❌ API Error (${status}):`, message, extra || '');
  return json(
    { ok: false, error: message, ...(extra ? { detail: extra } : {}) },
    status
  );
}

/* ========== GET /api/boletos/[id] ========== */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id || isNaN(id)) return jsonError('ID de boleto inválido', 400);

  const conn = await db.getConnection();
  try {
    const [resultSets]: any = await conn.query(`CALL mydb.sp_ticket_obtener(?);`, [id]);
    const result = Array.isArray(resultSets) ? resultSets[0] : [];
    const ticket = result?.[0];

    if (!ticket) return jsonError('Boleto no encontrado', 404);

    return json({ ok: true, item: ticket }, 200);
  } catch (e: any) {
    return jsonError(e?.sqlMessage || e?.message || 'Error al obtener boleto', 500);
  } finally {
    conn.release();
  }
}

/* ========== PUT /api/boletos/[id] ========== */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id || isNaN(id)) return jsonError('ID inválido', 400);

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
    await conn.query(`CALL mydb.sp_ticket_actualizar(?,?,?,?,?,?,?,?,?);`, [
      id,
      Fecha_Hora_Compra,
      Precio_Total,
      Id_Viaje_FK,
      Id_Cliente_FK,
      Id_PuntoVenta_FK,
      Id_MetodoPago_FK,
      Id_EstadoTicket_FK,
      Id_Asiento_FK,
    ]);

    return json({ ok: true, message: 'Ticket actualizado correctamente' }, 200);
  } catch (e: any) {
    return jsonError(e?.sqlMessage || e?.message || 'Error al actualizar boleto', 500);
  } finally {
    conn.release();
  }
}

/* ========== DELETE /api/boletos/[id] ========== */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id || isNaN(id)) return jsonError('ID inválido', 400);

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const Id_UsuarioAdmin = Number(body.Id_UsuarioAdmin ?? 1);

  const conn = await db.getConnection();
  try {
    console.log(`🗑️ Eliminando boleto ${id} por usuario admin ${Id_UsuarioAdmin}`);

    const [rows]: any = await conn.query(`CALL mydb.sp_ticket_eliminar(?, ?);`, [
      id,
      Id_UsuarioAdmin,
    ]);

    // Si el SP devuelve un SELECT final con info, muéstralo
    const result = Array.isArray(rows?.[0]) ? rows[0][0] : null;

    return json(
      {
        ok: true,
        message:
          result?.mensaje || `Ticket #${id} eliminado correctamente.`,
        result,
      },
      200
    );
  } catch (e: any) {
    return jsonError(
      e?.sqlMessage || e?.message || 'Error al eliminar boleto',
      500,
      e
    );
  } finally {
    conn.release();
  }
}
