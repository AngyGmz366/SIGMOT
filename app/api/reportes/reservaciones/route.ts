import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const vacio = (v: any) =>
  v === null || v === undefined || String(v).trim() === '' ? 'Vacío' : String(v).trim();

// GET /api/reportes/reservaciones
export async function GET() {
  try {
    const [rows]: any = await db.query(
      'CALL mydb.sp_reportes_reservaciones(NULL, NULL, NULL, NULL, NULL);'
    );

    const raw = Array.isArray(rows) ? rows[0] || [] : [];

    const data = raw.map((r: any) => ({
      ...r,
      Id_Reserva_PK: vacio(r.Id_Reserva_PK),
      Cliente: vacio(r.Cliente),
      Tipo_Reserva: vacio(r.Tipo_Reserva),
      Estado: vacio(
        r.Estado ??
        r.estado ??
        r.Nombre_Estado ??
        r.Estado_Descripcion
      ),
      Fecha_Reserva: vacio(r.Fecha_Reserva),
      Asiento: vacio(r.Asiento),
    }));

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