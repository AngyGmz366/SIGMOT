export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
const pool = db;
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// 🔹 Inicialización Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FB_PROJECT_ID!,
      clientEmail: process.env.FB_CLIENT_EMAIL!,
      privateKey: process.env.FB_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });
}

// 🔹 GET temporal para probar que la ruta funciona
export async function GET() {
  return NextResponse.json({ ok: true, path: '/api/auth/upsert' });
}

// 🔹 POST real para upsert
export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Sin token' }, { status: 401 });
    }

    const decoded = await getAuth().verifyIdToken(token);
    const firebaseUid = decoded.uid;

    const body = await req.json();
    const correo = decoded.email || body?.correo || '';
    const rolDefecto = Number(body?.rolDefecto ?? 1);
    const personaFk = Number(body?.personaFk);

    if (!correo) return NextResponse.json({ error: 'Correo requerido' }, { status: 400 });
    if (!personaFk) return NextResponse.json({ error: 'personaFk requerido' }, { status: 400 });

    const conn = await pool.getConnection();
    try {
      const [resultSets] = await conn.query(
        'CALL mydb.sp_registrar_usuario_firebase(?, ?, ?, ?)',
        [firebaseUid, correo, rolDefecto, personaFk]
      );
      const vista = Array.isArray(resultSets) ? resultSets[0] : resultSets;
      return NextResponse.json({ ok: true, usuario: vista });
    } finally {
      conn.release();
    }
  } catch (err: any) {
    console.error('upsert error:', err);
    return NextResponse.json(
      { error: 'Fallo en registro/actualización', detail: err?.sqlMessage || err?.message },
      { status: 500 }
    );
  }
}
