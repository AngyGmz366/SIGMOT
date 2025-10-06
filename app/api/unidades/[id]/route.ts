export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const id = Number(params.id);
  const [rows]: any = await db.query("CALL mydb.sp_unidades_obtener(?)", [id]);
  const row = rows[0][0];
  if (!row) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const id = Number(params.id);
    const b = await req.json();
    await db.query("CALL mydb.sp_unidades_actualizar(?,?,?,?,?,?,?,?)", [
      id,
      b.numeroPlaca,
      b.marca ?? null,
      b.modelo ?? null,
      b.anio ?? null,
      b.capacidadAsientos ?? null,
      b.descripcion ?? null,
      b.idEstadoFk ?? null,
    ]);
    const [rows]: any = await db.query("CALL mydb.sp_unidades_obtener(?)", [id]);
    return NextResponse.json(rows[0][0]);
  } catch (e: any) {
    const msg = e?.message || "Error al actualizar";
    const status = /placa.*registrada/i.test(msg) ? 409 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const id = Number(params.id);
  const [rows]: any = await db.query("CALL mydb.sp_unidades_borrar(?)", [id]);
  return NextResponse.json(rows[0][0]); // { filas_afectadas: n }
}
