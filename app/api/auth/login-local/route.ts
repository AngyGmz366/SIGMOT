// app/api/auth/login-local/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/* ============================================================
   🧱 Rate Limit manual compatible con Next.js App Router
   ============================================================ */
const rateLimitStore = new Map<string, { count: number; last: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 3 * 60 * 1000; // 3 minutos

function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function checkRateLimit(req: Request): { allowed: boolean; remaining: number } {
  const ip = getClientIp(req);
  const now = Date.now();
  const record = rateLimitStore.get(ip) || { count: 0, last: now };

  // Reiniciar contador si la ventana expiró
  if (now - record.last > WINDOW_MS) {
    record.count = 0;
    record.last = now;
  }

  record.count += 1;
  record.last = now;
  rateLimitStore.set(ip, record);

  return { allowed: record.count <= MAX_ATTEMPTS, remaining: MAX_ATTEMPTS - record.count };
}

/* ============================================================
   🔐 LOGIN LOCAL (bcrypt + MySQL + JWT)
   ============================================================ */
export async function POST(req: Request) {
  const conn = await db.getConnection();
  try {
    // 1️⃣ Aplica limitador por IP
    const limit = checkRateLimit(req);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Demasiados intentos desde esta IP. Intenta más tarde.' },
        { status: 429 }
      );
    }

    // 2️⃣ Leer credenciales
    const { email, password } = await req.json().catch(() => ({}));
    if (!email || !password) {
      return NextResponse.json({ error: 'Faltan email y password' }, { status: 400 });
    }

    // 3️⃣ Buscar usuario en BD
    const [resultSets]: any = await conn.query('CALL mydb.sp_login_local_info(?)', [String(email).trim()]);
    const rows = Array.isArray(resultSets) ? resultSets[0] : resultSets;
    const row = rows?.[0];
    if (!row) {
      await conn.query('CALL mydb.sp_login_intento_control(?, ?)', [String(email).trim(), 0]);
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const usuarioId = row.Id_Usuario_PK;
    const estado = Number(row.Estado_Usuario);
    const hash = Buffer.isBuffer(row.Contrasena)
      ? row.Contrasena.toString()
      : String(row.Contrasena || '');

    // 4️⃣ Verificar si el usuario está bloqueado
    const locked = row.Locked_Until && new Date(row.Locked_Until) > new Date();
    const estadoBloqueado = row.Estado_Nombre === 'BLOQUEADO' || estado === 3;

    if (estadoBloqueado && locked) {
      // 🔹 Leer tiempo de bloqueo real desde parámetros
      const [paramRows]: any = await conn.query(
        "SELECT CAST(Valor AS UNSIGNED) AS BloqueoTiempo FROM mydb.TBL_MS_PARAMETROS WHERE Parametro = 'BLOQUEO_TIEMPO_MIN' LIMIT 1;"
      );
      const minutosBloqueo = paramRows?.[0]?.BloqueoTiempo ?? 30;

      return NextResponse.json(
        {
          error: `Usuario bloqueado temporalmente. Intenta en ${minutosBloqueo} minutos.`,
          lockedUntil: row.Locked_Until,
          minutosRestantes: minutosBloqueo,
        },
        { status: 423 }
      );
    }

    // 5️⃣ Validar contraseña bcrypt
    const ok = await bcrypt.compare(String(password), hash);

    // 6️⃣ Registrar intento de login (éxito/fallo)
    await conn.query('CALL mydb.sp_login_intento_control(?, ?)', [String(email).trim(), ok ? 1 : 0]);

    // 7️⃣ Registrar post-login
    await conn.query('CALL mydb.sp_login_local_post_login(?, ?)', [usuarioId, ok ? 1 : 0]);

    // 8️⃣ Registrar bitácora de sesión (solo si correcto)
    if (ok) await conn.query('CALL sp_iniciar_sesion(?, ?)', [usuarioId, 1]);

    // 9️⃣ Respuestas según caso
    if (!ok) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    // ✅ Permitir usuarios con estado NUEVO (1) o ACTIVO (2)
    if (![1, 2].includes(estado)) {
      return NextResponse.json({ error: 'Usuario no activo' }, { status: 403 });
    }

    // 🔟 Generar JWT y cookie httpOnly
    const token = jwt.sign(
      { uid: usuarioId, email: String(email).trim(), kind: 'local', rol: row.Nombre_Rol },
      process.env.APP_JWT_SECRET!,
      { expiresIn: '2h' }
    );

    const res = NextResponse.json({ ok: true });
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
    return NextResponse.json({ error: e?.sqlMessage || e?.message || 'Error interno' }, { status: 500 });
  } finally {
    conn.release();
  }
}
