// app/api/auth/send-code/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Falta el correo.' }, { status: 400 });

  const conn = await db.getConnection();
  try {
    const codigo = crypto.randomInt(100000, 999999).toString();
    await conn.query('CALL mydb.sp_enviar_codigo_verificacion(?, ?, ?)', [email, codigo, 10]);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"SAENZ Soporte" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Código de verificación',
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 30px;">
            <div style="max-width: 500px; margin: auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.08); overflow: hidden;">
            
            <div style="background-color: #4f46e5; color: #fff; padding: 20px 30px; text-align: center;">
                <h2 style="margin: 0; font-size: 22px;">Verificación de correo</h2>
                <p style="margin: 5px 0 0; font-size: 14px;">TRANSPORTES SAENZ</p>
            </div>

            <div style="padding: 30px; text-align: center; color: #333;">
                <p style="font-size: 16px;">Hola,</p>
                <p style="font-size: 15px; color: #555;">
                Tu código de verificación es:
                </p>

                <div style="font-size: 32px; font-weight: bold; letter-spacing: 3px; color: #4f46e5; margin: 20px 0;">
                ${codigo}
                </div>

                <p style="font-size: 14px; color: #777;">
                Este código expirará en <b>10 minutos</b> por motivos de seguridad.
                </p>

                <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />

                <p style="font-size: 13px; color: #999;">
                Si tú no solicitaste este código, ignora este mensaje.
                </p>
            </div>

            <div style="background-color: #f3f4f6; text-align: center; padding: 15px; font-size: 12px; color: #999;">
                © ${new Date().getFullYear()} SIGMOT. Todos los derechos reservados.
            </div>

            </div>
        </div>
        `

    });

    return NextResponse.json({ message: 'Código enviado correctamente.' });
  } finally {
    conn.release();
  }
}
