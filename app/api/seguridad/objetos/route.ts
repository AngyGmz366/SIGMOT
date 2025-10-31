import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/* ===============================
   GET - Listar Objetos
=============================== */
export async function GET() {
  try {
    // Ejecutamos el procedimiento almacenado sp_obtener_objetos
    const [rows]: any = await db.query("CALL mydb.sp_obtener_objetos();");

    // Mapeamos los datos a la estructura que necesitas
    const items = rows[0].map((r: any) => ({
      id: r.Id_Objetos_PK,            // Identificador del objeto
      nombre: r.Objeto,               // Nombre del objeto
      descripcion: r.Descripcion,     // Descripción del objeto
      tipo: r.Tipo_Objeto,            // Tipo del objeto
      creadoPor: r.Creado_Por,        // Usuario que creó el objeto
      fechaCreacion: r.Fecha_Creacion, // Fecha de creación
      modificadoPor: r.Modificado_Por, // Usuario que modificó el objeto
      fechaModificacion: r.Fecha_Modificacion, // Fecha de modificación
      moduloPadre: r.Modulo_Padre    // Módulo padre del objeto
    }));

    // Devolvemos los datos mapeados
    return NextResponse.json({ ok: true, items });
  } catch (error: any) {
    console.error("❌ Error en GET /api/seguridad/objetos:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
