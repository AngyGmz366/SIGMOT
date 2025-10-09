// /app/api/rutas-activas/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [rows]: any = await db.query('SELECT * FROM VW_RUTAS_ACTIVAS');
    const items = rows.map((r: any) => ({
      id: r.Id_Ruta_PK,
      label: `${r.Origen} → ${r.Destino}`,
      value: r.Id_Ruta_PK,
      precio: r.Precio,
      tiempo: r.Tiempo_Estimado,
    }));
    return NextResponse.json({ items }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.sqlMessage || e?.message || 'Error' }, { status: 500 });
  }
}
