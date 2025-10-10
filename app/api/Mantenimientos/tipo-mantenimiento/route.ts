export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
const pool = db;

/* ============================================================
   GET → Usa sp_tipo_mantenimiento_listar
============================================================ */
export async function GET() {
  try {
    const [rows]: any = await pool.query(`CALL sp_tipo_mantenimiento_listar();`);
    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('❌ Error al listar tipos de mantenimiento:', error);
    return NextResponse.json(
      { error: 'Error al listar tipos de mantenimiento.' },
      { status: 500 }
    );
  }
}

/* ============================================================
   POST → Usa sp_tipo_mantenimiento_insertar
============================================================ */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { Servicio, Descripcion } = body;

    if (!Servicio || !Descripcion) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios.' },
        { status: 400 }
      );
    }

    const [rows]: any = await pool.query(
      `CALL sp_tipo_mantenimiento_insertar(?, ?);`,
      [Servicio, Descripcion]
    );

    return NextResponse.json(rows[0][0]);
  } catch (error: any) {
    console.error('❌ Error al insertar tipo de mantenimiento:', error);
    return NextResponse.json(
      { error: error.message || 'Error al registrar tipo de mantenimiento.' },
      { status: 500 }
    );
  }
}