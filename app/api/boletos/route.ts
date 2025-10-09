// app/api/boletos/route.ts
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

/* ================== GET ================== */
export async function GET(req: Request) {
  const conn = await db.getConnection();
  try {
    const [resultSets]: any = await conn.query('CALL mydb.sp_ticket_listar(?, ?)', [100, 0]);
    const rows = Array.isArray(resultSets[0]) ? resultSets[0] : resultSets;
    return json({ items: rows }, 200);
  } catch (e: any) {
    console.error('❌ GET /api/boletos:', e?.sqlMessage || e?.message);
    return jsonError(e?.sqlMessage || e?.message, 500);
  } finally {
    conn.release();
  }
}



/* ===== POST /api/boletos ===== */
export async function POST(req: Request) {
  const conn = await db.getConnection();
  try {
    const body = await req.json().catch(() => ({}));

    // ⚙️ Siempre usar fecha del servidor (ignorar la del body)
    const Fecha_Hora_Compra = new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    const Precio_Total = Number(body.Precio_Total ?? 0);
    const Id_Viaje_FK = Number(body.Id_Viaje_FK) || null;
    const Id_Cliente_FK = Number(body.Id_Cliente_FK) || null;
    const Id_PuntoVenta_FK = Number(body.Id_PuntoVenta_FK) || 1;
    const Id_MetodoPago_FK = Number(body.Id_MetodoPago_FK) || null;

    // 🚫 Restringir estados no válidos en creación
    let Id_EstadoTicket_FK = Number(body.Id_EstadoTicket_FK) || 1; // 1 = Vendido
    const ESTADOS_INVALIDOS = [3, 4]; // ejemplo: 3=Cancelado, 4=Reembolsado
    if (ESTADOS_INVALIDOS.includes(Id_EstadoTicket_FK)) {
      Id_EstadoTicket_FK = 1;
    }

    // ✅ Validaciones mínimas
    if (!Id_Viaje_FK || !Id_Cliente_FK || !Id_MetodoPago_FK) {
      return new Response(JSON.stringify({ error: 'Faltan campos requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 📦 Ejecutar SP
    const [rsets]: any = await conn.query(
      'CALL mydb.sp_ticket_crear(?,?,?,?,?,?,?)',
      [
        Fecha_Hora_Compra,
        Precio_Total,
        Id_Viaje_FK,
        Id_Cliente_FK,
        Id_PuntoVenta_FK,
        Id_MetodoPago_FK,
        Id_EstadoTicket_FK,
      ]
    );

    const result =
      Array.isArray(rsets) && Array.isArray(rsets[0]) ? rsets[0][0] : rsets[0] || null;

    // Consumir resultsets extra
    await conn.query('DO 1');

    return new Response(
      JSON.stringify({
        message: 'Ticket creado correctamente',
        result: result ?? { success: true },
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    console.error('❌ POST /api/boletos:', e?.sqlMessage || e?.message);
    return new Response(
      JSON.stringify({ error: e?.sqlMessage || e?.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    conn.release();
  }
}

/* ===== PUT /api/boletos/:id ===== */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id) {
    return new Response(JSON.stringify({ error: 'Id inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const conn = await db.getConnection();
  try {
    const body = await req.json().catch(() => ({}));

    const Fecha_Hora_Compra =
      body.Fecha_Hora_Compra ||
      new Date().toISOString().slice(0, 19).replace('T', ' ');
    const Precio_Total = Number(body.Precio_Total ?? 0);
    const Id_Viaje_FK = Number(body.Id_Viaje_FK) || null;
    const Id_Cliente_FK = Number(body.Id_Cliente_FK) || null;
    const Id_PuntoVenta_FK = Number(body.Id_PuntoVenta_FK) || 1;
    const Id_MetodoPago_FK = Number(body.Id_MetodoPago_FK) || null;

    let Id_EstadoTicket_FK = Number(body.Id_EstadoTicket_FK) || 1;
    const ESTADOS_INVALIDOS = [999]; // Ejemplo si agregas más
    if (ESTADOS_INVALIDOS.includes(Id_EstadoTicket_FK)) {
      Id_EstadoTicket_FK = 1;
    }

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

    return new Response(
      JSON.stringify({
        message: 'Ticket actualizado correctamente',
        result: { Id_Ticket_PK: id },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    console.error('❌ PUT /api/boletos:', e?.sqlMessage || e?.message);
    return new Response(
      JSON.stringify({ error: e?.sqlMessage || e?.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    conn.release();
  }
}


/* ================== DELETE ================== */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id) return jsonError('Id inválido', 400);
  const conn = await db.getConnection();
  try {
    await conn.query('CALL mydb.sp_ticket_eliminar(?)', [id]);
    return json({ message: 'Ticket eliminado', id }, 200);
  } catch (e: any) {
    console.error('❌ DELETE /api/boletos:', e?.sqlMessage || e?.message);
    return jsonError(e?.sqlMessage || e?.message, 500);
  } finally {
    conn.release();
  }
}
