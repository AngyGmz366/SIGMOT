import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/reportes/boletos
export async function GET() {
  try {
    // 🔹 Llamar al procedimiento almacenado
    const [rows]: any = await db.query('CALL mydb.sp_reportes_boletos;');

    // 🔹 Normalizar resultado
    const data = Array.isArray(rows) ? rows[0] || [] : [];

    // 🔹 Respuesta JSON
    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error('❌ Error al obtener reportes de boletos:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Error al obtener reportes de boletos.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
