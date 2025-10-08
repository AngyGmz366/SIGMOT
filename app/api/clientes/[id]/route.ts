import { NextResponse } from 'next/server';
import { getSafeConnection } from '@/lib/db_api';

export const runtime = 'nodejs';

/* ===== Helper: respuesta bonita solo en desarrollo ===== */
function jsonResponse(data: any, status = 200) {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    // 🔹 Devuelve JSON formateado verticalmente
    return new Response(JSON.stringify(data, null, 2), {
      status,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  // 🔹 En producción usa NextResponse.json (más rápido y ligero)
  return NextResponse.json(data, { status });
}

/* ===== GET: obtener cliente por ID ===== */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id) return jsonResponse({ error: 'Id inválido' }, 400);

  const conn = await getSafeConnection();
  try {
    const [result]: any = await conn.query('CALL mydb.sp_clientes_obtener(?)', [id]);
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return jsonResponse({ item: rows?.[0] || null }, 200);
  } catch (err: any) {
    console.error('❌ GET /api/clientes/[id]', err);
    return jsonResponse({ error: err.message }, 500);
  } finally {
    conn.release();
  }
}

/* ===== PUT: actualizar cliente ===== */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const { Id_Persona_FK, Estado } = await req.json();

  if (!id || !Id_Persona_FK)
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });

  const conn = await getSafeConnection();
  try {
    const [result]: any = await conn.query(
      'CALL mydb.sp_clientes_actualizar(?, ?, ?)',
      [id, Id_Persona_FK, Estado || null]
    );

    const resRow = Array.isArray(result[0]) ? result[0][0] : result[0];

    return NextResponse.json(resRow, { status: 200 });
  } catch (err: any) {
    console.error('❌ PUT /api/clientes/[id]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    conn.release();
  }
}


/* ===== DELETE: eliminar cliente ===== */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id) return jsonResponse({ error: 'Id inválido' }, 400);

  const conn = await getSafeConnection();
  try {
    const [result]: any = await conn.query('CALL mydb.sp_clientes_eliminar(?)', [id]);
    const resRow = Array.isArray(result[0]) ? result[0][0] : result[0];

    return jsonResponse(resRow, 200); // 👈 mensaje formateado
  } catch (err: any) {
    console.error('❌ DELETE /api/clientes/[id]', err);
    return jsonResponse({ error: err.message }, 500);
  } finally {
    conn.release();
  }
}
