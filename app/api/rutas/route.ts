// app/api/rutas/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';


export async function GET() {
  const conn = await db.getConnection();
  try {
    const [rows]: any = await conn.query(`
      SELECT Id_Ruta_PK, Distancia, Tiempo_Estimado, Origen, Destino, Descripcion, Estado
      FROM mydb.TBL_RUTAS
      ORDER BY Id_Ruta_PK DESC
    `);
    return NextResponse.json({ items: rows ?? [] }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.sqlMessage || e?.message || 'Error' }, { status: 500 });
  } finally {
    conn.release();
  }
}

export async function POST(req: Request) {
  const pool = db;
  const conn = await pool.getConnection();
  try {
    const {
      distancia = null,          // number | null
      tiempo_estimado = null,    // string 'HH:mm:ss' | null
      origen,
      destino,
      descripcion = null,        // string | null
      estado = 'ACTIVA',         // 'ACTIVA' | 'INACTIVA'
    } = await req.json().catch(() => ({}));

    // Validaciones mínimas
    if (!origen || !destino) {
      return NextResponse.json({ error: 'Origen y Destino son obligatorios.' }, { status: 400 });
    }

    // 1) Llamar SP con OUT param (@p_id)
    await conn.query(
      'CALL mydb.sp_rutas_crear_max5(?,?,?,?,?,?, @p_id)',
      [distancia, tiempo_estimado, String(origen).trim(), String(destino).trim(), descripcion, String(estado).toUpperCase()]
    );

    // 2) Leer el OUT param
    const [rows2]: any = await conn.query('SELECT @p_id AS id');
    const newId = rows2?.[0]?.id ?? null;

    return NextResponse.json({ ok: true, id: newId }, { status: 201 });
  } catch (e: any) {
    // El SP usa SIGNAL SQLSTATE '45000' para errores de negocio (tope 5 activas, duplicados, estado inválido)
    const msg = (e?.sqlMessage || e?.message || 'Error').toString();
    const isBusiness = /Límite|inválido|existe|no existe/i.test(msg);
    return NextResponse.json({ ok: false, error: msg }, { status: isBusiness ? 400 : 500 });
  } finally {
    conn.release();
  }

  
}
