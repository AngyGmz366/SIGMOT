export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
const pool = db;

import bcrypt from 'bcryptjs';

// Firebase Admin (solo se usa si llega Authorization)
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// 👇 Ajusta al ID real de "Prefiero no decir"
const DEFAULT_GENERO_ID = 4;

// Inicializa Firebase Admin una sola vez
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FB_PROJECT_ID!,
      clientEmail: process.env.FB_CLIENT_EMAIL!,
      privateKey: process.env.FB_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });
}

// GET simple
export async function GET() {
  return NextResponse.json({ ok: true, path: '/api/auth/register', modes: ['firebase', 'local'] });
}

/**
 * POST /api/auth/register
 * Modo Firebase:
 *  - Header: Authorization: Bearer <ID_TOKEN_FIREBASE>
 *  - Body: { nombres?, apellidos?, telefono?, genero_id?, fecha_nacimiento?, rolDefecto?, tipoPersona?, correo? }
 *
 * Modo Local (sin token):
 *  - Body: {
 *      nombres, apellidos?, telefono?, genero_id?, fecha_nacimiento?,
 *      email, password,
 *      rolDefecto?, tipoPersona?, estadoUsuario? (FK estado, ej. 1=ACTIVO)
 *    }
 */
export async function POST(req: Request) {
  const conn = await pool.getConnection();
  try {
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
    const rawBody = await req.json().catch(() => ({} as any));
    const body: any = rawBody || {};

    // Campos comunes
    const nombresBody       = (body?.nombres ?? '').trim();
    const apellidos         = (body?.apellidos ?? '').trim();
    const telefono          = body?.telefono ?? null;
    const generoBody        = body?.genero_id;
    const genero_id         = (generoBody === undefined || generoBody === null) ? DEFAULT_GENERO_ID : generoBody;
    const fecha_nacimiento  = body?.fecha_nacimiento ? String(body.fecha_nacimiento).slice(0, 10) : null; // 'YYYY-MM-DD' o null
    const rolDefecto        = Number(body?.rolDefecto ?? 1);
    const tipoPersona       = Number(body?.tipoPersona ?? 1);

    // ─────────────────────────────────────────────────────────
    // MODO 1: FIREBASE (hay Authorization: Bearer <idToken>)
    // ─────────────────────────────────────────────────────────
    if (token) {
      let decoded;
      try {
        decoded = await getAuth().verifyIdToken(token);
      } catch (e: any) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }

      const firebaseUid    = decoded.uid;
      const emailFromToken = decoded.email || '';
      const correo         = (body?.correo || emailFromToken).trim();

      // nombre fallback: body -> token.name -> local-part del email
      const nombres =
        nombresBody ||
        (decoded.name ? String(decoded.name) : '') ||
        (correo ? String(correo).split('@')[0] : '');

      if (!correo)  return NextResponse.json({ error: 'Correo requerido' }, { status: 400 });
      if (!nombres) return NextResponse.json({ error: 'nombres requerido' }, { status: 400 });

      const [resultSets]: any = await conn.query(
        'CALL mydb.sp_registro_persona_y_usuario_firebase(?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          firebaseUid,
          correo,
          nombres,
          apellidos,
          genero_id ?? DEFAULT_GENERO_ID,   // 👈 fallback
          fecha_nacimiento,
          telefono,
          rolDefecto,
          tipoPersona,
        ]
      );
      // 🧾 Registrar creación de usuario en bitácora
      await conn.query('CALL mydb.sp_registrar_usuario_bitacora(?, ?)', [firebaseUid, 1]);


      const toArr = (x: any) => (Array.isArray(x) ? x : [x]);
      const sets = toArr(resultSets);
      const ids =
        sets.find(
          (s: any) =>
            Array.isArray(s) &&
            s.length &&
            ('Id_Persona_PK' in s[0] || 'Id_Usuario_PK' in s[0] || 'Id_Correo_FK' in s[0])
        ) || [];
      const permisos =
        sets.find(
          (s: any) =>
            Array.isArray(s) &&
            s.length &&
            'Id_Usuario_PK' in s[0] &&
            ('Id_Rol_FK' in s[0] || 'Permisos' in s[0])
        ) || [];

      return NextResponse.json({ ok: true, mode: 'firebase', firebaseUid, email: correo, ids, permisos });
    }

    // ─────────────────────────────────────────────────────────
    // MODO 2: LOCAL (no hay token; debe venir email + password)
    // ─────────────────────────────────────────────────────────
    const email          = (body?.email ?? '').trim();
    const password       = body?.password ?? '';
    const estadoUsuario  = Number(body?.estadoUsuario ?? 1); // ACTIVO por defecto

    if (!email || !password || !nombresBody) {
      return NextResponse.json({ error: 'Faltan datos obligatorios (email/password/nombres)' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Correo inválido' }, { status: 400 });
    }
    if (String(password).length < 8) {
      return NextResponse.json({ error: 'Contraseña mínima de 8 caracteres' }, { status: 400 });
    }

    const hash = await bcrypt.hash(String(password), 12);

    const [resultSets]: any = await conn.query(
      `CALL mydb.sp_registro_persona_y_usuario_local(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email,
        Buffer.from(hash),  // VARBINARY
        null,               // salt (bcrypt lo incluye en el hash)
        nombresBody,
        apellidos,
        genero_id ?? DEFAULT_GENERO_ID,  // 👈 fallback
        fecha_nacimiento,
        telefono,
        rolDefecto,
        tipoPersona,
        estadoUsuario
      ]
    );
    // 🧾 Registrar creación de usuario en bitácora
    const [[usuario]]: any = await conn.query(
      'SELECT Id_Usuario_PK FROM mydb.TBL_MS_USUARIO WHERE Correo_Electronico = ? ORDER BY Id_Usuario_PK DESC LIMIT 1',
      [email]
    );


    if (usuario?.Id_Usuario_PK) {
      await conn.query('CALL mydb.sp_registrar_usuario_bitacora(?, ?)', [usuario.Id_Usuario_PK, 1]);
    }


    const ids = Array.isArray(resultSets) ? resultSets[0] : resultSets;
    return NextResponse.json({ ok: true, mode: 'local', email, ids });

  } catch (err: any) {
    console.error('register error:', err);
    return NextResponse.json(
      { error: 'Fallo en registro', detail: err?.sqlMessage || err?.message || String(err) },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
