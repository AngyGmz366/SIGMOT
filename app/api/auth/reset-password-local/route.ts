export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * POST /api/auth/reset-password-local
 * Genera un token de reseteo para un usuario local (MySQL)
 * Body: { email }
 */
export async function POST(req: Request) {
  const conn = await db.getConnection();
  try {
    const { email } = await req.json().catch(() => ({}));
    if (!email) {
      return NextResponse.json({ error: 'Correo requerido' }, { status: 400 });
    }

    // Buscar usuario
    const [rows]: any = await conn.query(
      'SELECT Id_Usuario_PK FROM mydb.TBL_MS_USUARIO WHERE Correo = ? LIMIT 1',
      [email.trim()]
    );
    const usuario = rows?.[0];
    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Generar token aleatorio de 64 caracteres y expira en 30 min
    const token = crypto.randomBytes(32).toString('hex');
    const expira = new Date(Date.now() + 1000 * 60 * 30); // 30 minutos

    // Guardar token
    await conn.query(
      `INSERT INTO mydb.TBL_MS_RESET_TOKEN (Id_Usuario_FK, Token, Expira_En, Usado)
       VALUES (?, ?, ?, 0)`,
      [usuario.Id_Usuario_PK, token, expira]
    );

    // Puedes enviarlo por correo aquí si lo deseas (ahora solo lo devolvemos)
    return NextResponse.json({
      ok: true,
      message: 'Token de reseteo generado. Válido por 30 minutos.',
      token,
    });
  } catch (err: any) {
    console.error('reset-password-local POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    conn.release();
  }
}

/**
 * PUT /api/auth/reset-password-local
 * Cambia la contraseña usando un token válido
 * Body: { token, newPassword }
 */
export async function PUT(req: Request) {
  const conn = await db.getConnection();
  try {
    const { token, newPassword } = await req.json().catch(() => ({}));
    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token y nueva contraseña requeridos' }, { status: 400 });
    }

    // Verificar token válido
    const [rows]: any = await conn.query(
      `SELECT * FROM mydb.TBL_MS_RESET_TOKEN
       WHERE Token = ? AND Usado = 0 AND Expira_En > NOW() LIMIT 1`,
      [token.trim()]
    );
    const row = rows?.[0];
    if (!row) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 });
    }

    const userId = row.Id_Usuario_FK;

    // Encriptar nueva contraseña
    const hash = await bcrypt.hash(newPassword, 12);

    // Actualizar usuario
    await conn.query(
      'UPDATE mydb.TBL_MS_USUARIO SET Contrasena = ? WHERE Id_Usuario_PK = ?',
      [Buffer.from(hash), userId]
    );

    // Marcar token como usado
    await conn.query(
      'UPDATE mydb.TBL_MS_RESET_TOKEN SET Usado = 1, Used_At = NOW() WHERE Id_Reset_PK = ?',
      [row.Id_Reset_PK]
    );

    // Registrar en bitácora (si querés seguir tu formato)
    await conn.query('CALL mydb.sp_bitacora_insert(?, ?, ?, ?)', [
      userId,
      1, // objeto Login/Seguridad
      'RESET_PASSWORD',
      CONCAT('Usuario ', userId, ' cambió su contraseña mediante reset.'),
    ]);

    return NextResponse.json({
      ok: true,
      message: 'Contraseña actualizada correctamente.',
    });
  } catch (err: any) {
    console.error('reset-password-local PUT error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    conn.release();
  }
}
function CONCAT(arg0: string, userId: any, arg2: string) {
  throw new Error('Function not implemented.');
}

