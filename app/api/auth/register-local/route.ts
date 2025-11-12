export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
const pool = db;
import bcrypt from 'bcryptjs';

// GET de prueba
export async function GET() {
  return NextResponse.json({ ok: true, path: '/api/auth/register-local' });
}

/**
 * POST /api/auth/register-local
 * Body JSON:
 * {
 *   "nombres": "Juan",
 *   "apellidos": "Pérez",
 *   "telefono": "99998888",
 *   "genero_id": 1,
 *   "fecha_nacimiento": "2000-05-10",
 *   "email": "juan@correo.com",
 *   "password": "Secreto123!",
 *   "rolDefecto": 1,
 *   "tipoPersona": 1,
 *   "estadoUsuario": 1   // Id en TBL_MS_ESTADO_USUARIO (ej. ACTIVO)
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      nombres,
      apellidos = '',
      telefono = null,
      genero_id = null,
      fecha_nacimiento = null, // 'YYYY-MM-DD'
      email,
      password,
      rolDefecto = 3,
      tipoPersona = 1,
      estadoUsuario = 1
    } = body;

    // Validaciones mínimas
    if (!email || !password || !nombres) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Correo inválido' }, { status: 400 });
    }
    if (String(password).length < 8) {
      return NextResponse.json({ error: 'Contraseña mínima de 8 caracteres' }, { status: 400 });
    }

    // Hash (bcrypt) – no se necesita salt aparte
    const hash = await bcrypt.hash(String(password), 12);

    const conn = await pool.getConnection();
    try {
      const [resultSets]: any = await conn.query(
        `CALL mydb.sp_registro_persona_y_usuario_local(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          String(email).trim(),
          Buffer.from(hash),         // p_password_hash (VARBINARY)
          null,                      // p_salt (bcrypt lo lleva embebido)
          String(nombres).trim(),
          String(apellidos).trim(),
          genero_id,
          fecha_nacimiento,          // 'YYYY-MM-DD' o null
          telefono,
          Number(rolDefecto ?? 1),
          Number(tipoPersona ?? 1),
          Number(estadoUsuario ?? 1)
        ]
      );

      // El SP devuelve un result-set con { Id_Persona_PK, Id_Usuario_PK, Id_Correo_FK }
      const ids = Array.isArray(resultSets) ? resultSets[0] : resultSets;

      return NextResponse.json({ ok: true, ids });
    } finally {
      conn.release();
    }
  } catch (err: any) {
    console.error('register-local error:', err);
    return NextResponse.json(
      { error: 'Fallo en registro-local', detail: err?.sqlMessage || err?.message || String(err) },
      { status: 500 }
    );
  }
}
