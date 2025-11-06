import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/reportes/rutas
export async function GET() {
  try {
    // 🔹 Llamar al procedimiento almacenado
    const [rows]: any = await db.query(
      'CALL mydb.sp_reportes_rutas(NULL, NULL, NULL);'
    );

    // 🔹 Normalizar resultado (MySQL devuelve array anidado)
    const data = Array.isArray(rows) ? rows[0] || [] : [];

    // 🔹 Respuesta JSON
    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error('❌ Error al obtener reportes de rutas:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Error al obtener reportes de rutas.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}