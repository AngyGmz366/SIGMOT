import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ✅ GET: Obtener datos del perfil
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const idUsuario = Number(id);

  try {
    const [rows]: any = await db.query(
      `
      SELECT 
          p.Nombres AS nombre,
          p.Apellidos AS apellido,
          COALESCE(c.Correo, u.Correo_Electronico) AS correo,  -- ✅ usa el de PERSONAS o el del USUARIO
          p.Telefono AS telefono,
          CONCAT(
            COALESCE(d.Departamento, ''), 
            IF(d.Municipio IS NOT NULL AND d.Municipio != '', CONCAT(', ', d.Municipio), '')
          ) AS direccion,
          g.Descripcion AS genero,
          u.Foto_Perfil AS fotoPerfil,
          d.Departamento AS departamento,
          d.Municipio AS municipio,
          r.Rol AS rol  -- 👈 Trae el nombre del rol (Administrador, Usuario, etc.)
      FROM mydb.TBL_MS_USUARIO u
      INNER JOIN mydb.TBL_PERSONAS p ON u.Id_Persona_FK = p.Id_Persona_PK
      LEFT JOIN mydb.TBL_DIRECCION_PERSONA d ON p.Id_DireccionPersona_FK = d.Id_DireccionPersona_PK
      INNER JOIN mydb.TBL_CORREOS c ON p.Id_Correo_FK = c.Id_Correo_PK
      INNER JOIN mydb.TBL_GENERO g ON p.Id_Genero_FK = g.Id_Genero_PK
      INNER JOIN mydb.TBL_MS_ROLES r ON u.Id_Rol_FK = r.Id_Rol_PK  -- 🔥 unión con roles
      WHERE u.Id_Usuario_PK = ?;
      `,
      [idUsuario]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ ok: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: rows[0] });
  } catch (error: any) {
    console.error('❌ Error en GET /api/usuarios/[id]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// ✅ PUT: Actualizar datos del perfil (incluye dirección)
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const idUsuario = Number(id);
  const body = await req.json();

  try {
    // 1️⃣ Obtener el ID de la dirección asociada
    const [resDir]: any = await db.query(
      `SELECT p.Id_DireccionPersona_FK 
       FROM mydb.TBL_PERSONAS p
       INNER JOIN mydb.TBL_MS_USUARIO u ON u.Id_Persona_FK = p.Id_Persona_PK
       WHERE u.Id_Usuario_PK = ?;`,
      [idUsuario]
    );

    const idDireccion = resDir?.[0]?.Id_DireccionPersona_FK || null;

    // 2️⃣ Actualizar la persona y su usuario
    await db.query(
      `UPDATE mydb.TBL_PERSONAS p
       INNER JOIN mydb.TBL_MS_USUARIO u ON u.Id_Persona_FK = p.Id_Persona_PK
       SET 
         p.Nombres = ?, 
         p.Apellidos = ?, 
         p.Telefono = ?, 
         p.Id_Genero_FK = (SELECT Id_Genero_PK FROM mydb.TBL_GENERO WHERE Descripcion = ? LIMIT 1),
         u.Foto_Perfil = ?
       WHERE u.Id_Usuario_PK = ?;`,
      [body.nombre, body.apellido, body.telefono, body.genero, body.foto, idUsuario]
    );

    // 3️⃣ Si existe dirección, actualizarla
    if (idDireccion) {
      await db.query(
        `UPDATE mydb.TBL_DIRECCION_PERSONA 
         SET Departamento = ?, Municipio = ? 
         WHERE Id_DireccionPersona_PK = ?;`,
        [body.departamento || null, body.municipio || null, idDireccion]
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('❌ Error en PUT /api/usuarios/[id]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
