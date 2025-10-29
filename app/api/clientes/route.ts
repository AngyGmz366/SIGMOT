import { NextResponse } from 'next/server';
import { getSafeConnection } from '@/lib/db_api';

export const runtime = 'nodejs';

/* ============================================
   🔹 GET: listar todos los clientes
   Soporta ?estado=1 o ?estado=2 (FK del catálogo)
============================================ */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const estado = url.searchParams.get('estado'); // puede ser 1 (ACTIVO), 2 (INACTIVO) o null

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
        e.Estado_Cliente AS estado,
        e.Id_EstadoCliente_PK AS id_estado_cliente
      FROM TBL_CLIENTES c
      JOIN TBL_PERSONAS p ON p.Id_Persona_PK = c.Id_Persona_FK
      JOIN TBL_ESTADO_CLIENTE e ON e.Id_EstadoCliente_PK = c.Id_EstadoCliente_FK
      ${estado && estado !== 'Todos' ? 'WHERE c.Id_EstadoCliente_FK = ?' : ''}
      ORDER BY nombre ASC
      LIMIT 500
    `;

    const [rows]: any = await conn.query(
      query,
      estado && estado !== 'Todos' ? [estado] : []
    );

    return NextResponse.json({ items: rows }, { status: 200 });
  } catch (err: any) {
    console.error('❌ GET /api/clientes:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    conn.release();
  }
}

/* ============================================
   🔹 POST: crear nuevo cliente
============================================ */
export async function POST(req: Request) {
  const { Id_Persona_FK, Id_EstadoCliente_FK } = await req.json();

  if (!Id_Persona_FK || !Id_EstadoCliente_FK) {
    return NextResponse.json(
      { error: 'Faltan campos requeridos (Id_Persona_FK, Id_EstadoCliente_FK)' },
      { status: 400 }
    );
  }

  const conn = await getSafeConnection();
  try {
    // 🔹 Asegurar que la persona tenga el rol de "Cliente"
    await conn.query(
      `UPDATE TBL_MS_USUARIO
       SET Id_Rol_FK = 3
       WHERE Id_Persona_FK = ? AND Id_Rol_FK != 3`,
      [Id_Persona_FK]
    );

    // 🔹 Crear cliente usando SP
    const [result]: any = await conn.query(
      `CALL mydb.sp_clientes_crear(?, ?)`,
      [Id_Persona_FK, Id_EstadoCliente_FK]
    );

    const msg =
      Array.isArray(result[0]) && result[0][0]?.Mensaje
        ? result[0][0].Mensaje
        : 'Cliente creado correctamente';

    return NextResponse.json({ message: msg }, { status: 201 });
  } catch (err: any) {
    console.error('❌ POST /api/clientes:', err);
    return NextResponse.json({ error: err.sqlMessage || err.message }, { status: 500 });
  } finally {
    conn.release();
  }
}
