// /app/api/clientes/[id]/historial/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // tu conexión MySQL

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const clienteId = parseInt(params.id, 10);

  if (isNaN(clienteId)) {
    return NextResponse.json({ error: 'ID de cliente inválido' }, { status: 400 });
  }

  try {
    const connection = await db.getConnection(); // si usas mysql2/promise pool
    await connection.beginTransaction();

    // Ejecutar el procedimiento almacenado
    const [results]: any = await connection.query('CALL sp_historial_cliente(?)', [clienteId]);

    // Los procedimientos en MySQL devuelven un array por cada SELECT
    // results[0] → tickets, results[1] → viajes
    const tickets = results[0] || [];
    const viajes = results[1] || [];

    await connection.commit();
    connection.release();

    return NextResponse.json({ tickets, viajes });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
