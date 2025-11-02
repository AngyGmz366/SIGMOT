import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import nodemailer from "nodemailer";
import formidable from "formidable";
import { IncomingMessage } from "http";
import { Readable } from "stream";

// Actualización: configuración correcta para Next.js 13+
export const runtime = "nodejs"; // Define que esta ruta se ejecutará en Node.js

// 🔹 Convierte el objeto Request de Next.js en IncomingMessage (requerido por formidable)
async function requestToIncomingMessage(req: Request): Promise<IncomingMessage> {
  const readable = Readable.fromWeb(req.body as any) as unknown as Readable;
  const incoming = Object.assign(readable, {
    headers: Object.fromEntries(req.headers),
    method: req.method,
    url: req.url,
  }) as IncomingMessage;
  return incoming;
}

// 🔹 Parsear form-data correctamente
async function parseForm(req: Request) {
  const form = formidable({ multiples: true });
  const incoming = await requestToIncomingMessage(req);
  return new Promise<{ fields: any; files: any }>((resolve, reject) => {
    form.parse(incoming, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

// 🔹 Endpoint principal
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const idIncidencia = Number(params.id);
    const { fields, files } = await parseForm(req);

    const mensaje = fields.mensaje?.[0] || "";
    const correoCliente = fields.correoCliente?.[0] || "";
    const idAdmin = fields.idAdmin?.[0] || 1;

    // 💌 Configuración SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
            tls: {
        rejectUnauthorized: false, // ✅ evita error de certificado local
      },
    });

    // 📎 Adjuntos
    let attachments: any[] = [];
    if (files.archivos) {
      const arr = Array.isArray(files.archivos) ? files.archivos : [files.archivos];
      attachments = arr.map((file: any) => ({
        filename: file.originalFilename,
        path: file.filepath,
      }));
    }

    // 💜 Plantilla SIGMOT
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; color: #333; background-color:#f9f9f9; padding:20px;">
        <div style="max-width:600px; margin:auto; background:#fff; border-radius:10px; padding:25px; box-shadow:0 0 10px rgba(0,0,0,0.05);">
          <div style="text-align:center; border-bottom:3px solid #6a1b9a; padding-bottom:10px;">
            <h2 style="color:#6a1b9a;">Soporte Técnico SIGMOT</h2>
          </div>
          <p>Estimado usuario,</p>
          <p>Hemos revisado tu incidencia y te compartimos la siguiente respuesta:</p>
          <blockquote style="border-left: 4px solid #6a1b9a; margin: 15px 0; padding-left: 10px; font-style: italic; color:#444;">
            ${mensaje}
          </blockquote>
          <p>Si el problema persiste, por favor contáctanos nuevamente desde el sistema.</p>
          <div style="text-align:center; margin-top:30px;">
            <a href="http://localhost:3000/cliente/incidencias-soporte" 
              style="background:#6a1b9a; color:white; text-decoration:none; padding:10px 18px; border-radius:6px; font-weight:bold;">
              Ver incidencia en SIGMOT
            </a>
          </div>
          <hr style="margin-top:30px; border:none; border-top:1px solid #ddd;" />
          <p style="text-align:center; font-size:13px; color:#777;">
            © ${new Date().getFullYear()} SIGMOT - Sistema de Gestión de Movilidad y Transporte
          </p>
        </div>
      </div>
    `;

    // 📤 Enviar correos
    const info = await transporter.sendMail({
      from: `"Soporte SIGMOT" <${process.env.SMTP_FROM}>`,
      to: correoCliente,
      subject: "Respuesta a tu incidencia - SIGMOT",
      html: htmlTemplate,
      attachments,
    });

    console.log(`📨 Correo enviado a ${correoCliente} (${info.messageId})`);

    // 🔄 Actualizar estado usando el SP
    await db.query("CALL sp_incidencias_responder(?, ?, ?, ?)", [
      idIncidencia,
      idAdmin,
      mensaje,
      1,
    ]);

    return NextResponse.json({
      ok: true,
      message: "Correo enviado y estado actualizado correctamente.",
    });
  } catch (error: any) {
    console.error("❌ Error en responder incidencia:", error);
    return NextResponse.json(
      { ok: false, message: "Error al responder incidencia.", error: error.message },
      { status: 500 }
    );
  }
}
