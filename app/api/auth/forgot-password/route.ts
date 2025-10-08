export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// === CONFIGURAR TRANSPORTE SMTP (usa tus variables .env) ===
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: Request) {
  const conn = await db.getConnection();
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Debe enviar el correo electrónico.' }, { status: 400 });
    }

    // 1️⃣ Buscar usuario en BD
    const [rows]: any = await conn.query(
      'SELECT Id_Usuario_PK, Correo_Electronico FROM mydb.TBL_MS_USUARIO WHERE Correo_Electronico = ? LIMIT 1',
      [email]
    );
    const usuario = rows?.[0];
    if (!usuario) {
      // 🔒 No revelar si el usuario existe
      return NextResponse.json({
        message: 'Si el correo está registrado, se enviará un enlace para restablecer la contraseña.',
      });
    }

    const idUsuario = usuario.Id_Usuario_PK;

    // 2️⃣ Generar token aleatorio (64 caracteres)
    const token = crypto.randomBytes(32).toString('hex');
    const expiraEn = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // 3️⃣ Guardar token en la tabla
    await conn.query(
      `INSERT INTO mydb.TBL_MS_RESET_TOKEN (Id_Usuario_FK, Token, Expira_En, Usado)
       VALUES (?, UNHEX(?), ?, 0)`,
      [idUsuario, token, expiraEn]
    );

    // 4️⃣ Enlace de recuperación
    const link = `${process.env.APP_URL}/auth/reset-success?token=${token}`;

    // 5️⃣ Cargar logo local y convertir a Base64
    const logoPath = path.resolve('./public/demo/images/login/LOGO-SIGMOT.png');
    let logoBase64 = '';
    try {
      const logoBuffer = fs.readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    } catch (err) {
      console.warn('⚠️ No se encontró el logo en public/demo/images/login/LOGO-SIGMOT.png');
    }

    // 6️⃣ HTML del correo (con logo embebido)
    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 30px;">
        <div style="max-width: 550px; margin: auto; background: white; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); overflow: hidden;">
          
          <div style="background-color: #004aad; padding: 20px; text-align: center;">
            ${
              logoBase64
                ? `<img src="${logoBase64}" alt="SAENZ Logo" width="100" style="margin-bottom: 10px;" />`
                : `<h2 style="color:white;margin:0;">SAENZ</h2>`
            }
            <h1 style="color: white; margin: 0;">TRANSPORTES SAENZ</h1>
          </div>

          <div style="padding: 30px; text-align: center;">
            <h2 style="color: #333;">Solicitud de recuperación de contraseña</h2>
            <p style="color: #555; font-size: 15px;">
              Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
            </p>

            <a href="${link}" 
              style="display: inline-block; background-color: #004aad; color: white; text-decoration: none; padding: 12px 25px; border-radius: 8px; font-weight: bold; margin-top: 20px;">
              Restablecer contraseña
            </a>

            <p style="margin-top: 20px; color: #777; font-size: 13px;">
              Este enlace expirará en 1 hora. Si no solicitaste este cambio, ignora este mensaje.
            </p>
          </div>

          <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            © ${new Date().getFullYear()} SAENZ Transporte. Todos los derechos reservados.
          </div>
        </div>
      </div>
    `;

    // 7️⃣ Enviar correo
    await transporter.sendMail({
      from: `"SAENZ Soporte" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Recuperación de contraseña - SAENZ',
      html,
    });

    return NextResponse.json({
      message: 'Correo de recuperación enviado (si el correo está registrado).',
    });
  } catch (error: any) {
    console.error('❌ Error en forgot-password:', error);
    return NextResponse.json({ error: 'Error al procesar la solicitud.' }, { status: 500 });
  } finally {
    conn.release();
  }
}
