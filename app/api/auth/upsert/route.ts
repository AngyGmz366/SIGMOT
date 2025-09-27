export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
const pool = db;
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FB_PROJECT_ID!,
      clientEmail: process.env.FB_CLIENT_EMAIL!,
      privateKey: process.env.FB_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });
}

export async function GET() {
  return NextResponse.json({ ok: true, path: '/api/auth/upsert' });
}

// ⬇️ Upsert SIN personaFk desde el cliente
export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Sin token' }, { status: 401 });

    const decoded = await getAuth().verifyIdToken(token);
    const firebaseUid = decoded.uid;
    const displayName = decoded.name || '';
    const correo = decoded.email || '';
    if (!correo) return NextResponse.json({ error: 'Correo requerido' }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const rolDefecto = Number(body?.rolDefecto ?? 1);

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1) Intentar obtener personaFk existente (por uid o correo)
      let personaFk: number | null = null;

      const [u1]: any = await conn.query(
        `SELECT Id_Persona_FK AS personaFk
           FROM mydb.TBL_MS_USUARIO
          WHERE Firebase_UID = ?
          LIMIT 1`,
        [firebaseUid]
      );
      personaFk = u1?.[0]?.personaFk ?? null;

      if (!personaFk) {
        const [u2]: any = await conn.query(
          `SELECT Id_Persona_FK AS personaFk
             FROM mydb.TBL_MS_USUARIO
            WHERE Correo_Electronico = ?
            LIMIT 1`,
          [correo]
        );
        personaFk = u2?.[0]?.personaFk ?? null;
      }

      // 2) Si no existe persona, crear una mínima en TBL_PERSONAS
      if (!personaFk) {
        const nombres = displayName?.split(' ')?.slice(0, -1).join(' ') || 'Usuario';
        const apellidos = displayName?.split(' ')?.slice(-1).join(' ') || 'SIGMOT';

        const [insPersona]: any = await conn.query(
          `INSERT INTO mydb.TBL_PERSONAS
             (Nombres, Apellidos, Correo, Fecha_Creacion)
           VALUES (?, ?, ?, NOW())`,
          [nombres, apellidos, correo]
        );
        personaFk = insPersona.insertId;
      }

      // 3) Ejecutar tu SP de upsert de usuario usando esa personaFk
      const [resultSets]: any = await conn.query(
        'CALL mydb.sp_registrar_usuario_firebase(?, ?, ?, ?)',
        [firebaseUid, correo, rolDefecto, personaFk]
      );

      await conn.commit();

      const vista = Array.isArray(resultSets) ? resultSets[0] : resultSets;
      return NextResponse.json({ ok: true, usuario: vista });
    } catch (e) {
      await (async () => { try { await pool.query('ROLLBACK'); } catch {} })();
      throw e;
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
