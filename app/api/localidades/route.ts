// /app/api/localidades/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  let conn;
  try {
    conn = await db.getConnection();
    
    const [rows]: any = await conn.query(`
      SELECT 
        Id_Localidad_PK AS id,
        Nombre_Localidad AS nombre,
        Departamento,
        Latitud AS lat,
        Longitud AS lng
      FROM mydb.TBL_LOCALIDADES
      ORDER BY Departamento, Nombre_Localidad;
    `);

    return NextResponse.json({
      ok: true,
      total: rows.length,
      items: rows,
    });
  } catch (error: any) {
    console.error("❌ Error al listar localidades:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release(); // ✅ LIBERAR CONEXIÓN SIEMPRE
  }
}

export async function POST(req: Request) {
  let conn;
  try {
    const { nombre, departamento, latitud, longitud } = await req.json();
    
    if (!nombre || !departamento || !latitud || !longitud) {
      return NextResponse.json(
        { ok: false, message: "Todos los campos son requeridos." },
        { status: 400 }
      );
    }

    conn = await db.getConnection();
    
    await conn.query(
      `INSERT INTO mydb.TBL_LOCALIDADES (Nombre_Localidad, Departamento, Latitud, Longitud)
       VALUES (?, ?, ?, ?)`,
      [nombre, departamento, latitud, longitud]
    );

    return NextResponse.json({
      ok: true,
      message: "Localidad agregada correctamente.",
    });
  } catch (error: any) {
    console.error("❌ Error al insertar localidad:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release(); // ✅ LIBERAR CONEXIÓN SIEMPRE
  }
}