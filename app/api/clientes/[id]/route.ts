import { NextResponse } from 'next/server';
import { getSafeConnection } from '@/lib/db_api';

export const runtime = 'nodejs';

/* ===== Helper: respuesta formateada ===== */
function jsonResponse(data: any, status = 200) {
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    return new Response(JSON.stringify(data, null, 2), {
      status,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
  return NextResponse.json(data, { status });
}

/* ============================================
   🔹 GET: obtener cliente por ID
============================================ */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id) return jsonResponse({ error: 'Id inválido' }, 400);

  const conn = await getSafeConnection();
  try {
    const [rows]: any = await conn.query(
      `SELECT 
        c.Id_Cliente_PK AS id,
        c.Id_Persona_FK AS id_persona,
        p.Nombres,
        p.Apellidos,
        p.DNI,
        p.Telefono,
        co.Correo AS correo_electronico,
        e.Estado_Cliente AS estado,
        e.Id_EstadoCliente_PK AS id_estado_cliente
      FROM TBL_CLIENTES c
      JOIN TBL_PERSONAS p ON c.Id_Persona_FK = p.Id_Persona_PK
      LEFT JOIN TBL_CORREOS co ON p.Id_Correo_FK = co.Id_Correo_PK
      JOIN TBL_ESTADO_CLIENTE e ON e.Id_EstadoCliente_PK = c.Id_EstadoCliente_FK
      WHERE c.Id_Cliente_PK = ?
      LIMIT 1`,
      [id]
    );

    if (!rows.length) return jsonResponse({ error: 'Cliente no encontrado' }, 404);
    return jsonResponse({ item: rows[0] }, 200);
  } catch (err: any) {
    console.error('❌ GET /api/clientes/[id]', err);
    return jsonResponse({ error: err.message || 'Error interno' }, 500);
  } finally {
    conn.release();
  }
}

/* ============================================
   🔹 PUT: actualizar estado del cliente
============================================ */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json().catch(() => ({}));
  const { Id_EstadoCliente_FK } = body;

  if (!id || !Id_EstadoCliente_FK)
    return jsonResponse({ error: 'Campos requeridos faltantes' }, 400);

  const conn = await getSafeConnection();
  try {
    const [result]: any = await conn.query(
      `CALL mydb.sp_clientes_actualizar(?, ?)`,
      [id, Id_EstadoCliente_FK]
    );

    const msg =
      Array.isArray(result[0]) && result[0][0]?.Mensaje
        ? result[0][0].Mensaje
        : 'Cliente actualizado correctamente';

    return jsonResponse({ message: msg }, 200);
  } catch (err: any) {
    console.error('❌ PUT /api/clientes/[id]', err);
    return jsonResponse({ error: err.sqlMessage || err.message }, 500);
  } finally {
    conn.release();
  }
}

/* ============================================
   🔹 DELETE: desactivar cliente (soft delete)
============================================ */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id || id <= 0) return jsonResponse({ error: 'Id inválido' }, 400);

  const conn = await getSafeConnection();
  try {
    const [result]: any = await conn.query(`CALL mydb.sp_clientes_desactivar(?)`, [id]);

    const msg =
      Array.isArray(result[0]) && result[0][0]?.Mensaje
        ? result[0][0].Mensaje
        : 'Cliente desactivado correctamente';

    return jsonResponse({ message: msg }, 200);
  } catch (err: any) {
    console.error('❌ DELETE /api/clientes/[id]', err);
    return jsonResponse({ error: err.sqlMessage || err.message }, 500);
  } finally {
    conn.release();
  }
}
