// /app/api/clientes/by-correo/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const dniRaw = url.searchParams.get('dni');
  if (!dniRaw) {
    return NextResponse.json({ error: 'dni es obligatorio' }, { status: 400 });
  }

  const dni = dniRaw.trim();

  const conn = await db.getConnection();
  try {
    // Buscar persona por DNI
    const [rows]: any = await conn.query(
      `
      SELECT 
        p.Id_Persona_PK    AS idPersona,
        c.Id_Cliente_PK    AS idCliente,
        p.Nombres,
        p.Apellidos,
        p.DNI,
        co.Correo
      FROM mydb.TBL_PERSONAS p
      LEFT JOIN mydb.TBL_CLIENTES c ON c.Id_Persona_FK = p.Id_Persona_PK
      LEFT JOIN mydb.TBL_CORREOS  co ON co.Id_Correo_PK = p.Id_Correo_FK
      WHERE p.DNI = ?
      LIMIT 1;
      `,
      [dni]
    );

    if (!rows?.length) {
      return NextResponse.json({ error: 'Persona no encontrada por DNI' }, { status: 404 });
    }

    const r = rows[0];
    return NextResponse.json(
      {
        idPersona: r.idPersona,
        idCliente: r.idCliente ?? null, // puede ser null si no tiene cliente asociado
        nombre: r.Nombres ?? '',
        apellido: r.Apellidos ?? '',
        nombreCompleto: `${r.Nombres ?? ''} ${r.Apellidos ?? ''}`.trim(),
        dni: r.DNI,
        correo: r.Correo ?? null,
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error('❌ Error al buscar persona por DNI:', e);
    return NextResponse.json(
      { error: e?.sqlMessage || e?.message || 'Error al buscar persona' },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}