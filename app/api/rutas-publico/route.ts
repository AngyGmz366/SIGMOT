export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const conn = await db.getConnection();
  try {
    const [rows]: any = await conn.query(`
      SELECT
        Id_Ruta_PK,
        Origen,
        Destino,
        Tiempo_Estimado,
        CAST(Distancia AS DECIMAL(10,2)) AS Distancia,
        CAST(Precio    AS DECIMAL(12,2)) AS Precio,
        Horarios
      FROM mydb.TBL_RUTAS
      WHERE Estado = 'ACTIVA'
        AND Precio IS NOT NULL
        AND Horarios IS NOT NULL
        AND JSON_LENGTH(Horarios) > 0
      ORDER BY Id_Ruta_PK DESC
    `);

    const items = (rows ?? []).map((r: any) => {
      let horarios: string[] = [];
      try {
        const arr = r.Horarios ? JSON.parse(r.Horarios) : [];
        horarios = Array.isArray(arr) ? arr.map((h: string) => String(h).slice(0, 5)) : [];
      } catch {}
      return {
        id: r.Id_Ruta_PK,
        origen: r.Origen,
        destino: r.Destino,
        tiempoEstimado: r.Tiempo_Estimado,                 // HH:mm:ss (si lo usas)
        distancia: r.Distancia === null ? null : Number(r.Distancia),
        precio:    r.Precio    === null ? null : Number(r.Precio),
        horarios,                                              // ["06:00","12:00","18:00"]
      };
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.sqlMessage || e?.message || 'Error' }, { status: 500 });
  } finally {
    conn.release();
  }
}
