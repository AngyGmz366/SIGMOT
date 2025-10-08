export const runtime = 'nodejs';
import { db } from '@/lib/db_api';

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
function jsonError(message: string, status = 500, extra?: any) {
  return json({ error: message, ...(extra ? { detail: extra } : {}) }, status);
}

/* ===== Query de boleto con JOINs ===== */
const SELECT_TICKET_BASE = `
SELECT 
  t.Id_Ticket_PK,
  t.Codigo_Ticket,
  t.Fecha_Hora_Compra,
  t.Precio_Total,

  -- 🔹 FKs
  t.Id_Viaje_FK,
  t.Id_Cliente_FK,
  t.Id_PuntoVenta_FK,
  t.Id_MetodoPago_FK,
  t.Id_EstadoTicket_FK,

  -- 🔹 Datos descriptivos
  r.Origen,
  r.Destino,
  DATE_FORMAT(v.Hora_Salida, '%H:%i') AS Hora_Salida,
  CONCAT_WS(' ', p.Nombres, p.Apellidos) AS Cliente,
  p.DNI       AS Cedula,
  p.Telefono  AS Telefono,
  m.Metodo_Pago   AS MetodoPago,
  e.Estado_Ticket AS Estado,
  pv.Nombre_Punto AS PuntoVenta
FROM TBL_TICKET t
LEFT JOIN TBL_VIAJES v        ON v.Id_Viaje_PK        = t.Id_Viaje_FK
LEFT JOIN TBL_RUTAS r         ON r.Id_Ruta_PK         = v.Id_Rutas_FK
LEFT JOIN TBL_CLIENTES c      ON c.Id_Cliente_PK      = t.Id_Cliente_FK
LEFT JOIN TBL_PERSONAS p      ON p.Id_Persona_PK      = c.Id_Persona_FK
LEFT JOIN TBL_PUNTO_VENTA pv  ON pv.Id_PuntoVenta_PK  = t.Id_PuntoVenta_FK
LEFT JOIN TBL_METODO_PAGO m   ON m.Id_MetodoPago_PK   = t.Id_MetodoPago_FK
LEFT JOIN TBL_ESTADO_TICKET e ON e.Id_EstadoTicket_PK = t.Id_EstadoTicket_FK
WHERE t.Id_Ticket_PK = ?
`;

/* ===== Query de asientos del boleto ===== */
const SELECT_ASIENTOS = `
SELECT 
  ta.Id_TicketAsiento_PK,
  ta.Id_Ticket_FK,
  ta.Id_Viaje_FK,
  ta.Id_Asiento_FK,
  a.Numero_Asiento,
  a.Id_Unidad_FK,
  ta.Id_EstadoAsiento_FK
FROM TBL_TICKET_ASIENTO ta
JOIN TBL_ASIENTOS a ON a.Id_Asiento_PK = ta.Id_Asiento_FK
WHERE ta.Id_Ticket_FK = ?
`;

/* ===== GET /api/boletos/[id] ===== */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id) return jsonError('Id inválido', 400);

  const conn = await db.getConnection();
  try {
    console.log('🔎 GET boleto por id:', id);
    const [tickets]: any = await conn.query(SELECT_TICKET_BASE, [id]);
    const ticket = tickets?.[0];
    if (!ticket) return jsonError('Boleto no encontrado', 404);

    const [asientos]: any = await conn.query(SELECT_ASIENTOS, [id]);
    ticket.asientos = asientos || [];

    return json({ item: ticket }, 200);
  } catch (e: any) {
    console.error('❌ GET /api/boletos/[id]:', e?.sqlMessage || e?.message, { id });
    return jsonError(e?.sqlMessage || e?.message || 'Error al obtener boleto', 500);
  } finally {
    conn.release();
  }
}




/* ===== DELETE /api/boletos/:id ===== */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const boletoId = Number(params.id);

  if (!boletoId || isNaN(boletoId)) {
    return jsonError("Id de boleto inválido", 400);
  }

  const conn = await db.getConnection();
  try {
    await conn.query(`CALL mydb.sp_ticket_eliminar(?)`, [boletoId]);

    return json(
      {
        message: "Ticket eliminado",
        result: { Id_Ticket_PK: boletoId },
      },
      200
    );
  } catch (e: any) {
    console.error("❌ Error en DELETE /boletos/[id]:", e);
    return jsonError(
      e?.sqlMessage || e?.message || "Error al eliminar ticket",
      500
    );
  } finally {
    conn.release();
  }
}




/* ===== PUT /api/tickets/:id ===== */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id) return jsonError('Id inválido', 400);

  const body = await req.json().catch(() => ({}));
  const {
    Fecha_Hora_Compra,
    Precio_Total,
    Id_Viaje_FK,
    Id_Cliente_FK,
    Id_PuntoVenta_FK,
    Id_MetodoPago_FK,
    Id_EstadoTicket_FK,
  } = body || {};

  const conn = await db.getConnection();
  try {
    await conn.query(`CALL mydb.sp_ticket_actualizar(?,?,?,?,?,?,?,?)`, [
      id,
      Fecha_Hora_Compra,
      Precio_Total,
      Id_Viaje_FK,
      Id_Cliente_FK,
      Id_PuntoVenta_FK,
      Id_MetodoPago_FK,
      Id_EstadoTicket_FK,
    ]);

    return json({ message: 'Ticket actualizado', result: { Id_Ticket_PK: id } }, 200);
  } catch (e: any) {
    return jsonError(e?.sqlMessage || e?.message || 'Error al actualizar', 500);
  } finally {
    conn.release();
  }
}
