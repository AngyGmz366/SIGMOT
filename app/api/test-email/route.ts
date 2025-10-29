import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Permite tanto GET como POST
export async function POST() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"SIGMOT - Soporte Técnico" <${process.env.SMTP_USER}>`,
      to: "frank.amgz@gmail.com",
      subject: "🔧 Prueba de conexión SMTP desde SIGMOT",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #6a1b9a;">Prueba de conexión SMTP</h2>
          <p>Este correo fue enviado correctamente desde tu sistema SIGMOT.</p>
          <p>Si estás viendo este mensaje, la configuración SMTP funciona ✅.</p>
          <br/>
          <small style="color:#777;">© SIGMOT - Sistema de Gestión de Movilidad y Transporte</small>
        </div>
      `,
    });

    return NextResponse.json({
      ok: true,
      message: "Correo de prueba enviado correctamente a frank.amgz@gmail.com",
    });
  } catch (error: any) {
    console.error("❌ Error en envío SMTP:", error);
    return NextResponse.json(
      { ok: false, message: "Error al enviar el correo", error: error.message },
      { status: 500 }
    );
  }
}
