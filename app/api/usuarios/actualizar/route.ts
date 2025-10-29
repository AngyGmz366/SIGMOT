import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * 📄 PUT /api/usuarios/actualizar
 * Actualiza la información de un usuario (datos personales, rol, estado, foto).
 */
export async function PUT(req: Request) {
  let conn;
  try {
    const {
      idUsuario,
      nombres,
      apellidos,
      correo,
      telefono,
      idRol,
      idEstado,
      fotoPerfil,
      idAdmin
    } = await req.json();

    if (!idUsuario || !nombres || !apellidos || !correo || !idRol || !idEstado) {
      return NextResponse.json(
        { ok: false, error: 'Faltan campos obligatorios.' },
        { status: 400 }
      );
    }

    conn = await db.getConnection();
    await conn.query(
      'CALL mydb.sp_ms_usuario_actualizar(?, ?, ?, ?, ?, ?, ?, ?, ?);',
      [idUsuario, nombres, apellidos, correo, telefono, idRol, idEstado, fotoPerfil || null, idAdmin || 1]
    );

    return NextResponse.json({
      ok: true,
      message: 'Usuario actualizado correctamente.'
    });
  } catch (error: any) {
    console.error('❌ Error en PUT /api/usuarios/actualizar:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}
