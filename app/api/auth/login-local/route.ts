export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const rateLimitStore = new Map<string, { count: number; last: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 3 * 60 * 1000;

function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function checkRateLimit(req: Request) {
  const ip = getClientIp(req);
  const now = Date.now();
  const record = rateLimitStore.get(ip) || { count: 0, last: now };

  if (now - record.last > WINDOW_MS) {
    record.count = 0;
    record.last = now;
  }

  record.count += 1;
  record.last = now;
  rateLimitStore.set(ip, record);

  return { allowed: record.count <= MAX_ATTEMPTS, remaining: MAX_ATTEMPTS - record.count };
}

export async function POST(req: Request) {
  const conn = await db.getConnection();
  try {
    const limit = checkRateLimit(req);
    if (!limit.allowed)
      return NextResponse.json({ error: 'Demasiados intentos desde esta IP.' }, { status: 429 });

    const { email, password } = await req.json().catch(() => ({}));
    if (!email || !password)
      return NextResponse.json({ error: 'Faltan email y password' }, { status: 400 });

    const [resultSets]: any = await conn.query('CALL mydb.sp_login_local_info(?)', [email.trim()]);
    const rows = Array.isArray(resultSets) ? resultSets[0] : resultSets;
    const row = rows?.[0];
    if (!row)
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });

    const usuarioId = row.Id_Usuario_PK;
    const estado = Number(row.Estado_Usuario);
    const hash = Buffer.isBuffer(row.Contrasena)
      ? row.Contrasena.toString()
      : String(row.Contrasena || '');

    const ok = await bcrypt.compare(String(password), hash);

    await conn.query('CALL mydb.sp_login_intento_control(?, ?)', [email.trim(), ok ? 1 : 0]);
    await conn.query('CALL mydb.sp_login_local_post_login(?, ?)', [usuarioId, ok ? 1 : 0]);
    if (ok) await conn.query('CALL sp_iniciar_sesion(?, ?)', [usuarioId, 1]);

    if (!ok) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    if (![1, 2].includes(estado))
      return NextResponse.json({ error: 'Usuario no activo' }, { status: 403 });

    const [twofaRows]: any = await conn.query(
      'SELECT TwoFA_Enabled, Correo_Electronico FROM mydb.TBL_MS_USUARIO WHERE Id_Usuario_PK = ? LIMIT 1;',
      [usuarioId]
    );
    const twofaEnabled = !!twofaRows?.[0]?.TwoFA_Enabled;
    const correo = twofaRows?.[0]?.Correo_Electronico;

    if (twofaEnabled) {
      return NextResponse.json({
        ok: true,
        requires2FA: true,
        idUsuario: usuarioId,
        tipoUsuario: 'LOCAL',
        correo,
      });
    }

    const token = jwt.sign(
      { uid: usuarioId, email: email.trim(), kind: 'local', rol: row.Nombre_Rol },
      process.env.APP_JWT_SECRET!,
      { expiresIn: '2h' }
    );

    const res = NextResponse.json({
      ok: true,
      Id_Usuario_PK: usuarioId,
      rol: row.Nombre_Rol,
      requires2FA: false,
    });

    res.cookies.set('app_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 2,
    });

    return res;
  } catch (e: any) {
    console.error('login-local error:', e);
    return NextResponse.json({ error: e?.message || 'Error interno' }, { status: 500 });
  } finally {
    conn.release();
  }
}
