// app/api/rutas/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// GET: Obtener todas las rutas
export async function GET() {
  try {
    const [rows]: any = await db.query(`
      SELECT 
        Id_Ruta_PK AS id,
        Origen AS origen,
        Destino AS destino,
        Distancia AS distancia,
        Tiempo_Estimado AS tiempo_estimado,
        Descripcion AS descripcion,
        Estado AS estado,
        Horarios AS horarios,
        Precio AS precio
      FROM TBL_RUTAS
      ORDER BY Origen, Destino
      LIMIT 500
    `);
    return NextResponse.json({ items: rows });
  } catch (err: any) {
    return NextResponse.json({ error: 'internal_error', detail: String(err) }, { status: 500 });
  }
}

// POST: Crear una nueva ruta
export async function POST(req: Request) {
  try {
    const { Origen, Destino, Distancia, Tiempo_Estimado, Descripcion, Estado, Horarios, Precio } = await req.json();
    const [result]: any = await db.query(
      `INSERT INTO TBL_RUTAS (Origen, Destino, Distancia, Tiempo_Estimado, Descripcion, Estado, Horarios, Precio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [Origen, Destino, Distancia, Tiempo_Estimado, Descripcion, Estado || 'ACTIVA', JSON.stringify(Horarios), Precio]
    );
    return NextResponse.json({ id: result.insertId });
  } catch (err: any) {
    return NextResponse.json({ error: 'internal_error', detail: String(err) }, { status: 500 });
  }
}
