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

/* ================== GET ================== */
export async function GET() {
  const conn = await db.getConnection();
  try {
    const [resultSets]: any = await conn.query('CALL mydb.sp_ticket_listar(?, ?)', [100, 0]);
    const rows = Array.isArray(resultSets[0]) ? resultSets[0] : resultSets;
    return json({ ok: true, items: rows }, 200);
  } catch (e: any) {
    console.error('❌ GET /api/boletos:', e?.sqlMessage || e?.message);
    return jsonError(e?.sqlMessage || e?.message, 500);
  } finally {
    conn.release();
  }
}

/* ================== POST ================== */
export async function POST(req: Request) {
  const conn = await db.getConnection();
  try {
    const body = await req.json().catch(() => ({}));

    const Fecha_Hora_Compra = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const Precio_Total = Number(body.Precio_Total ?? 0);
    const Id_Viaje_FK = Number(body.Id_Viaje_FK);
    const Id_Cliente_FK = Number(body.Id_Cliente_FK);
    const Id_PuntoVenta_FK = Number(body.Id_PuntoVenta_FK) || 1;
    const Id_MetodoPago_FK = Number(body.Id_MetodoPago_FK);
    const Id_Asiento_FK = Number(body.Id_Asiento_FK);
    const Id_EstadoTicket_FK = Number(body.Id_EstadoTicket_FK) || 1; // Pendiente por defecto

    // ⚠️ Validación de campos obligatorios
    if (!Id_Viaje_FK || !Id_Cliente_FK || !Id_MetodoPago_FK || !Id_Asiento_FK) {
      return jsonError('Faltan campos requeridos (viaje, cliente, método o asiento)', 400);
    }

    // 🧾 Ejecutar SP
    const [resultSets]: any = await conn.query(
      'CALL mydb.sp_ticket_crear(?,?,?,?,?,?,?,?)',
      [
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

    // 🧩 Obtener resultado devuelto por el SP
    const newTicket = resultSets?.[0]?.[0] ?? {};
    const newTicketId = newTicket?.Id_Ticket_PK ?? resultSets?.insertId ?? null;
    const newCodigo = newTicket?.Codigo_Ticket ?? null;

    if (!newTicketId) throw new Error('No se pudo obtener el ID del ticket');

    // ✅ Devolver respuesta clara al frontend
    return json(
      {
        Id_Ticket_PK: newTicketId,
        Codigo_Ticket: newCodigo,
        message: 'Ticket creado correctamente',
      },
      201
    );
  } catch (e: any) {
    console.error('❌ POST /api/boletos:', e?.sqlMessage || e?.message);
    return jsonError(e?.sqlMessage || e?.message, 500);
  } finally {
    conn.release();
  }
}


/* ================== PUT ================== */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id || isNaN(id)) return jsonError('Id inválido', 400);

  const conn = await db.getConnection();
  try {
    const body = await req.json().catch(() => ({}));

    const Fecha_Hora_Compra =
      body.Fecha_Hora_Compra || new Date().toISOString().slice(0, 19).replace('T', ' ');
    const Precio_Total = Number(body.Precio_Total ?? 0);
    const Id_Viaje_FK = Number(body.Id_Viaje_FK) || null;
    const Id_Cliente_FK = Number(body.Id_Cliente_FK) || null;
    const Id_PuntoVenta_FK = Number(body.Id_PuntoVenta_FK) || 1;
    const Id_MetodoPago_FK = Number(body.Id_MetodoPago_FK) || null;
    const Id_EstadoTicket_FK = Number(body.Id_EstadoTicket_FK) || 1;
    const Id_Asiento_FK = Number(body.Id_Asiento_FK) || null;

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
    console.error('❌ PUT /api/boletos:', e?.sqlMessage || e?.message);
    return jsonError(e?.sqlMessage || e?.message, 500);
  } finally {
    conn.release();
  }
}
