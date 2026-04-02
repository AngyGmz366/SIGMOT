import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticator } from "otplib";
import QRCode from "qrcode";

export async function POST(req: Request) {
  const conn = await db.getConnection();
  
  try {
    const body = await req.json();

    // Aceptar tanto 'id' como 'idUsuario' para compatibilidad
    const idUsuario = body.idUsuario || body.id;

    if (!idUsuario) {
      return NextResponse.json(
        { ok: false, error: "Falta el ID de usuario." },
        { status: 400 }
      );
    }


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
      
      // Debug: Mostrar cuántos usuarios hay en la tabla
      const [countRows]: any = await conn.query(
        "SELECT COUNT(*) as total FROM mydb.TBL_MS_USUARIO;"
      );
      
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
    const otpauth = authenticator.keyuri(correo, "SAENZ", secret);
    const qrDataUrl = await QRCode.toDataURL(otpauth);



    // 🔹 PASO 3: Guardar secreto en BD usando el identificador correcto
    try {

      await conn.query("CALL sp_2fa_guardar_secreto(?, ?, ?);", [
        identificador,
        tipoUsuario,
        secret,
      ]);
      

    } catch (dbError: any) {
      console.error("❌ Error al ejecutar sp_2fa_guardar_secreto:", dbError);
      console.error("   SQL:", dbError.sql);
      console.error("   Message:", dbError.sqlMessage);
      
      // Verificar si el error es por usuario no encontrado
      if (dbError.sqlMessage?.includes('Usuario no encontrado')) {
        // Hacer una verificación adicional
        const column = tipoUsuario === 'FIREBASE' ? 'Firebase_UID' : 'Correo_Electronico';
        const [verifyRows]: any = await conn.query(
          `SELECT Id_Usuario_PK, ${column} FROM mydb.TBL_MS_USUARIO 
           WHERE ${column} = ? 
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
        } else {
          return NextResponse.json(
            { 
              ok: false, 
              error: `Usuario encontrado (ID: ${verifyRows[0].Id_Usuario_PK}) pero el SP falla. Verifica el procedimiento almacenado.`
            },
            { status: 500 }
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
    console.error("❌ Error general en /api/auth/2fa/setup:", err);
    return NextResponse.json(
      { 
        ok: false, 
        error: err.sqlMessage || err.message || "Error al generar el secreto 2FA",
        details: process.env.NODE_ENV === 'development' ? {
          sql: err.sql,
          message: err.sqlMessage,
          stack: err.stack
        } : undefined
      },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}