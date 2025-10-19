export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { SignJWT } from 'jose';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FB_PROJECT_ID!,
      clientEmail: process.env.FB_CLIENT_EMAIL!,
      privateKey: process.env.FB_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });
}

const pool = db;

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Sin token' }, { status: 401 });

    const decoded = await getAuth().verifyIdToken(token);
    const firebaseUid = decoded.uid;
    const displayName = decoded.name || '';
    const correo = decoded.email || '';

    if (!correo) {
      return NextResponse.json({ error: 'Correo requerido' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const rolDefecto = Number(body?.rolDefecto ?? 1);
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      let personaFk: number | null = null;

      // 🔹 Buscar persona asociada
      const [u1]: any = await conn.query(
        `SELECT Id_Persona_FK AS personaFk
         FROM mydb.TBL_MS_USUARIO
         WHERE Firebase_UID = ? LIMIT 1`,
        [firebaseUid]
      );
      personaFk = u1?.[0]?.personaFk ?? null;

      if (!personaFk) {
        const [u2]: any = await conn.query(
          `SELECT Id_Persona_FK AS personaFk
           FROM mydb.TBL_MS_USUARIO
           WHERE Correo_Electronico = ? LIMIT 1`,
          [correo]
        );
        personaFk = u2?.[0]?.personaFk ?? null;
      }

      // 🔹 Crear persona si no existe
      if (!personaFk) {
        const nombres = displayName?.split(' ')?.slice(0, -1).join(' ') || 'Usuario';
        const apellidos = displayName?.split(' ')?.slice(-1).join(' ') || 'SIGMOT';

        const [insCorreo]: any = await conn.query(
          `INSERT INTO mydb.TBL_CORREOS (Correo)
           VALUES (?) 
           ON DUPLICATE KEY UPDATE Id_Correo_PK = LAST_INSERT_ID(Id_Correo_PK);`,
          [correo]
        );
        const idCorreo = insCorreo.insertId;

        const [insPersona]: any = await conn.query(
          `INSERT INTO mydb.TBL_PERSONAS
             (Id_Genero_FK, Id_TipoPersona_FK, Id_Correo_FK, Nombres, Apellidos)
           VALUES (4, 1, ?, ?, ?)`,
          [idCorreo, nombres, apellidos]
        );

        personaFk = insPersona.insertId;
      }

      // 🔹 Registrar usuario Firebase
      const [resultSets]: any = await conn.query(
        `CALL mydb.sp_registrar_usuario_firebase(?, ?, ?, ?)`,
        [firebaseUid, correo, rolDefecto, personaFk]
      );

      // 🔹 Activar si estaba NUEVO
      await conn.query(
        `UPDATE mydb.TBL_MS_USUARIO 
         SET Estado_Usuario = (
           SELECT Id_Estado_PK FROM mydb.TBL_MS_ESTADO_USUARIO 
           WHERE Estado = 'ACTIVO' LIMIT 1
         )
         WHERE Firebase_UID = ? 
           AND (Estado_Usuario IS NULL OR Estado_Usuario = 1);`,
        [firebaseUid]
      );

      // 🔹 Datos finales
      const [[usuario]]: any = await conn.query(
        `SELECT Id_Usuario_PK, Correo_Electronico AS Correo, Id_Rol_FK
         FROM mydb.TBL_MS_USUARIO
         WHERE Firebase_UID = ? OR Correo_Electronico = ?
         ORDER BY Id_Usuario_PK DESC LIMIT 1;`,
        [firebaseUid, correo]
      );

      // 🔹 Verificar si tiene 2FA activo
      const [twofaRows]: any = await conn.query(
        `SELECT TwoFA_Enabled FROM mydb.TBL_MS_2FA WHERE Id_Usuario_FK = ? LIMIT 1;`,
        [usuario?.Id_Usuario_PK]
      );
      const requires2FA = twofaRows?.[0]?.TwoFA_Enabled === 1;

      await conn.commit();
      conn.release();

      // 🚦 Si tiene 2FA activo → frontend pedirá código
      if (requires2FA) {
        return NextResponse.json({
          ok: true,
          requires2FA,
          idUsuario: usuario.Id_Usuario_PK,
          tipoUsuario: 'FIREBASE',
          correo,
        });
      }

      // 🔐 Si no → generar JWT
      const secret = new TextEncoder().encode(process.env.APP_JWT_SECRET!);
      const appToken = await new SignJWT({
        uid: usuario.Id_Usuario_PK,
        email: correo,
        rol: rolDefecto,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1d')
        .sign(secret);

      const resp = NextResponse.json({
        ok: true,
        message: 'Usuario sincronizado correctamente',
        usuario,
        requires2FA: false,
      });

      resp.cookies.set('app_token', appToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
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
      { error: 'Fallo en registro o sincronización', detail: err?.message },
      { status: 500 }
    );
  }
}
