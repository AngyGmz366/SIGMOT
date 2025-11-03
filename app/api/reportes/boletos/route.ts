import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // ✅ Usa NULL para todos los parámetros (6 esperados)
    const [rows]: any = await db.query(
      'CALL mydb.sp_reportes_boletos(NULL, NULL, NULL, NULL, NULL, NULL);'
    );

    const data = Array.isArray(rows) ? rows[0] || [] : [];
    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error('❌ Error al obtener reportes de boletos:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al obtener reportes de boletos.', details: error.message },
      { status: 500 }
    );
  }
}
