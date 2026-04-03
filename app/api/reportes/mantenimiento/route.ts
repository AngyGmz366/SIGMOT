import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const vacio = (v: any) =>
  v === null || v === undefined || String(v).trim() === '' ? 'Vacío' : String(v).trim();

const moneda = (v: any) => {
  if (v === null || v === undefined || String(v).trim() === '') return 'Vacío';
  const n = Number(v);
  return isNaN(n)
    ? `L. ${String(v).trim()}`
    : `L. ${n.toLocaleString('es-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
};

export async function GET() {
  try {
    const [rows]: any = await db.query(
      'CALL mydb.sp_reportes_mantenimientos(NULL, NULL, NULL, NULL, NULL);'
    );

    const raw = Array.isArray(rows) ? rows[0] || [] : [];

    const data = raw.map((r: any) => ({
      ...r,
      Id_Mantenimiento_PK: vacio(r.Id_Mantenimiento_PK),
      Fecha_Programada: vacio(r.Fecha_Programada),
      Fecha_Realizada: vacio(r.Fecha_Realizada),
      Proximo_Mantenimiento: vacio(r.Proximo_Mantenimiento),
      Kilometraje: vacio(r.Kilometraje),
      Costo_Total: moneda(r.Costo_Total),
      Taller: vacio(r.Taller),
      Repuestos: vacio(r.Repuestos),
      Descripcion: vacio(r.Descripcion),
      Placa: vacio(r.Placa),
      Tipo_Mantenimiento: vacio(r.Tipo_Mantenimiento),
      Estado: vacio(
        r.Estado ??
        r.estado ??
        r.Nombre_Estado ??
        r.Estado_Descripcion
      ),
    }));

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error('❌ Error al obtener reportes de mantenimientos:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Error al obtener reportes de mantenimientos.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}