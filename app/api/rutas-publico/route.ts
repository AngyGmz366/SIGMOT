export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * 🔹 Endpoint público: obtiene todas las rutas activas con horarios y coordenadas
 */
export async function GET() {
  const conn = await db.getConnection();

  try {
    const [rows]: any = await conn.query(`
      SELECT
        Id_Ruta_PK,
        Origen,
        Destino,
        Tiempo_Estimado,
        CAST(Distancia AS DECIMAL(10,2)) AS Distancia,
        CAST(Precio AS DECIMAL(12,2)) AS Precio,
        Horarios,
        Coordenadas
      FROM mydb.TBL_RUTAS
      WHERE Estado = 'ACTIVA'
        AND Precio IS NOT NULL
        AND Horarios IS NOT NULL
      ORDER BY Id_Ruta_PK DESC;
    `);

    const items = (rows ?? []).map((r: any) => {
      // 🕒 Parsear horarios
      let horarios: string[] = [];
      try {
        if (typeof r.Horarios === "string") {
          horarios = JSON.parse(r.Horarios);
        } else if (Array.isArray(r.Horarios)) {
          horarios = r.Horarios;
        }
      } catch {
        horarios = [];
      }

      // 📍 Parsear coordenadas
      let coordenadas: { lat: number; lng: number }[] = [];
      try {
        let parsed = r.Coordenadas;

        if (typeof parsed === "string") {
          // Intentar una sola conversión limpia
          parsed = JSON.parse(parsed);
        }

        if (Array.isArray(parsed)) {
          if (Array.isArray(parsed[0])) {
            // [[lat,lng],[lat,lng]]
            coordenadas = parsed.map((p: any) => ({
              lat: Number(p[0]),
              lng: Number(p[1]),
            }));
          } else if (parsed[0] && typeof parsed[0] === "object") {
            // [{lat,lng},...]
            coordenadas = parsed.map((p: any) => ({
              lat: Number(p.lat),
              lng: Number(p.lng),
            }));
          }
        }
      } catch (err) {
        console.error(`⚠️ Error parseando coordenadas de ${r.Origen} → ${r.Destino}:`, err);
        coordenadas = [];
      }

      // 🧭 Registro log (opcional)
      console.log(`🗺️ Ruta: ${r.Origen} → ${r.Destino} (${coordenadas.length} puntos)`);

      // 🧩 Estructura final
      return {
        id: r.Id_Ruta_PK,
        origen: r.Origen,
        destino: r.Destino,
        tiempoEstimado: r.Tiempo_Estimado,
        distancia: r.Distancia ? Number(r.Distancia) : null,
        precio: r.Precio ? Number(r.Precio) : null,
        horarios,
        coordenadas,
      };
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (e: any) {
    console.error("🔥 Error en /api/rutas-publico:", e);
    return NextResponse.json(
      { error: e.message || "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
