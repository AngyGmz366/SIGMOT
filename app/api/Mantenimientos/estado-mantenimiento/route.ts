export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
const pool = db;

/* ============================================================
   GET → Usa sp_estado_mantenimiento_listar
============================================================ */
export async function GET() {
  try {
    const [rows]: any = await pool.query(`CALL sp_estado_mantenimiento_listar();`);
    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('❌ Error al listar estados de mantenimiento:', error);
    return NextResponse.json(
      { error: 'Error al listar estados de mantenimiento.' },
      { status: 500 }
    );
  }
}
