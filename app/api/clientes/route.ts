import { NextResponse } from 'next/server';
import { getSafeConnection } from '@/lib/db_api';

export const runtime = 'nodejs';

/* ===== GET: listar todos los clientes ===== */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const estado = url.searchParams.get('estado'); // puede ser Activo, Inactivo o null

  const conn = await getSafeConnection();
  try {
    const query = `
      SELECT 
        c.Id_Cliente_PK AS id,
        c.Id_Persona_FK AS id_persona,
        COALESCE(
          NULLIF(CONCAT_WS(' ', p.Nombres, p.Apellidos), ' '),
          p.Nombres,
          p.Apellidos,
          ''
        ) AS nombre,
        c.Estado
      FROM TBL_CLIENTES c
      LEFT JOIN TBL_PERSONAS p ON p.Id_Persona_PK = c.Id_Persona_FK
      ${estado && estado !== 'Todos' ? 'WHERE c.Estado = ?' : ''}
      ORDER BY nombre ASC
      LIMIT 500
    `;

    const [rows]: any = await conn.query(query, estado && estado !== 'Todos' ? [estado] : []);

   return new Response(JSON.stringify({ items: rows }, null, 2), {
  status: 200,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
});

  } catch (err: any) {
    console.error('❌ GET /api/clientes:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    conn.release();
  }
}


/* ===== POST: crear nuevo cliente ===== */
export async function POST(req: Request) {
  const { Id_Persona_FK, Estado } = await req.json();

  if (!Id_Persona_FK || !Estado)
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });

  const conn = await getSafeConnection();
  try {
    // 🔹 Asignar rol Cliente automáticamente
    await conn.query(
      `UPDATE TBL_MS_USUARIO
       SET Id_Rol_FK = 3
       WHERE Id_Persona_FK = ? AND Id_Rol_FK != 3`,
      [Id_Persona_FK]
    );

    // 🔹 Llamar al SP para crear cliente
    const [result]: any = await conn.query(
      'CALL mydb.sp_clientes_crear(?, ?)',
      [Id_Persona_FK, Estado]
    );

    const resRow = Array.isArray(result[0]) ? result[0][0] : result[0];

    return NextResponse.json(
      { message: 'Cliente creado correctamente', result: resRow },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('❌ POST /api/clientes:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    conn.release();
  }
}
