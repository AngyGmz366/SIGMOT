import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * 🔹 Devuelve el precio, horarios y nombre de la ruta por ID
 * Ejemplo: GET /api/boletos/rutas-precio/3
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const idRuta = Number(params.id);
  if (!idRuta)
    return NextResponse.json(
      { error: "ID de ruta inválido" },
      { status: 400 }
    );

  try {
    const [rows]: any = await db.query(
      `SELECT 
         Id_Ruta_PK AS id,
         CONCAT(Origen, ' → ', Destino) AS nombre,
         Precio,
         Horarios
       FROM mydb.TBL_RUTAS
       WHERE Id_Ruta_PK = ?;`,
      [idRuta]
    );

    const r = rows?.[0];
    if (!r)
      return NextResponse.json(
        { error: "Ruta no encontrada" },
        { status: 404 }
      );

    return NextResponse.json({
      id: r.id,
      nombre: r.nombre,
      precio: Number(r.Precio ?? 0),
      horarios:
        typeof r.Horarios === "string"
          ? (() => {
              try {
                return JSON.parse(r.Horarios);
              } catch {
                return [];
              }
            })()
          : [],
    });
  } catch (error: any) {
    console.error("❌ Error al obtener precio de ruta:", error);
    return NextResponse.json(
      { error: error.message || "Error interno" },
      { status: 500 }
    );
  }
}
