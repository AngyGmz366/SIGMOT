export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  const conn = await db.getConnection();
  try {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const body = await req.json().catch(() => null);
    // Se espera un array: ["06:00:00","12:00:00"]
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Se requiere un arreglo JSON de horas HH:mm:ss' }, { status: 400 });
    }

    // Validación mínima frontend (el SP valida otra vez)
    for (const h of body) {
      if (typeof h !== 'string' || !/^\d{2}:\d{2}:\d{2}$/.test(h)) {
        return NextResponse.json({ error: 'Formato inválido. Use HH:mm:ss' }, { status: 400 });
      }
    }

    await conn.query('CALL mydb.sp_ruta_horarios_guardar(?, ?)', [id, JSON.stringify(body)]);

    return NextResponse.json({ ok: true, id }, { status: 200 });
  } catch (e: any) {
    const msg = (e?.sqlMessage || e?.message || 'Error').toString();
    const status = /no existe|arreglo|formato|duplicados/i.test(msg) ? 400 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  } finally {
    conn.release();
  }
}
