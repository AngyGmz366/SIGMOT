import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // usa tu conexión mysql2/promise

// GET /api/reportes/unidades
export async function GET() {
  try {
    // 🔹 Llamada al procedimiento almacenado
    const [rows]: any = await db.query('CALL mydb.sp_reportes_unidades();');

    // 🔹 Normaliza el resultado (MySQL devuelve un array anidado)
    const data = Array.isArray(rows) ? rows[0] || [] : [];

    // 🔹 Respuesta JSON para el front
    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error('❌ Error al obtener reportes de unidades:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Error al obtener los reportes de unidades.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
