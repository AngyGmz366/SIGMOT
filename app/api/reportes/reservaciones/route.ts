import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/reportes/reservaciones
export async function GET() {
  try {
    // 🔹 Llamada al procedimiento almacenado
    const [rows]: any = await db.query(
      'CALL mydb.sp_reportes_reservaciones(NULL, NULL, NULL, NULL, NULL);'
    );

    // 🔹 Normalizar resultado (MySQL devuelve array anidado)
    const data = Array.isArray(rows) ? rows[0] || [] : [];

    // 🔹 Respuesta JSON lista para el front
    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error('❌ Error al obtener reportes de reservaciones:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Error al obtener reportes de reservaciones.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
