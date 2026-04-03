import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const vacio = (v: any) =>
  v === null || v === undefined || String(v).trim() === '' ? 'Vacío' : String(v).trim();

// GET /api/reportes/clientes
export async function GET() {
  try {
    const [rows]: any = await db.query(
      'CALL mydb.sp_reportes_clientes(NULL, NULL, NULL);'
    );

    const raw = Array.isArray(rows) ? rows[0] || [] : [];

    const data = raw.map((r: any) => ({
      ...r,
      Id_Cliente: vacio(r.Id_Cliente),
      Nombre_Completo: vacio(r.Nombre_Completo),
      DNI: vacio(r.DNI),
      Telefono: vacio(r.Telefono),
      Estado: vacio(
        r.Estado ??
        r.estado ??
        r.Nombre_Estado ??
        r.Estado_Descripcion
      ),
    }));

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error('❌ Error al obtener reportes de clientes:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Error al obtener reportes de clientes.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}