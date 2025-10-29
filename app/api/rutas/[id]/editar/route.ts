// /app/api/rutas/[id]/editar/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const conn = await db.getConnection();

  try {
    const id = Number(params.id);
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const {
      distancia,
      tiempoEstimado,
      origen,
      destino,
      descripcion,
      estado,
      precio,
      horarios,
      unidades, // ✅ AGREGAR unidades al payload
    } = await req.json();

    console.log("🔄 Actualizando ruta:", { id, origen, destino, unidades, horarios });

    // 1️⃣ Obtener coordenadas automáticamente desde TBL_LOCALIDADES
    const [origenCoords]: any = await conn.query(
      `SELECT Latitud, Longitud FROM TBL_LOCALIDADES WHERE UPPER(Nombre_Localidad) = UPPER(?) LIMIT 1`,
      [origen]
    );

    const [destinoCoords]: any = await conn.query(
      `SELECT Latitud, Longitud FROM TBL_LOCALIDADES WHERE UPPER(Nombre_Localidad) = UPPER(?) LIMIT 1`,
      [destino]
    );

    if (!origenCoords.length || !destinoCoords.length) {
      return NextResponse.json(
        { ok: false, message: "No se encontraron coordenadas de origen o destino." },
        { status: 400 }
      );
    }

    const coordenadas = JSON.stringify([
      {
        lat: origenCoords[0].Latitud,
        lng: origenCoords[0].Longitud,
      },
      {
        lat: destinoCoords[0].Latitud,
        lng: destinoCoords[0].Longitud,
      },
    ]);

    // 2️⃣ Actualizar la ruta en base
    await conn.query(
      `UPDATE TBL_RUTAS SET 
        Distancia = ?, 
        Tiempo_Estimado = ?, 
        Origen = ?, 
        Destino = ?, 
        Descripcion = ?, 
        Estado = ?, 
        Precio = ?, 
        Horarios = ?, 
        Coordenadas = ?
      WHERE Id_Ruta_PK = ?`,
      [
        distancia || 0,
        tiempoEstimado || "00:00:00",
        origen,
        destino,
        descripcion || null,
        estado || "ACTIVA",
        precio || 0,
        JSON.stringify(horarios || []),
        coordenadas,
        id,
      ]
    );

    // 3️⃣ Eliminar viajes existentes
    await conn.query(`DELETE FROM TBL_VIAJES WHERE Id_Rutas_FK = ?`, [id]);

    // 4️⃣ ✅ RE-ASOCIAR UNIDADES Y HORARIOS CON EL SP (CORREGIDO)
    if (unidades?.length && horarios?.length) {
      console.log("🔗 Re-asociando unidades con horarios:", { unidades, horarios });
      try {
        await conn.query(
          `CALL sp_asociar_unidades_activas_a_rutas_con_horarios(?, ?, ?)`,
          [id, JSON.stringify(horarios), JSON.stringify(unidades)]
        );
        console.log("✅ Unidades re-asociadas correctamente vía SP");
      } catch (spError: any) {
        console.error("⚠️ Error en SP durante edición:", spError.message);
        throw spError; // Propagar el error
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Ruta actualizada correctamente con unidades asociadas.",
    });
  } catch (err: any) {
    console.error("❌ Error al actualizar ruta:", err);
    return NextResponse.json(
      { ok: false, error: err.sqlMessage || err.message || "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}