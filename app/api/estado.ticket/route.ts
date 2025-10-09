export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [rows]: any = await db.query(`
      SELECT 
        Id_EstadoTicket_PK AS id,
        Estado_Ticket      AS estado
      FROM TBL_ESTADO_TICKET
      ORDER BY Estado_Ticket ASC
    `);

    return NextResponse.json({ items: rows });
  } catch (err: any) {
    console.error('GET /api/estados-ticket', err);
    return NextResponse.json({ error: 'internal_error', detail: String(err?.message || err) }, { status: 500 });
  }
}
