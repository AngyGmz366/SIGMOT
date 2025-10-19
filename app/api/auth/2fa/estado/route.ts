import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ ok: false, error: "Falta el ID de usuario." }, { status: 400 });
    }

    const [rows]: any = await db.query(
      `SELECT TwoFA_Enabled FROM mydb.TBL_MS_USUARIO WHERE Id_Usuario_PK = ? LIMIT 1;`,
      [id]
    );

    if (!rows.length) {
      return NextResponse.json({ ok: false, error: "Usuario no encontrado." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      enabled: rows[0].TwoFA_Enabled,
    });
  } catch (err: any) {
    console.error("❌ Error en /api/auth/2fa/estado:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
