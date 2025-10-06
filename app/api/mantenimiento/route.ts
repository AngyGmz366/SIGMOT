import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/mantenimientos
export async function GET() {
  try {
    const [rows]: any = await db.query(`CALL sp_mantenimientos_listar();`);
    return NextResponse.json({ items: rows[0] }); // [0] porque CALL devuelve múltiples resultsets
  } catch (err: any) {
    console.error("Error al listar mantenimientos:", err);
    return NextResponse.json({ error: "Error interno al listar mantenimientos" }, { status: 500 });
  }
}
