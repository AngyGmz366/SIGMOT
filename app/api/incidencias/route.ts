// /app/api/incidencias/route.ts
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // usa tu conexión mysql2/promise

// 🟢 POST: crear incidencia
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { idUsuario, tipo, asunto, descripcion } = body;

    if (!idUsuario || !tipo || !asunto || !descripcion) {
      return NextResponse.json(
        { ok: false, error: 'Faltan datos obligatorios.' },
        { status: 400 }
      );
    }

    const [rows]: any[] = await db.query(
      'CALL sp_incidencias_crear(?, ?, ?, ?);',
      [idUsuario, tipo, asunto, descripcion]
    );

    return NextResponse.json({
      ok: true,
      message: 'Incidencia creada correctamente.',
      data: rows[0] || null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}

// 🟡 GET: listar incidencias de un usuario
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idUsuario = searchParams.get('idUsuario');

    if (!idUsuario)
      return NextResponse.json(
        { ok: false, error: 'Falta el parámetro idUsuario.' },
        { status: 400 }
      );

    const [rows]: any[] = await db.query(
      'CALL sp_incidencias_listar_por_usuario(?);',
      [idUsuario]
    );

    // Normaliza el resultado si viene como array anidado
    const data = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Error al obtener incidencias.' },
      { status: 500 }
    );
  }
}
