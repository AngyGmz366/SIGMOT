export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(req: Request) {
  try {
    // Leer cookie (Next 13/14 App Router): usar headers 'cookie'
    const cookie = (req as any).headers.get('cookie') || '';
    const match = cookie.match(/(?:^|; )app_token=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : '';

    if (!token) {
      return NextResponse.json({ ok: false, error: 'No token' }, { status: 401 });
    }

    const secretEnv = process.env.APP_JWT_SECRET;
    if (!secretEnv) throw new Error('APP_JWT_SECRET no configurado.');

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secretEnv)
    );

    // payload.uid = Id_Usuario_PK que firmaste en login/upsert/verify
    return NextResponse.json({
      ok: true,
      uid: payload.uid,
      email: payload.email || null,
      rol: payload.rol || null,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || 'Invalid token' }, { status: 401 });
  }
}
