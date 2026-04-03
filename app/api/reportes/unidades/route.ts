import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const vacio = (v: any) =>
  v === null || v === undefined || String(v).trim() === '' ? 'Vacío' : String(v).trim();

// GET /api/reportes/unidades
export async function GET() {
  try {
    const [rows]: any = await db.query('CALL mydb.sp_reportes_unidades();');

    const raw = Array.isArray(rows) ? rows[0] || [] : [];

    const data = raw.map((r: any) => ({
      ...r,
      placa: vacio(r.placa),
      marca: vacio(r.marca),
      modelo: vacio(r.modelo),
      asientos: vacio(r.asientos),
      descripcion: vacio(r.descripcion),
      anio: vacio(r.anio),
      estado: vacio(
        r.estado ??
        r.Estado ??
        r.Nombre_Estado ??
        r.Estado_Descripcion
      ),
    }));

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