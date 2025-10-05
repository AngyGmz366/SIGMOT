export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

/**
 * Cierra sesión del usuario:
 * - Decodifica el token JWT
 * - Llama al procedimiento sp_cerrar_sesion
 * - Elimina la cookie app_token
 */
export async function POST(req: Request) {
  const conn = await db.getConnection();

  try {
    // 1️⃣ Obtener cookie con el token
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/app_token=([^;]+)/);

    if (!match) {
      return NextResponse.json({ ok: false, message: 'No hay sesión activa' }, { status: 401 });
    }

    const token = match[1];

    // 2️⃣ Decodificar token JWT
    const decoded: any = jwt.verify(token, process.env.APP_JWT_SECRET!);
    const idUsuario = decoded?.uid ?? null;

    if (!idUsuario) {
      throw new Error('Token inválido o expirado');
    }

    // 3️⃣ Llamar al procedimiento en MySQL
    const ID_OBJETO_LOGIN_SEGURIDAD = 1; // Ajusta al ID real en TBL_MS_OBJETOS
    await conn.query('CALL sp_cerrar_sesion(?, ?)', [idUsuario, ID_OBJETO_LOGIN_SEGURIDAD]);

    // 4️⃣ Eliminar cookie y devolver respuesta
    const res = NextResponse.json({
      ok: true,
      message: 'Sesión cerrada correctamente y registrada en bitácora',
    });

    res.cookies.set('app_token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });

    return res;
  } catch (e: any) {
    console.error('❌ Error en cierre de sesión:', e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  } finally {
    conn.release();
  }
}
