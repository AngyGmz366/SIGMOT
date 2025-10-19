import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { identificador, tipoUsuario } = await req.json();

    // 🧩 Si es LOCAL y el identificador es un número, buscar su correo
    let identificadorReal = identificador;
    if (tipoUsuario === 'LOCAL' && /^\d+$/.test(String(identificador))) {
      const [rows]: any = await db.query(
        "SELECT Correo_Electronico FROM mydb.TBL_MS_USUARIO WHERE Id_Usuario_PK = ? LIMIT 1;",
        [Number(identificador)]
      );
      if (rows.length) identificadorReal = rows[0].Correo_Electronico;
    }

    await db.query("CALL mydb.sp_2fa_desactivar(?, ?);", [identificadorReal, tipoUsuario]);

    return NextResponse.json({
      ok: true,
      message: "2FA desactivado correctamente.",
    });
  } catch (err: any) {
    console.error("❌ Error en /api/auth/2fa/disable:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
