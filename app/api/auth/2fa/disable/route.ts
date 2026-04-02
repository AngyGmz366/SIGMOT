import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const conn = await db.getConnection();
  
  try {
    const { identificador, tipoUsuario } = await req.json();


    if (!identificador || !tipoUsuario) {
      return NextResponse.json(
        { ok: false, error: "Faltan parámetros requeridos." },
        { status: 400 }
      );
    }

    // 🔹 Si el identificador es un número, obtener los datos reales del usuario
    let identificadorReal = identificador;
    let tipoReal = tipoUsuario;

    if (/^\d+$/.test(String(identificador))) {
      
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
        [Number(identificador)]
      );

      if (!rows || rows.length === 0) {
        console.error("❌ Usuario no encontrado con ID:", identificador);
        return NextResponse.json(
          { ok: false, error: "Usuario no encontrado." },
          { status: 404 }
        );
      }

      const usuario = rows[0];
      tipoReal = String(usuario.TipoUsuario).trim();
      
      // Determinar el identificador correcto según el tipo
      identificadorReal = tipoReal === 'FIREBASE' 
        ? String(usuario.Firebase_UID).trim()
        : String(usuario.Correo_Electronico).trim();

      
    } else {
    }

    // Validar que el identificador no esté vacío
    if (!identificadorReal) {
      return NextResponse.json(
        { ok: false, error: "No se pudo determinar el identificador del usuario." },
        { status: 400 }
      );
    }

   

    await conn.query("CALL mydb.sp_2fa_desactivar(?, ?);", [
      identificadorReal, 
      tipoReal
    ]);


    return NextResponse.json({
      ok: true,
      message: "2FA desactivado correctamente.",
    });
  } catch (err: any) {
    console.error("❌ Error en /api/auth/2fa/disable:", err);
    console.error("   SQL:", err.sql);
    console.error("   Message:", err.sqlMessage);
    
    return NextResponse.json(
      { 
        ok: false, 
        error: err.sqlMessage || err.message || "Error al desactivar 2FA.",
        details: process.env.NODE_ENV === 'development' ? err.sql : undefined
      },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}