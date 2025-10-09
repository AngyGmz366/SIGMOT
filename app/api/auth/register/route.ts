export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
const pool = db;
import bcrypt from 'bcryptjs';

// Firebase Admin SDK
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// 👇 Ajusta al ID real de "Prefiero no decir"
const DEFAULT_GENERO_ID = 4;

// Inicializa Firebase Admin solo una vez
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FB_PROJECT_ID!,
      clientEmail: process.env.FB_CLIENT_EMAIL!,
      privateKey: process.env.FB_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });
}

/**
 * GET simple
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    path: '/api/auth/register',
    modes: ['firebase', 'local+verificacion'],
  });
}

/**
 * POST /api/auth/register
 * Modo Firebase:
 *   - Header: Authorization: Bearer <ID_TOKEN_FIREBASE>
 *   - Body opcional: { nombres?, apellidos?, telefono?, genero_id?, fecha_nacimiento?, rolDefecto?, tipoPersona? }
 *
 * Modo Local (sin token):
 *   - Body: {
 *       nombres, apellidos?, telefono?, genero_id?, fecha_nacimiento?,
 *       email, password, codigoVerificacion,
 *       rolDefecto?, tipoPersona?, estadoUsuario?
 *     }
 */
export async function POST(req: Request) {
  const conn = await pool.getConnection();
  try {
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
    const body: any = await req.json();

    // Campos comunes
    const nombresBody = (body?.nombres ?? '').trim();
    const apellidos = (body?.apellidos ?? '').trim();
    const telefono = body?.telefono ?? null;
    const generoBody = body?.genero_id;
    const genero_id = generoBody ?? DEFAULT_GENERO_ID;
    const fecha_nacimiento = body?.fecha_nacimiento
      ? String(body.fecha_nacimiento).slice(0, 10)
      : null;
    const rolDefecto = Number(body?.rolDefecto ?? 1);
    const tipoPersona = Number(body?.tipoPersona ?? 1);

    // ───────────────────────────────────────────────
    // 🔹 MODO 1: FIREBASE (con Authorization: Bearer)
    // ───────────────────────────────────────────────
    if (token) {
      let decoded;
      try {
        decoded = await getAuth().verifyIdToken(token);
      } catch {
        return NextResponse.json({ error: 'Token Firebase inválido.' }, { status: 401 });
      }

      const firebaseUid = decoded.uid;
      const emailFromToken = decoded.email || '';
      const correo = (body?.correo || emailFromToken).trim();
      const nombres =
        nombresBody ||
        (decoded.name ? String(decoded.name) : '') ||
        (correo ? String(correo).split('@')[0] : '');

      if (!correo)
        return NextResponse.json({ error: 'Correo requerido.' }, { status: 400 });
      if (!nombres)
        return NextResponse.json({ error: 'Nombres requeridos.' }, { status: 400 });

      // ✅ Llama al SP de Firebase
      const [resultSets]: any = await conn.query(
        `CALL mydb.sp_registro_persona_y_usuario_firebase(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          firebaseUid,
          correo,
          nombres,
          apellidos,
          genero_id,
          fecha_nacimiento,
          telefono,
          rolDefecto,
          tipoPersona,
        ]
      );

      // 🧾 Bitácora
      const [[usuario]]: any = await conn.query(
        `SELECT Id_Usuario_PK FROM mydb.TBL_MS_USUARIO 
         WHERE Firebase_UID = ? OR Correo_Electronico = ? 
         ORDER BY Id_Usuario_PK DESC LIMIT 1`,
        [firebaseUid, correo]
      );

      if (usuario?.Id_Usuario_PK) {
        await conn.query('CALL mydb.sp_registrar_usuario_bitacora(?, ?)', [
          usuario.Id_Usuario_PK,
          1,
        ]);
      }

      const ids =
        Array.isArray(resultSets) && resultSets.length ? resultSets[0] : null;

      return NextResponse.json({
        ok: true,
        mode: 'firebase',
        firebaseUid,
        email: correo,
        ids,
      });
    }

    // ───────────────────────────────────────────────
    // 🔹 MODO 2: LOCAL (sin token, con verificación)
    // ───────────────────────────────────────────────
    const email = (body?.email ?? '').trim();
    const password = body?.password ?? '';
    const codigoVerificacion = (body?.codigoVerificacion ?? '').trim();
    const estadoUsuario = Number(body?.estadoUsuario ?? 1); // ACTIVO por defecto

    if (!email || !password || !nombresBody || !codigoVerificacion) {
      return NextResponse.json(
        {
          error:
            'Faltan datos obligatorios: correo, contraseña, nombres o código de verificación.',
        },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Correo inválido.' }, { status: 400 });
    }

    if (String(password).length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres.' },
        { status: 400 }
      );
    }

    // 🔐 Hash + salt
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // ✅ SP con verificación de correo
    const [resultSets]: any = await conn.query(
      `CALL mydb.sp_registro_persona_y_usuario_con_verificacion(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email,
        Buffer.from(passwordHash),
        Buffer.from(salt),
        nombresBody,
        apellidos,
        genero_id,
        fecha_nacimiento,
        telefono,
        rolDefecto,
        tipoPersona,
        estadoUsuario,
        codigoVerificacion,
      ]
    );

    // 🧾 Bitácora
    const [[usuario]]: any = await conn.query(
      `SELECT Id_Usuario_PK FROM mydb.TBL_MS_USUARIO 
       WHERE Correo_Electronico = ? 
       ORDER BY Id_Usuario_PK DESC LIMIT 1`,
      [email]
    );

    if (usuario?.Id_Usuario_PK) {
      await conn.query('CALL mydb.sp_registrar_usuario_bitacora(?, ?)', [
        usuario.Id_Usuario_PK,
        1,
      ]);
    }

    const ids =
      Array.isArray(resultSets) && resultSets.length ? resultSets[0] : null;

    return NextResponse.json({
      ok: true,
      mode: 'local',
      message: 'Usuario registrado correctamente con verificación de correo.',
      email,
      ids,
    });
  } catch (err: any) {
    console.error('❌ Error en /api/auth/register:', err);
    return NextResponse.json(
      {
        error: 'Fallo en registro',
        detail: err?.sqlMessage || err?.message || String(err),
      },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
