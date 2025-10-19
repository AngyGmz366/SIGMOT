export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticator } from 'otplib';
import { SignJWT } from 'jose';

export async function POST(req: Request) {
  const conn = await db.getConnection();
  try {
    const { idUsuario, token } = await req.json();

    if (!idUsuario || !token) {
      return NextResponse.json(
        { ok: false, error: 'Faltan parámetros del usuario o token.' },
        { status: 400 }
      );
    }

    // 1️⃣ Obtener datos completos del usuario
    const [rows]: any = await conn.query(
      `SELECT 
          u.Id_Usuario_PK,
          u.Correo_Electronico,
          u.Firebase_UID,
          f.Secret_Base32,
          CASE 
            WHEN u.Firebase_UID IS NOT NULL AND u.Firebase_UID <> '' THEN 'FIREBASE'
            ELSE 'LOCAL'
          END AS TipoUsuario
       FROM mydb.TBL_MS_USUARIO u
       JOIN mydb.TBL_MS_2FA f ON u.Id_Usuario_PK = f.Id_Usuario_FK
       WHERE u.Id_Usuario_PK = ?
       LIMIT 1;`,
      [Number(idUsuario)]
    );

    if (!rows?.length) {
      return NextResponse.json(
        { ok: false, error: 'Usuario no encontrado o sin secreto 2FA configurado.' },
        { status: 404 }
      );
    }

    const usuario = rows[0];
    const secret = String(usuario.Secret_Base32);
    const correo = String(usuario.Correo_Electronico);
    const tipoUsuario = String(usuario.TipoUsuario);
    const identificador =
      tipoUsuario === 'FIREBASE'
        ? String(usuario.Firebase_UID)
        : String(usuario.Correo_Electronico);

    // 2️⃣ Validar el código TOTP
    authenticator.options = { window: 1 }; // tolerancia ±30s
    const isValid = authenticator.check(String(token), secret);

    if (!isValid) {
      return NextResponse.json(
        { ok: false, error: 'Código incorrecto o expirado.' },
        { status: 401 }
      );
    }

    // 3️⃣ Activar 2FA en BD (marca enabled = 1)
    await conn.query(`CALL mydb.sp_2fa_activar(?, ?);`, [identificador, tipoUsuario]);

    // 4️⃣ Generar JWT interno y cookie `app_token`
    const secretKey = new TextEncoder().encode(process.env.APP_JWT_SECRET!);
    const appToken = await new SignJWT({
      uid: idUsuario,
      email: correo,
      rol: 'Usuario',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1d')
      .sign(secretKey);

    // 5️⃣ Respuesta con cookie activa
    const resp = NextResponse.json({
      ok: true,
      valid: true,
      message: '2FA verificado y sesión activada correctamente.',
    });

    resp.cookies.set('app_token', appToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 día
    });

    return resp;
  } catch (err: any) {
    console.error('❌ Error en /api/auth/2fa/verify:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  } finally {
    conn.release();
  }
}
