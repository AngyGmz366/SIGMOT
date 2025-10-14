// app/api/rutas/[id]/estado/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  const conn = await db.getConnection();
  try {
    // Asegúrate de que params.id esté resuelto correctamente y convertirlo a número
    const id = Number(params.id);

    // Validar si id es un número
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Obtener el estado desde el cuerpo de la solicitud
    const { estado } = await req.json().catch(() => ({}));
    if (!estado) {
      return NextResponse.json({ error: 'Estado es obligatorio.' }, { status: 400 });
    }

    // Ejecutar el procedimiento almacenado para cambiar el estado
    await conn.query('CALL mydb.sp_rutas_cambiar_estado(?, ?)', [id, String(estado).toUpperCase()]);

    return NextResponse.json({ ok: true, id, estado: String(estado).toUpperCase() }, { status: 200 });
  } catch (e: any) {
    const msg = (e?.sqlMessage || e?.message || 'Error').toString();
    const isBusiness = /no existe|activar|inválido|Límite/i.test(msg);
    return NextResponse.json({ ok: false, error: msg }, { status: isBusiness ? 400 : 500 });
  } finally {
    conn.release();
  }
}
