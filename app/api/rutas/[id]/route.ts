// app/api/rutas/[id]/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

type Params = { params: { id: string } };

export async function PUT(req: Request, { params }: Params) {
  const conn = await db.getConnection();
  try {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const { distancia = null, tiempo_estimado = null, origen, destino, descripcion = null, estado = 'ACTIVA' } = body;
    if (!origen || !destino) return NextResponse.json({ error: 'Origen y Destino son obligatorios.' }, { status: 400 });

    await conn.query('CALL mydb.sp_rutas_actualizar(?,?,?,?,?,?,?)', [
      id, distancia, tiempo_estimado, String(origen).trim(), String(destino).trim(), descripcion, String(estado).toUpperCase()
    ]);

    return NextResponse.json({ ok: true, id }, { status: 200 });
  } catch (e: any) {
    const msg = (e?.sqlMessage || e?.message || 'Error').toString();
    const isBusiness = /no existe|Otro registro|activar|inválido/i.test(msg);
    return NextResponse.json({ ok: false, error: msg }, { status: isBusiness ? 400 : 500 });
  } finally {
    conn.release();
  }
}
