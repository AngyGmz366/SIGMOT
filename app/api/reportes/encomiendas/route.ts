import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // ✅ Usa NULL para todos los parámetros del SP
    const [rows]: any = await db.query(
      'CALL mydb.sp_reportes_encomiendas(NULL, NULL, NULL, NULL);'
    );

    const data = Array.isArray(rows) ? rows[0] || [] : [];
    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error('❌ Error al obtener reportes de encomiendas:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al obtener reportes de encomiendas.', details: error.message },
      { status: 500 }
    );
  }
}
