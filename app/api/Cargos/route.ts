import { NextResponse } from 'next/server';
import { getSafeConnection } from '@/lib/db_api';

// GET: Obtener todos los cargos
export async function GET() {
  const conn = await getSafeConnection();
  try {
    const [rows] = await conn.query('CALL sp_cargos_obtener_todos()');
    // Los stored procedures devuelven arrays anidados
    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    console.error('Error al obtener cargos:', error);
    return NextResponse.json({ error: 'Error al obtener cargos' }, { status: 500 });
  }
}