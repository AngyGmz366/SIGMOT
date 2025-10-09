export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [rows]: any = await db.query(`
      SELECT 
        Id_PuntoVenta_PK AS id,
        Nombre_Punto     AS nombre,
        Ubicacion        AS ubicacion
      FROM TBL_PUNTO_VENTA
      ORDER BY Nombre_Punto ASC
    `);

    return NextResponse.json({ items: rows });
  } catch (err: any) {
    console.error('GET /api/puntos-venta', err);
    return NextResponse.json({ error: 'internal_error', detail: String(err?.message || err) }, { status: 500 });
  }
}
