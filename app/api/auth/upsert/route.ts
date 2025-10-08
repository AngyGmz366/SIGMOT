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

/**
 * Sincroniza usuario Firebase → MySQL
 * 1️⃣ Verifica el token de Firebase.
 * 2️⃣ Crea el correo, persona y usuario si no existen.
 * 3️⃣ Registra en bitácora y genera cookie `app_token`.
 */
export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Sin token' }, { status: 401 });
    }

    // 1️⃣ Verificar token Firebase
    const decoded = await getAuth().verifyIdToken(token);
    const firebaseUid = decoded.uid;
    const displayName = decoded.name || '';
    const correo = decoded.email || '';

    if (!correo) {
      return NextResponse.json({ error: 'Correo requerido' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const rolDefecto = Number(body?.rolDefecto ?? 1);

    // 2️⃣ Conexión MySQL
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      let personaFk: number | null = null;

      // 3️⃣ Buscar usuario existente por UID
      const [u1]: any = await conn.query(
        `SELECT Id_Persona_FK AS personaFk
         FROM mydb.TBL_MS_USUARIO
         WHERE Firebase_UID = ?
         LIMIT 1`,
        [firebaseUid]
      );
      personaFk = u1?.[0]?.personaFk ?? null;

      // Si no existe por UID, buscar por correo
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

      // 4️⃣ Crear persona mínima si no existe
      if (!personaFk) {
        const nombres = displayName?.split(' ')?.slice(0, -1).join(' ') || 'Usuario';
        const apellidos = displayName?.split(' ')?.slice(-1).join(' ') || 'SIGMOT';

        // 🔹 1. Insertar o reutilizar correo
        const [insCorreo]: any = await conn.query(
          `INSERT INTO mydb.TBL_CORREOS (Correo)
           VALUES (?) 
           ON DUPLICATE KEY UPDATE Id_Correo_PK = LAST_INSERT_ID(Id_Correo_PK);`,
          [correo]
        );
        const idCorreo = insCorreo.insertId;

        // 🔹 2. Insertar persona con FK y valores por defecto
        const DEFAULT_GENERO_ID = 4;       // "Prefiero no decir"
        const DEFAULT_TIPO_PERSONA = 1;    // Persona natural o cliente

        const [insPersona]: any = await conn.query(
          `INSERT INTO mydb.TBL_PERSONAS
             (Id_Genero_FK, Id_TipoPersona_FK, Id_Correo_FK, Nombres, Apellidos)
           VALUES (?, ?, ?, ?, ?);`,
          [DEFAULT_GENERO_ID, DEFAULT_TIPO_PERSONA, idCorreo, nombres, apellidos]
        );

        personaFk = insPersona.insertId;
      }

      // 5️⃣ Registrar usuario mediante SP existente
      const [resultSets]: any = await conn.query(
        `CALL mydb.sp_registrar_usuario_firebase(?, ?, ?, ?)`,
        [firebaseUid, correo, rolDefecto, personaFk]
      );

      // 6️⃣ Registrar evento en bitácora
      const [[usuario]]: any = await conn.query(
        `SELECT Id_Usuario_PK 
           FROM mydb.TBL_MS_USUARIO
          WHERE Firebase_UID = ? OR Correo_Electronico = ?
          ORDER BY Id_Usuario_PK DESC
          LIMIT 1`,
        [firebaseUid, correo]
      );

      if (usuario?.Id_Usuario_PK) {
        await conn.query('CALL mydb.sp_registrar_usuario_bitacora(?, ?)', [
          usuario.Id_Usuario_PK,
          1, // ID del objeto "Login/Seguridad"
        ]);
      }

      await conn.commit();
      conn.release();

      // 7️⃣ Generar JWT interno
      const secret = new TextEncoder().encode(process.env.APP_JWT_SECRET!);
      const appToken = await new SignJWT({
        uid: firebaseUid,
        email: correo,
        rol: rolDefecto,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1d')
        .sign(secret);

      // 8️⃣ Responder con cookie segura
      const resp = NextResponse.json({
        ok: true,
        message: 'Usuario sincronizado correctamente',
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
    console.error('Error en /api/auth/upsert:', err);
    return NextResponse.json(
      {
        error: 'Fallo en registro o sincronización',
        detail: err?.sqlMessage || err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
//PRUEBA