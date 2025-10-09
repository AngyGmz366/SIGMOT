// /app/api/clientes/by-correo/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const correo = url.searchParams.get('correo');
  if (!correo) return NextResponse.json({ error: 'correo es obligatorio' }, { status: 400 });

  try {
    const [rows]: any = await db.query(
      `
      SELECT c.Id_Cliente_PK AS idCliente,
             p.Nombres, p.Apellidos,
             co.Correo
      FROM mydb.TBL_CLIENTES c
      JOIN mydb.TBL_PERSONAS p ON p.Id_Persona_PK = c.Id_Persona_FK
      JOIN mydb.TBL_CORREOS  co ON co.Id_Correo_PK = p.Id_Correo_FK
      WHERE co.Correo = ?
      LIMIT 1
      `,
      [correo]
    );
    if (!rows.length) return NextResponse.json({ error: 'No existe' }, { status: 404 });

    const r = rows[0];
    return NextResponse.json({
      idCliente: r.idCliente,
      nombreCompleto: `${r.Nombres ?? ''} ${r.Apellidos ?? ''}`.trim(),
      correo: r.Correo
    }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.sqlMessage || e?.message || 'Error' }, { status: 500 });
  }
}
