import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 🟢 GET → Lista todos los usuarios
export async function GET() {
  let conn;
  try {
    conn = await db.getConnection();
    const [rows]: any = await conn.query('CALL mydb.sp_ms_usuarios_listar();');

    // Normalizar los nombres de campos
    const usuarios = (rows[0] || []).map((u: any) => ({
      id: u.id,
      nombres: u.Nombres || '',
      apellidos: u.Apellidos || '',
      correo: u.Correo || '',
      telefono: u.Telefono || '',
      rol: u.Rol || '',
      estado: u.Estado || '',
      fechaRegistro: u.FechaRegistro || null
    }));

    return NextResponse.json({ ok: true, items: usuarios });
  } catch (error: any) {
    console.error('❌ Error en GET /api/usuarios:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}

// 🟢 POST → Crear nuevo usuario
export async function POST(req: Request) {
  let conn;
  try {
    const {
      nombres,
      apellidos,
      correo,
      telefono,
      idRol,
      idEstado,
      fotoPerfil,
      idAdmin
    } = await req.json();

    // Validación básica
    if (!nombres || !apellidos || !correo || !idRol || !idEstado) {
      return NextResponse.json({
        ok: false,
        error: 'Faltan campos obligatorios.'
      }, { status: 400 });
    }

    conn = await db.getConnection();
    await conn.query(
      'CALL mydb.sp_ms_usuario_crear(?, ?, ?, ?, ?, ?, ?, ?);',
      [nombres, apellidos, correo, telefono, idRol, idEstado, fotoPerfil || null, idAdmin || 1]
    );

    return NextResponse.json({
      ok: true,
      message: 'Usuario creado correctamente.'
    });
  } catch (error: any) {
    console.error('❌ Error en POST /api/usuarios:', error);
    return NextResponse.json({
      ok: false,
      error: error.message
    }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}
