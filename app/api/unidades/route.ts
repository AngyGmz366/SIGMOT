// app/api/unidades/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// ✅ GET: Obtener todas las unidades
export async function GET() {
  try {
    const [rows]: any = await db.query(`
      SELECT 
        Id_Unidad_PK AS id,
        Id_EstadoUnidad_FK AS estado_unidad_id,
        Numero_Placa AS numero_placa,
        Marca_Unidad AS marca,
        Modelo AS modelo,
        Año AS anio,
        Capacidad_Asientos AS capacidad_asientos,
        Descripcion AS descripcion
      FROM TBL_UNIDADES
      ORDER BY Marca_Unidad, Modelo
      LIMIT 500
    `);
    return NextResponse.json({ items: rows });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'internal_error', detail: String(err) },
      { status: 500 }
    );
  }
}

// ✅ POST: Crear una nueva unidad
export async function POST(req: Request) {
  try {
    const {
      Id_EstadoUnidad_FK,
      Numero_Placa,
      Marca_Unidad,
      Modelo,
      Año,
      Capacidad_Asientos,
      Descripcion,
    } = await req.json();

    const [result]: any = await db.query(
      `INSERT INTO TBL_UNIDADES 
        (Id_EstadoUnidad_FK, Numero_Placa, Marca_Unidad, Modelo, Año, Capacidad_Asientos, Descripcion)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        Id_EstadoUnidad_FK,
        Numero_Placa,
        Marca_Unidad,
        Modelo,
        Año,
        Capacidad_Asientos,
        Descripcion,
      ]
    );

    return NextResponse.json({ id: result.insertId });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'internal_error', detail: String(err) },
      { status: 500 }
    );
  }
}
