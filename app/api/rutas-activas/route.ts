// /app/api/rutas-activas/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Manejo de la solicitud GET para obtener rutas activas
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

// Manejo de la solicitud POST para asociar unidades a rutas activas
export async function POST(req: Request) {
  const { id_ruta, horarios, unidades } = await req.json(); // Recibiendo los datos del frontend

  // Validar que los parámetros estén completos
  if (!id_ruta || !horarios || !unidades) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
  }

  try {
    // Llamar al procedimiento almacenado sp_asociar_unidades_activas_a_rutas_con_horarios
    const result = await db.query(`
      CALL sp_asociar_unidades_activas_a_rutas_con_horarios(?, ?, ?)
    `, [id_ruta, JSON.stringify(horarios), JSON.stringify(unidades)]);

    // Responder con mensaje de éxito
    return NextResponse.json({ message: 'Unidades asociadas correctamente a la ruta' }, { status: 200 });

  } catch (error) {
    console.error('Error al ejecutar la SP:', error);
    return NextResponse.json({ error: 'Error al ejecutar la SP' }, { status: 500 });
  }
}
