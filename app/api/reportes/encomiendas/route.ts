import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/reportes/encomiendas
// GET /api/reportes/encomiendas
export async function GET() {
  try {
    const [rows]: any = await db.query(
      'CALL mydb.sp_reportes_encomiendas(NULL, NULL, NULL, NULL);' // Si no tienes filtros, usa NULL o pasa parámetros desde el frontend
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
