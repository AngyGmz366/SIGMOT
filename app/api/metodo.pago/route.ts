export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [rows]: any = await db.query(`
      SELECT 
        Id_MetodoPago_PK AS id,
        Metodo_Pago      AS metodo
      FROM TBL_METODO_PAGO
      ORDER BY Metodo_Pago ASC
    `);

    return NextResponse.json({ items: rows });
  } catch (err: any) {
    console.error('GET /api/metodo.pago', err);
    return NextResponse.json({ error: 'internal_error', detail: String(err?.message || err) }, { status: 500 });
  }
}
