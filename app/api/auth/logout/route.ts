export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

/**
 * Cierra sesión del usuario (local o Firebase)
 * -------------------------------------------------------------
 * - Decodifica token JWT de la cookie app_token
 * - Determina el ID real del usuario
 * - Ejecuta sp_cerrar_sesion en la BD
 * - Elimina cookie y limpia sesión cliente
 */
export async function POST(req: Request) {
  const conn = await db.getConnection();

  try {
    // 1️⃣ Obtener cookie con el token JWT
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/app_token=([^;]+)/);

    if (!match) {
      return NextResponse.json({ ok: false, message: 'No hay sesión activa' }, { status: 401 });
    }

    const token = match[1];

    // 2️⃣ Decodificar token JWT
    const decoded: any = jwt.verify(token, process.env.APP_JWT_SECRET!);
    const uid = decoded?.uid ?? null;

    if (!uid) {
      throw new Error('Token inválido o expirado');
    }

    // 3️⃣ Buscar el ID numérico en BD (soporta Firebase o login local)
    const [rows]: any = await conn.query(
      'SELECT Id_Usuario_PK FROM mydb.TBL_MS_USUARIO WHERE Firebase_UID = ? OR Id_Usuario_PK = ? LIMIT 1',
      [uid, uid]
    );

    const usuario = rows?.[0];
    if (!usuario) {
      throw new Error('Usuario no encontrado en la base de datos');
    }

    const idUsuario = usuario.Id_Usuario_PK;
    const ID_OBJETO_LOGIN_SEGURIDAD = 2; // Ajusta al ID real en tu tabla de objetos

    // 4️⃣ Llamar SP de cierre de sesión (bitácora)
    await conn.query('CALL mydb.sp_cerrar_sesion(?, ?)', [
      idUsuario,
      ID_OBJETO_LOGIN_SEGURIDAD,
    ]);

    // 5️⃣ Cerrar sesión Firebase (solo si aplica)
    try {
      await signOut(auth);
    } catch {
      // Si no estaba autenticado en Firebase, no pasa nada
    }

    // 6️⃣ Respuesta y limpieza de cookie
    const res = NextResponse.json({
      ok: true,
      message: 'Sesión cerrada correctamente y registrada en bitácora',
    });

    // 🔹 Eliminar cookie JWT
    res.cookies.set('app_token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });

    // 🔹 Instrucción para limpiar storage del cliente
    res.headers.set('Clear-Client-Storage', 'true');

    return res;
  } catch (e: any) {
    console.error('Error en cierre de sesión:', e);
    return NextResponse.json(
      { ok: false, error: e.message, detalle: e.sqlMessage || null },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
