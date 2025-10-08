export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [rows]: any = await db.query(`
      SELECT
        v.Id_Viaje_PK     AS id,
        v.Fecha,
        v.Hora_Salida,
        v.Hora_Estimada_Llegada,
        v.Id_Unidad_FK,
        v.Id_Rutas_FK,
        r.Origen,
        r.Destino,
        r.Precio
      FROM TBL_VIAJES v
      LEFT JOIN TBL_RUTAS r ON r.Id_Ruta_PK = v.Id_Rutas_FK
      ORDER BY v.Fecha DESC, v.Hora_Salida ASC
      LIMIT 500
    `);

    return NextResponse.json({ items: rows });
  } catch (err: any) {
    console.error('❌ GET /api/viajes:', err);
    return NextResponse.json(
      { error: 'internal_error', detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}
