import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticator } from "otplib";
import QRCode from "qrcode";

export async function POST(req: Request) {
  try {
    const { identificador, tipoUsuario, correo } = await req.json();
    // tipoUsuario = 'FIREBASE' o 'LOCAL'

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(correo, "Saenz", secret);
    const qrDataUrl = await QRCode.toDataURL(otpauth);

    // Guardar secreto vía SP
    await db.query("CALL sp_2fa_guardar_secreto(?, ?, ?);", [
      identificador,
      tipoUsuario,
      secret,
    ]);

    return NextResponse.json({
      ok: true,
      secret,
      qrDataUrl,
      message: "Se generó el secreto 2FA correctamente.",
    });
  } catch (err: any) {
    console.error("❌ Error en /api/2fa/setup:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
