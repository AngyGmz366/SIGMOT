import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * 📄 PUT /api/usuarios/cambiar-estado
 * Cambia el estado de un usuario (ACTIVO / INACTIVO / BLOQUEADO).
 */
export async function PUT(req: Request) {
  let conn;
  try {
    const { idUsuario, nuevoEstado, idAdmin } = await req.json();

    if (!idUsuario || !nuevoEstado) {
      return NextResponse.json(
        { ok: false, error: 'Debe enviar idUsuario y nuevoEstado.' },
        { status: 400 }
      );
    }

    conn = await db.getConnection();
    await conn.query(
      'CALL mydb.sp_ms_usuario_cambiar_estado(?, ?, ?);',
      [idUsuario, nuevoEstado, idAdmin || 1]
    );

    return NextResponse.json({
      ok: true,
      message: `Estado del usuario actualizado a ${nuevoEstado}.`
    });
  } catch (error: any) {
    console.error('❌ Error en PUT /api/usuarios/cambiar-estado:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}
