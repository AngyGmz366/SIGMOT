// app/api/auth/send-welcome/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { email, nombres } = await req.json();

    if (!email || !nombres) {
      return NextResponse.json(
        { error: 'Email y nombres son requeridos' },
        { status: 400 }
      );
    }

    // Configurar transportador de nodemailer
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465, // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // HTML del correo de bienvenida
    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a TRANSPORTES SAENZ</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header con gradiente -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                ¡Bienvenido a TRANSPORTES SAENZ!
              </h1>
            </td>
          </tr>

          <!-- Contenido principal -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 22px;">
                Hola, ${nombres} 👋
              </h2>
              
              <p style="color: #666666; line-height: 1.6; margin: 0 0 15px 0; font-size: 16px;">
                Nos complace darte la bienvenida a <strong>TRANSPORTES SAENZ</strong>. Tu cuenta ha sido creada exitosamente y ya puedes disfrutar de todos nuestros servicios.
              </p>

              <p style="color: #666666; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
                Estamos aquí para brindarte la mejor experiencia en transporte y logística. Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.
              </p>

              <!-- Botón CTA -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tuapp.com'}/auth/login" 
                   style="background-color: #6366f1; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
                  Iniciar Sesión
                </a>
              </div>

              <!-- Características/Beneficios -->
              <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 25px 0;">
                <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">
                  ¿Qué puedes hacer ahora?
                </h3>
                <ul style="color: #666666; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Realizar reservas de transporte</li>
                  <li>Gestionar tus documentos y facturas</li>
                  <li>Acceder a tu historial de servicios</li>
                </ul>
              </div>

              <p style="color: #666666; line-height: 1.6; margin: 25px 0 0 0; font-size: 14px;">
                Gracias por confiar en nosotros,<br>
                <strong style="color: #6366f1;">El equipo de TRANSPORTES SAENZ</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #999999; margin: 0 0 10px 0; font-size: 14px;">
                © 2025 TRANSPORTES SAENZ. Todos los derechos reservados.
              </p>
              <p style="color: #999999; margin: 0; font-size: 12px;">
                Si no solicitaste esta cuenta, por favor ignora este mensaje.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Enviar correo
    await transporter.sendMail({
      from: `"TRANSPORTES SAENZ" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🎉 ¡Bienvenido a TRANSPORTES SAENZ!',
      html: htmlContent,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Correo de bienvenida enviado exitosamente' 
    });

  } catch (error: any) {
    console.error('Error enviando correo de bienvenida:', error);
    return NextResponse.json(
      { error: 'No se pudo enviar el correo de bienvenida', details: error.message },
      { status: 500 }
    );
  }
}