export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // <-- si exportas pool: import { pool as db } from "@/lib/db"

type Ctx = { params: { id: string } };

// POST /api/unidades/:id/mandar-mantenimiento
// Body: { tipoMantoFk: number, fechaProgramada: "YYYY-MM-DD", taller?: string, descripcion?: string }
export async function POST(req: Request, { params }: Ctx) {
  const idUnidad = Number(params.id);
  const body = await req.json().catch(() => ({}));

  const tipo = Number(body?.tipoMantoFk);
  const fecha = body?.fechaProgramada;
  const taller = body?.taller ?? null;
  const descripcion = body?.descripcion ?? null;

  if (!idUnidad || !tipo || !fecha) {
    return NextResponse.json(
      { error: "Faltan datos: tipoMantoFk y fechaProgramada son obligatorios." },
      { status: 400 }
    );
  }

  try {
    const [rows]: any = await db.query(
      "CALL mydb.sp_unidad_mandar_mantenimiento(?,?,?,?,?)",
      [idUnidad, tipo, fecha, taller, descripcion]
    );
    const out = rows?.[0]?.[0] ?? {};
    return NextResponse.json(out, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "No se pudo mandar a mantenimiento" }, { status: 400 });
  }
}
