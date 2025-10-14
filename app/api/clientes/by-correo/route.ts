// /app/api/clientes/by-correo/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const correoRaw = url.searchParams.get('correo');
  if (!correoRaw) {
    return NextResponse.json({ error: 'correo es obligatorio' }, { status: 400 });
  }

  const correo = correoRaw.trim().toLowerCase();

  try {
    const [rows]: any = await db.query(
      `
      SELECT 
        c.Id_Cliente_PK AS idCliente,
        p.Nombres, 
        p.Apellidos,
        co.Correo
      FROM TBL_CLIENTES c
      JOIN TBL_PERSONAS p ON p.Id_Persona_PK = c.Id_Persona_FK
      JOIN TBL_CORREOS  co ON co.Id_Correo_PK = p.Id_Correo_FK
      WHERE LOWER(co.Correo) = ?
      LIMIT 1;
      `,
      [correo]
    );

    if (!rows?.length) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    const r = rows[0];
    return NextResponse.json(
      {
        idCliente: r.idCliente,
        nombre: r.Nombres ?? '',
        apellido: r.Apellidos ?? '',
        nombreCompleto: `${r.Nombres ?? ''} ${r.Apellidos ?? ''}`.trim(),
        correo: r.Correo,
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error('❌ Error al buscar cliente por correo:', e);
    return NextResponse.json(
      { error: e?.sqlMessage || e?.message || 'Error al buscar cliente' },
      { status: 500 }
    );
  }
}
