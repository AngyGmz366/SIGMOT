// /app/api/incidencias/[id]/route.ts
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 🟢 GET: obtener detalles de una incidencia
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!id)
      return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });

    const [rows]: any[] = await db.query('CALL sp_incidencia_obtener(?);', [id]);
    const data = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0][0] : rows[0];

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Error al obtener incidencia.' },
      { status: 500 }
    );
  }
}

// 🔴 PUT: cancelar una incidencia
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    const { idUsuario, accion } = body;

    if (!id || !idUsuario)
      return NextResponse.json(
        { ok: false, error: 'Faltan datos obligatorios.' },
        { status: 400 }
      );

    // Acción: "cancelar"
    if (accion === 'cancelar') {
      await db.query('CALL sp_incidencia_cancelar(?, ?);', [id, idUsuario]);
      return NextResponse.json({
        ok: true,
        message: 'Incidencia cancelada correctamente.',
      });
    }

    return NextResponse.json(
      { ok: false, error: 'Acción no válida.' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Error al actualizar incidencia.' },
      { status: 500 }
    );
  }
}

