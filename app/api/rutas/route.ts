import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/* =======================================
   🔹 GET: listar todas las rutas
   ======================================= */
export async function GET() {
  const conn = await db.getConnection();
  try {
    const [rows]: any = await conn.query(`
      SELECT 
        Id_Ruta_PK,
        Origen,
        Destino,
        Tiempo_Estimado,
        Distancia,
        Descripcion,
        Estado,
        Precio,
        Horarios,
        Coordenadas
      FROM mydb.TBL_RUTAS
      ORDER BY Id_Ruta_PK DESC;
    `);

    const items = (rows ?? []).map((r: any) => ({
      id: r.Id_Ruta_PK,
      origen: r.Origen,
      destino: r.Destino,
      tiempoEstimado: r.Tiempo_Estimado,
      distancia: r.Distancia,
      descripcion: r.Descripcion,
      estado: r.Estado,
      precio: Number(r.Precio ?? 0),
      horarios:
        typeof r.Horarios === "string"
          ? (() => { try { return JSON.parse(r.Horarios); } catch { return []; } })()
          : r.Horarios ?? [],
      coordenadas:
        typeof r.Coordenadas === "string"
          ? (() => { try { return JSON.parse(r.Coordenadas); } catch { return []; } })()
          : r.Coordenadas ?? [],
    }));

    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  } finally {
    conn.release();
  }
}

/* =======================================
   🔹 POST: crear ruta (usa SP actualizado)
   ======================================= */
export async function POST(req: Request) {
  const conn = await db.getConnection();

  try {
    const {
      distancia,
      tiempoEstimado,
      origen,
      destino,
      descripcion,
      estado,
      precio,
      horarios,
      coordenadas,
    } = await req.json();

    // 🔹 Ejecutar SP (sin SELECT extra)
    await conn.query(
      `CALL sp_rutas_crear_max5(?, ?, ?, ?, ?, ?, ?, ?, ?, @id_nuevo);`,
      [
        distancia || 0,
        tiempoEstimado || "00:00:00",
        origen,
        destino,
        descripcion || null,
        estado || "ACTIVA",
        precio || 0,
        JSON.stringify(horarios || []),
        JSON.stringify(coordenadas || []),
      ]
    );

    return NextResponse.json({
      ok: true,
      message: "Ruta creada correctamente",
    });
  } catch (err: any) {
    console.error("❌ Error al crear ruta:", err);
    return NextResponse.json(
      { ok: false, error: err.sqlMessage || err.message },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}

/* =======================================
   🔹 PATCH: actualizar ruta (usa SP actualizado)
   ======================================= */
export async function PATCH(req: Request) {
  const conn = await db.getConnection();
  try {
    // Obtener el cuerpo de la solicitud (estado, unidades, etc.)
    const {
      id,
      distancia,
      tiempoEstimado,
      origen,
      destino,
      descripcion,
      estado,
      precio,
      horarios,
      coordenadas,
      unidades,
    } = await req.json();

    // Validar que se haya proporcionado un ID válido
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // 🔹 Ejecutar SP para actualizar la ruta
    await conn.query(
  `CALL sp_rutas_actualizar(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    id,                          // p_id
    distancia,                   // p_distancia
    tiempoEstimado,              // p_tiempo_estimado
    origen,                      // p_origen
    destino,                     // p_destino
    descripcion,                 // p_descripcion
    estado,                      // p_estado
    precio,                      // p_precio
    JSON.stringify(horarios),    // p_horarios
    JSON.stringify(coordenadas), // p_coordenadas
    JSON.stringify(unidades)     // p_unidades
  ]
);


    return NextResponse.json({
      ok: true,
      message: "Ruta actualizada correctamente",
    });
  } catch (err: any) {
    console.error("❌ Error al actualizar ruta:", err);
    return NextResponse.json(
      { ok: false, error: err.sqlMessage || err.message },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
