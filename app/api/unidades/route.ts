export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { db } from "../../../lib/db"; // ruta relativa desde app/api/unidades

// GET /api/unidades?placa=&marca=&modelo=&anio=&estado=&limit=50&offset=0
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const placa  = searchParams.get("placa");
  const marcaUnidad  = searchParams.get("marcaUnidad");
  const modelo = searchParams.get("modelo");
  const anio   = searchParams.get("anio");
  const estado = searchParams.get("estado");
  const limit  = Number(searchParams.get("limit") ?? 50);
  const offset = Number(searchParams.get("offset") ?? 0);

  const [rows]: any = await db.query(
    "CALL mydb.sp_unidades_listar(?,?,?,?,?,?,?)",
    [
      placa ?? null,
      marcaUnidad ?? null,
      modelo ?? null,
      anio ? Number(anio) : null,
      estado ? Number(estado) : null,
      limit,
      offset,
    ]
  );
  return NextResponse.json(rows[0] ?? []);
}

// POST /api/unidades
export async function POST(req: Request) {
  try {
    const b = await req.json();
    const params = [
      b.numeroPlaca,
      b.marcaUnidad ?? null,
      b.modelo ?? null,
      b.anio ?? null,
      b.capacidadAsientos ?? null,
      b.descripcion ?? null,
      b.idEstadoFk ?? 1,
    ];
    const [rows]: any = await db.query("CALL mydb.sp_unidades_crear_con_asientos(?,?,?,?,?,?,?)", params);
    const nuevoId = rows[0][0].Id_Unidad_PK;

    const [one]: any = await db.query("CALL mydb.sp_unidades_obtener(?)", [nuevoId]);
    return NextResponse.json(one[0][0], { status: 201 });
  } catch (e: any) {
    const msg = e?.message || "Error al crear unidad";
    const status = /placa.*existe|duplicad/i.test(msg) ? 409 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
