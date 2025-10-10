export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
const pool = db;

/* ============================================================
   GET  →  Lista todos los mantenimientos
   Llama al SP: sp_mantenimiento_listar
============================================================ */
export async function GET() {
  try {
    const [rows]: any = await pool.query(`CALL sp_mantenimiento_listar_todos();`);
    const data = rows[0] || [];
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Error al listar mantenimientos:', error);
    return NextResponse.json({ error: 'Error al listar mantenimientos.' }, { status: 500 });
  }
}

/* ============================================================
   POST → Crea un nuevo mantenimiento
   Llama al SP: sp_mantenimiento_crear
============================================================ */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      Id_Unidad_FK,
      Id_TipoManto_FK,
      Id_EstadoManto_FK,
      Fecha_Programada,
      Fecha_Realizada,
      Proximo_Mantenimiento,
      Kilometraje,
      Descripcion,
      Costo_Total,
      Taller,
      Repuestos,
    } = body;

    if (!Id_Unidad_FK || !Id_TipoManto_FK || !Id_EstadoManto_FK) {
      return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 });
    }

    const [result]: any = await pool.query(
      `CALL sp_mantenimiento_crear(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        Id_Unidad_FK,
        Id_TipoManto_FK,
        Id_EstadoManto_FK,
        Fecha_Programada,
        Fecha_Realizada,
        Proximo_Mantenimiento,
        Kilometraje,
        Descripcion,
        Costo_Total,
        Taller,
        Repuestos,
      ]
    );

    const response = result[0]?.[0] || {};
    return NextResponse.json({
      message: response.Mensaje || 'Mantenimiento creado correctamente.',
      id: response.Id_Mantenimiento_Nuevo,
    });
  } catch (error: any) {
    console.error('❌ Error al crear mantenimiento:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno al registrar mantenimiento.' },
      { status: 400 }
    );
  }
}
