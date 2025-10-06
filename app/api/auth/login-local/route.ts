// app/api/auth/login-local/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  const pool = db;
  const conn = await pool.getConnection();
  try {
    const { email, password } = await req.json().catch(() => ({}));
    if (!email || !password) {
      return NextResponse.json({ error: 'Faltan email y password' }, { status: 400 });
    }

    // 1) Traer datos con SP
    const [resultSets]: any = await conn.query(
      'CALL mydb.sp_login_local_info(?)',
      [String(email).trim()]
    );
    // mysql2 con CALL suele devolver [ [rows], otherMeta... ]
    const rows = Array.isArray(resultSets) ? resultSets[0] : resultSets;
    const row = rows?.[0];
    if (!row) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });

    const usuarioId = row.Id_Usuario_PK;
    const estado    = Number(row.Estado_Usuario);
    const hash      = Buffer.isBuffer(row.Contrasena) ? row.Contrasena.toString() : String(row.Contrasena || '');

    // 2) Verificar hash en Node (MySQL no compara bcrypt)
    const ok = await bcrypt.compare(String(password), hash);

    // 3) Registrar el resultado en BD
    await conn.query('CALL mydb.sp_login_local_post_login(?, ?)', [usuarioId, ok ? 1 : 0]);
    // 3.1 Registrar inicio de sesión en bitácora
    await conn.query('CALL sp_iniciar_sesion(?, ?)', [usuarioId, 1]); // 1 = objeto "Login/Seguridad"

    if (!ok) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    if (estado !== 1) return NextResponse.json({ error: 'Usuario no activo' }, { status: 403 });

    // 4) Generar JWT y setear cookie httpOnly
    const token = jwt.sign(
      { uid: usuarioId, email: String(email).trim(), kind: 'local' },
      process.env.APP_JWT_SECRET!,
      { expiresIn: '2h' }
    );

    const res = NextResponse.json({ ok: true });
    res.cookies.set('app_token', token, {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 2
    });
    return res;
  } catch (e: any) {
    console.error('login-local error:', e);
    return NextResponse.json({ error: e?.sqlMessage || e?.message || 'Error' }, { status: 500 });
  } finally {
    conn.release();
  }
}
