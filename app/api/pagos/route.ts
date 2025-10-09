import { NextResponse } from 'next/server';
import { getSafeConnection } from '@/lib/db_api';

export const runtime = 'nodejs';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const idCliente = Number(params.id);
  const conn = await getSafeConnection();
  try {
    const [rows]: any = await conn.query(`
      SELECT 
        t.Id_Ticket_PK AS id,
        DATE_FORMAT(t.Fecha_Hora_Compra, '%Y-%m-%d') AS fechaPago,
        t.Precio_Total AS monto,
        mp.Metodo_Pago AS metodoPago
      FROM TBL_TICKET t
      JOIN TBL_METODO_PAGO mp ON mp.Id_MetodoPago_PK = t.Id_MetodoPago_FK
      WHERE t.Id_Cliente_FK = ?;
    `, [idCliente]);
    return NextResponse.json({ items: rows });
  } catch (err: any) {
    console.error('❌ Error en /clientes/[id]/pagos:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    conn.release();
  }
}
