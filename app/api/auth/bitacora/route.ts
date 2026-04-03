export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * API para registrar acciones en la bitácora
 * Espera:
 * {
 *   id_usuario?: number,
 *   correo?: string,
 *   usuario?: string,
 *   accion: string,
 *   descripcion: string
 * }
 */
export async function POST(req: Request) {
  const conn = await db.getConnection();

  try {
    const { id_usuario, correo, usuario, accion, descripcion } = await req.json();

    if (!accion || !descripcion) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios.' },
        { status: 400 }
      );
    }

    let usuarioId = id_usuario;

    // 1. Buscar por ID si ya viene
    // 2. Si no viene, buscar por correo
    if (!usuarioId && correo) {
      const [rows]: any = await conn.query(
        `SELECT Id_Usuario_PK
         FROM mydb.TBL_MS_USUARIO
         WHERE Correo_Electronico = ?
         LIMIT 1`,
        [correo]
      );

      if (rows?.length > 0) {
        usuarioId = rows[0].Id_Usuario_PK;
      }
    }

    // 3. Si no viene correo o no encontró, buscar por nombre de usuario
    if (!usuarioId && usuario) {
      const [rows]: any = await conn.query(
        `SELECT Id_Usuario_PK
         FROM mydb.TBL_MS_USUARIO
         WHERE Nombre_Usuario = ?
         LIMIT 1`,
        [usuario]
      );

      if (rows?.length > 0) {
        usuarioId = rows[0].Id_Usuario_PK;
      }
    }

    if (!usuarioId) {
      console.warn(`⚠ No se encontró usuario para correo=${correo} usuario=${usuario}`);
      return NextResponse.json(
        { error: 'No se encontró el usuario para registrar en bitácora.' },
        { status: 404 }
      );
    }

    await conn.query('CALL mydb.sp_bitacora_insert(?, ?, ?, ?)', [
      usuarioId,
      1,
      accion,
      descripcion,
    ]);

    return NextResponse.json({
      ok: true,
      message: 'Registro guardado en bitácora correctamente.',
      usuarioId,
    });
  } catch (error: any) {
    console.error('Error al registrar en bitácora:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al registrar en bitácora.' },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}