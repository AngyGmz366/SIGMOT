import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const conn = await db.getConnection();

  try {
    const id = Number(params.id);
    const { precio, descripcion, horarios } = await req.json();

    if (!id || isNaN(id)) {
      return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
    }

    await conn.query(
      `CALL sp_rutas_actualizar(?, ?, ?, ?);`,
      [id, precio ?? 0, descripcion ?? null, JSON.stringify(horarios ?? [])]
    );

    return NextResponse.json({ ok: true, message: "Ruta actualizada correctamente" });
  } catch (err: any) {
    console.error("❌ Error al actualizar ruta:", err);
    return NextResponse.json(
      { ok: false, error: err.sqlMessage || err.message },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
