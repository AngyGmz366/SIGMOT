export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const conn = await db.getConnection();
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Faltan datos.' }, { status: 400 });
    }

    // 1️⃣ Buscar el token y verificar si está vigente
    const [rows]: any = await conn.query(
      `SELECT Id_Reset_PK, Id_Usuario_FK, Expira_En, Usado
       FROM mydb.TBL_MS_RESET_TOKEN
       WHERE Token = UNHEX(?) LIMIT 1`,
      [token]
    );

    const row = rows?.[0];
    if (!row) {
      return NextResponse.json({ error: 'Token inválido o no encontrado.' }, { status: 400 });
    }
    if (row.Usado === 1) {
      return NextResponse.json({ error: 'Este enlace ya fue utilizado.' }, { status: 400 });
    }
    if (new Date(row.Expira_En) < new Date()) {
      return NextResponse.json({ error: 'El enlace ha expirado.' }, { status: 400 });
    }

    // 2️⃣ Encriptar la nueva contraseña
    const hashed = await bcrypt.hash(password, 10);

    // 3️⃣ Actualizar la contraseña del usuario
    await conn.query(
      'UPDATE mydb.TBL_MS_USUARIO SET Contrasena = ? WHERE Id_Usuario_PK = ?',
      [hashed, row.Id_Usuario_FK]
    );

    // 4️⃣ Marcar el token como usado
    await conn.query(
      'UPDATE mydb.TBL_MS_RESET_TOKEN SET Usado = 1 WHERE Id_Reset_PK = ?',
      [row.Id_Reset_PK]
    );

    return NextResponse.json({
      ok: true,
      message: 'Contraseña actualizada correctamente.',
    });
  } catch (error: any) {
    console.error('❌ Error en reset-password:', error);
    return NextResponse.json(
      { error: error.message || 'Error al restablecer la contraseña.' },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
