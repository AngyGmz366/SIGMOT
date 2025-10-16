import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomInt } from 'crypto';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { idUsuario, correo } = await req.json();
  if (!idUsuario || !correo) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  const codigo = randomInt(100000, 999999).toString();
  const expira = new Date(Date.now() + 10 * 60 * 1000); // Expira en 10 min

  const conn = await db.getConnection();
  try {
    await conn.query(
      'INSERT INTO TBL_MS_2FA_EMAIL (Id_Usuario_FK, Codigo, Expira) VALUES (?, ?, ?)',
      [idUsuario, codigo, expira]
    );

    // Configuración de nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    await transporter.sendMail({
      from: `"SIGMOT" <${process.env.SMTP_USER}>`,
      to: correo,
      subject: 'Código de verificación SIGMOT',
      text: `Tu código de acceso es: ${codigo}`
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Error enviando código 2FA por correo:', e);
    return NextResponse.json({ error: 'No se pudo enviar el código' }, { status: 500 });
  } finally {
    conn.release();
  }
}
