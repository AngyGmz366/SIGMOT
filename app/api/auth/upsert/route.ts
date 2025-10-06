export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { SignJWT } from 'jose';

const pool = db;

// 🔹 Inicializa Firebase Admin solo una vez
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FB_PROJECT_ID!,
      clientEmail: process.env.FB_CLIENT_EMAIL!,
      privateKey: process.env.FB_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });
}

// 🔹 Simple healthcheck
export async function GET() {
  return NextResponse.json({ ok: true, path: '/api/auth/upsert' });
}

// 🔹 Sincroniza usuario Firebase → MySQL y genera cookie `app_token`
export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token)
      return NextResponse.json({ error: 'Sin token' }, { status: 401 });

    // 1️⃣ Verifica token Firebase
    const decoded = await getAuth().verifyIdToken(token);
    const firebaseUid = decoded.uid;
    const displayName = decoded.name || '';
    const correo = decoded.email || '';
    if (!correo)
      return NextResponse.json({ error: 'Correo requerido' }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const rolDefecto = Number(body?.rolDefecto ?? 1);

    // 2️⃣ Inicia transacción MySQL
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      let personaFk: number | null = null;

      // Ver si ya existe usuario por UID
      const [u1]: any = await conn.query(
        `SELECT Id_Persona_FK AS personaFk
           FROM mydb.TBL_MS_USUARIO
          WHERE Firebase_UID = ?
          LIMIT 1`,
        [firebaseUid]
      );
      personaFk = u1?.[0]?.personaFk ?? null;

      // Si no existe, buscar por correo
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

      // 3️⃣ Crear persona mínima si no existe
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

      // 4️⃣ Ejecutar tu SP de registro Firebase
      const [resultSets]: any = await conn.query(
        'CALL mydb.sp_registrar_usuario_firebase(?, ?, ?, ?)',
        [firebaseUid, correo, rolDefecto, personaFk]
      );

      await conn.commit();
      conn.release();

      // 5️⃣ Generar JWT interno (1 día de duración)
      const secret = new TextEncoder().encode(process.env.APP_JWT_SECRET!);
      const appToken = await new SignJWT({
        uid: firebaseUid,
        email: correo,
        rol: rolDefecto,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1d')
        .sign(secret);

      // 6️⃣ Crear respuesta con cookie segura
      const resp = NextResponse.json({
        ok: true,
        usuario: Array.isArray(resultSets) ? resultSets[0] : resultSets,
      });

      resp.cookies.set('app_token', appToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 día
      });

      return resp;
    } catch (e) {
      await conn.query('ROLLBACK');
      conn.release();
      throw e;
    }
  } catch (err: any) {
    console.error('❌ Error en /api/auth/upsert:', err);
    return NextResponse.json(
      { error: 'Fallo en registro/actualización', detail: err?.sqlMessage || err?.message },
      { status: 500 }
    );
  }
}
