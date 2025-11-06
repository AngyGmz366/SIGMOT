import { NextResponse } from 'next/server';
import { getSafeConnection } from '@/lib/db_api';

export async function GET() {
  const conn = await getSafeConnection();
  try {
    const [rows]: any = await conn.query('CALL sp_personas_empleados_disponibles();');
    return NextResponse.json(rows[0], { status: 200 });
  } catch (error: any) {
    console.error('❌ Error al obtener personas empleados disponibles:', error);
    return NextResponse.json({ error: error.message || 'Error al obtener personas empleados disponibles' }, { status: 500 });
  }
}
