// app/api/ventas/init/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db_api";  // 👈 importar tu pool

export const runtime = "nodejs";

export async function GET() {
  try {
    const [clientes] = await db.query("SELECT * FROM TBL_CLIENTES");
    const [viajes]   = await db.query("SELECT * FROM TBL_VIAJES");
    const [unidades] = await db.query("SELECT * FROM TBL_UNIDADES");
    const [metodos]  = await db.query("SELECT * FROM TBL_METODO_PAGO");
    const [estados]  = await db.query("SELECT * FROM TBL_ESTADO_TICKET");

    return NextResponse.json({
      clientes,
      viajes,
      unidades,
      metodos,
      estados,
    });
  } catch (err: any) {
    console.error("❌ Error en /api/ventas/init:", err);
    return NextResponse.json(
      { error: "internal_error", detail: err.message },
      { status: 500 }
    );
  }
}
