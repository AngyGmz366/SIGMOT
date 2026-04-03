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
      'CALL mydb.sp_reportes_rutas(NULL, NULL, NULL);'
    );

    const raw = Array.isArray(rows) ? rows[0] || [] : [];

    const data = raw.map((r: any) => ({
      ...r,
      Id_Ruta_PK: vacio(r.Id_Ruta_PK),
      Distancia: vacio(r.Distancia),
      Tiempo_Estimado: vacio(r.Tiempo_Estimado),
      Origen: vacio(r.Origen),
      Destino: vacio(r.Destino),
      Descripcion: vacio(r.Descripcion),
      Estado: vacio(
        r.Estado ??
        r.estado ??
        r.Nombre_Estado ??
        r.Estado_Descripcion
      ),
      Precio: moneda(r.Precio),
    }));

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