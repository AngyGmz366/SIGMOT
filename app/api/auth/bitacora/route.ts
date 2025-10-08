export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * API para registrar acciones en la bitácora
 * Espera: { id_usuario?: number, correo?: string, accion: string, descripcion: string }
 */
export async function POST(req: Request) {
  const conn = await db.getConnection();
  try {
    const { id_usuario, correo, accion, descripcion } = await req.json();

    if (!accion || !descripcion) {
      return NextResponse.json({ error: 'Faltan datos obligatorios.' }, { status: 400 });
    }

    let usuarioId = id_usuario;

    // Si no se pasó el ID, buscarlo por el correo
    if (!usuarioId && correo) {
      const [rows]: any = await conn.query(
        'SELECT Id_Usuario_PK FROM mydb.TBL_MS_USUARIO WHERE Correo_Electronico = ? LIMIT 1',
        [correo]
      );
      if (rows?.length > 0) {
        usuarioId = rows[0].Id_Usuario_PK;
      }
    }

    if (!usuarioId) {
      // Si aún no hay ID, se registra genéricamente
      console.warn(`⚠ No se encontró usuario para el correo ${correo}`);
      usuarioId = 0;
    }

    // 1️⃣ Llamar al procedimiento real de bitácora
    await conn.query('CALL mydb.sp_bitacora_insert(?, ?, ?, ?)', [
      usuarioId,
      1, // Id_Objeto (ejemplo: módulo de seguridad)
      accion,
      descripcion,
    ]);

    return NextResponse.json({
      ok: true,
      message: 'Registro guardado en bitácora correctamente.',
    });
  } catch (error: any) {
    console.error('Error al registrar en bitácora:', error);
    return NextResponse.json(
      { error: 'Error al registrar en bitácora.' },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
