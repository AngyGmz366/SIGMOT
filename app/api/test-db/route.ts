
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT NOW() AS fecha;");
    return NextResponse.json({ ok: true, result: rows });
  } catch (error: any) {
    console.error("Error de conexión:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
// app/api/test-db/route.ts