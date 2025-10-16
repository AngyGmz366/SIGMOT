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

/* ================================
   🔹 GET: obtener cliente por ID
================================ */
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
        c.Estado
      FROM TBL_CLIENTES c
      JOIN TBL_PERSONAS p ON c.Id_Persona_FK = p.Id_Persona_PK
      LEFT JOIN TBL_CORREOS co ON p.Id_Correo_FK = co.Id_Correo_PK
      WHERE c.Id_Cliente_PK = ?
      LIMIT 1`,
      [id]
    );

    if (!rows.length) return jsonResponse({ error: 'Cliente no encontrado' }, 404);

    return jsonResponse({ item: rows[0] }, 200);
  } catch (err: any) {
    console.error('❌ GET /api/clientes/[id]', err);
    return jsonResponse({ error: err.message }, 500);
  } finally {
    conn.release();
  }
}

/* ================================
   🔹 PUT: actualizar cliente
================================ */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const { Estado } = await req.json();

  if (!id || !Estado)
    return jsonResponse({ error: 'Campos requeridos faltantes' }, 400);

  const conn = await getSafeConnection();
  try {
    const [result]: any = await conn.query(
      'CALL mydb.sp_clientes_actualizar(?, ?)',
      [id, Estado]
    );
    const resRow = Array.isArray(result[0]) ? result[0][0] : result[0];
    return jsonResponse(
      { message: resRow?.Mensaje || 'Cliente actualizado correctamente' },
      200
    );
  } catch (err: any) {
    console.error('❌ PUT /api/clientes/[id]', err);
    return jsonResponse({ error: err.message }, 500);
  } finally {
    conn.release();
  }
}

/* ================================
   🔹 DELETE: desactivar cliente (soft delete)
================================ */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id || id <= 0) return jsonResponse({ error: 'Id inválido' }, 400);

  const conn = await getSafeConnection();
  try {
    const [result]: any = await conn.query('CALL mydb.sp_clientes_desactivar(?)', [id]);
    const resRow = Array.isArray(result[0]) ? result[0][0] : result[0];

    return jsonResponse(
      { message: resRow?.Mensaje || 'Cliente desactivado correctamente' },
      200
    );
  } catch (err: any) {
    const mysqlMsg = err?.sqlMessage || err?.message || 'Error interno del servidor';
    console.error('❌ DELETE /api/clientes/[id]', mysqlMsg);
    return jsonResponse({ error: mysqlMsg }, 500);
  } finally {
    conn.release();
  }
}
