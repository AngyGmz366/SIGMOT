import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/* ===============================
   GET - Listar parámetros
=============================== */
export async function GET() {
  try {
    const [rows]: any = await db.query("CALL mydb.sp_parametros_listar();");
    const items = rows[0].map((r: any) => ({
      id: r.Id_Parametro_PK,
      parametro: r.Parametro,
      valor: r.Valor,
      fechaCreacion: r.Fecha_Creacion,
      fechaModificacion: r.Fecha_Modificacion,
      idUsuario: r.Id_Usuario_FK,
      idRol: r.Id_Rol_FK,
      idObjeto: r.Id_Objeto_FK,
    }));
    return NextResponse.json({ ok: true, items });
  } catch (error: any) {
    console.error("❌ Error en GET /api/seguridad/parametros:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

/* ===============================
   PUT - Actualizar parámetro
=============================== */
export async function PUT(req: Request) {
  try {
    const { idParametro, valor, idUsuario } = await req.json();

    if (!idParametro || valor === undefined) {
      return NextResponse.json(
        { ok: false, error: "Faltan parámetros obligatorios." },
        { status: 400 }
      );
    }

    await db.query("CALL mydb.sp_parametros_actualizar(?, ?, ?);", [
      idParametro,
      valor,
      idUsuario || 1, // ID del admin que actualiza
    ]);

    return NextResponse.json({
      ok: true,
      message: "Parámetro actualizado correctamente.",
    });
  } catch (error: any) {
    console.error("❌ Error en PUT /api/seguridad/parametros:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
