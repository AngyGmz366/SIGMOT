export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';



/**
 * 📄 GET /api/usuarios/obtener?id=#
 * Devuelve la información detallada de un usuario.
 */
export async function GET(req: Request) {
  let conn;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'Debe proporcionar el parámetro id.' },
        { status: 400 }
      );
    }

    conn = await db.getConnection();
    const [rows]: any = await conn.query('CALL mydb.sp_ms_usuario_obtener(?);', [id]);

    return NextResponse.json({
      ok: true,
      item: rows[0]?.[0] || null
    });
  } catch (error: any) {
    console.error('❌ Error en GET /api/usuarios/obtener:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}
