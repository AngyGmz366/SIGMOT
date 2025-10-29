import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [rows]: any = await db.query('CALL mydb.sp_bitacora_listar();');
    return NextResponse.json({ ok: true, items: rows[0] });
  } catch (error: any) {
    console.error('❌ Error en GET /api/seguridad/bitacora:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
