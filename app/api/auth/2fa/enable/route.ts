import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticator } from "otplib";
import QRCode from "qrcode";

export async function POST(req: Request) {
  const conn = await db.getConnection();
  
  try {
    const { idUsuario } = await req.json();

    if (!idUsuario) {
      return NextResponse.json(
        { ok: false, error: "Falta el ID de usuario." },
        { status: 400 }
      );
    }

    console.log("🔍 Buscando usuario con ID:", idUsuario);

    // 🔹 PASO 1: Obtener datos del usuario desde la BD
    const [rows]: any = await conn.query(
      `SELECT 
        Id_Usuario_PK,
        Correo_Electronico,
        Firebase_UID,
        CASE 
          WHEN Firebase_UID IS NOT NULL AND Firebase_UID <> '' THEN 'FIREBASE'
          ELSE 'LOCAL'
        END AS TipoUsuario
       FROM mydb.TBL_MS_USUARIO 
       WHERE Id_Usuario_PK = ? 
       LIMIT 1;`,
      [Number(idUsuario)]
    );

    if (!rows || rows.length === 0) {
      console.error("❌ Usuario no encontrado con ID:", idUsuario);
      return NextResponse.json(
        { ok: false, error: "Usuario no encontrado en la base de datos." },
        { status: 404 }
      );
    }

    const usuario = rows[0];
    const correo = String(usuario.Correo_Electronico || '').trim();
    const firebaseUID = String(usuario.Firebase_UID || '').trim();
    const tipoUsuario = String(usuario.TipoUsuario).trim();
    
    // 🔹 Determinar el identificador según el tipo de usuario
    const identificador = tipoUsuario === "FIREBASE" ? firebaseUID : correo;

    console.log("✅ Usuario encontrado:");
    console.log("   - ID:", usuario.Id_Usuario_PK);
    console.log("   - Correo:", correo);
    console.log("   - Firebase UID:", firebaseUID || '(vacío)');
    console.log("   - Tipo:", tipoUsuario);
    console.log("   - Identificador a usar:", identificador);

    // Validar que el identificador no esté vacío
    if (!identificador) {
      return NextResponse.json(
        { 
          ok: false, 
          error: tipoUsuario === 'FIREBASE' 
            ? "El usuario no tiene Firebase_UID configurado." 
            : "El usuario no tiene correo electrónico configurado."
        },
        { status: 400 }
      );
    }

    // 🔹 PASO 2: Generar secreto y QR
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(correo, "SIGMOT", secret);
    const qrDataUrl = await QRCode.toDataURL(otpauth);

    console.log("🔐 Secreto generado:", secret.substring(0, 8) + "...");

    // 🔹 PASO 3: Guardar secreto en BD usando el identificador correcto
    try {
      await conn.query("CALL sp_2fa_guardar_secreto(?, ?, ?);", [
        identificador,
        tipoUsuario,
        secret,
      ]);
      
      console.log("✅ Secreto guardado correctamente en la BD");
    } catch (dbError: any) {
      console.error("❌ Error al ejecutar sp_2fa_guardar_secreto:", dbError);
      
      // Verificar si el error es por usuario no encontrado
      if (dbError.sqlMessage?.includes('Usuario no encontrado')) {
        // Hacer una verificación adicional
        const [verifyRows]: any = await conn.query(
          `SELECT Id_Usuario_PK FROM mydb.TBL_MS_USUARIO 
           WHERE ${tipoUsuario === 'FIREBASE' ? 'Firebase_UID' : 'Correo_Electronico'} = ? 
           LIMIT 1;`,
          [identificador]
        );
        
        if (!verifyRows || verifyRows.length === 0) {
          return NextResponse.json(
            { 
              ok: false, 
              error: `El ${tipoUsuario === 'FIREBASE' ? 'Firebase_UID' : 'correo'} "${identificador}" no existe en la base de datos. Verifica que el usuario esté correctamente registrado.`
            },
            { status: 404 }
          );
        }
      }
      
      throw dbError;
    }

    // 🔹 PASO 4: Retornar QR y secreto
    return NextResponse.json({
      ok: true,
      qr: qrDataUrl,
      secret: secret,
      message: "Secreto 2FA generado correctamente.",
    });
  } catch (err: any) {
    console.error("❌ Error en /api/2fa/enable:", err);
    return NextResponse.json(
      { 
        ok: false, 
        error: err.sqlMessage || err.message || "Error al generar el secreto 2FA",
        details: process.env.NODE_ENV === 'development' ? err.sql : undefined
      },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}