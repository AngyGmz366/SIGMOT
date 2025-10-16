import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/* =======================================
   🔹 GET: listar todas las rutas con unidades asociadas
   ======================================= */
export async function GET() {
  const conn = await db.getConnection();
  try {
    const [rows]: any = await conn.query(`
      SELECT 
        r.Id_Ruta_PK as id,
        r.Origen as origen,
        r.Destino as destino,
        r.Tiempo_Estimado as tiempoEstimado,
        r.Distancia as distancia,
        r.Descripcion as descripcion,
        r.Estado as estado,
        r.Precio as precio,
        r.Horarios as horarios,
        r.Coordenadas as coordenadas,
        GROUP_CONCAT(DISTINCT v.Id_Unidad_FK) AS unidades
      FROM mydb.TBL_RUTAS r
      LEFT JOIN mydb.TBL_VIAJES v ON r.Id_Ruta_PK = v.Id_Rutas_FK
      GROUP BY r.Id_Ruta_PK
      ORDER BY r.Id_Ruta_PK DESC;
    `);

    const items = (rows ?? []).map((r: any) => ({
      id: r.id,
      origen: r.origen,
      destino: r.destino,
      tiempoEstimado: r.tiempoEstimado,
      distancia: r.distancia,
      descripcion: r.descripcion,
      estado: r.estado,
      precio: Number(r.precio ?? 0),
      horarios: typeof r.horarios === "string" 
        ? (() => { try { return JSON.parse(r.horarios); } catch { return []; } })()
        : r.horarios ?? [],
      coordenadas: typeof r.coordenadas === "string"
        ? (() => { try { return JSON.parse(r.coordenadas); } catch { return []; } })()
        : r.coordenadas ?? [],
      unidades: r.unidades ? r.unidades.split(',').filter((id: string) => id).map((id: string) => Number(id)) : [],
    }));

    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    console.error("❌ Error al obtener rutas:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  } finally {
    conn.release();
  }
}

/* =======================================
   🔹 POST: crear ruta
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
      unidades,
    } = await req.json();

    console.log("🆕 Creando ruta con unidades:", { 
      origen, 
      destino, 
      unidades, 
      horarios, 
      tiempoEstimado 
    });

    // ✅ FORZAR ESTADO ACTIVA para que funcione el SP de asociación
    const estadoFinal = "ACTIVA";

    // 1. Primero crear la ruta
    await conn.query(
      `CALL sp_rutas_crear_max5(?, ?, ?, ?, ?, ?, ?, ?, ?, @id_nuevo);`,
      [
        distancia || 0,
        tiempoEstimado || "00:00:00",
        origen,
        destino,
        descripcion || null,
        estadoFinal,
        precio || 0,
        JSON.stringify(horarios || []),
        typeof coordenadas === 'string' ? coordenadas : JSON.stringify(coordenadas || []),
      ]
    );

    // 2. Obtener el ID de la ruta creada
    const [result]: any = await conn.query('SELECT @id_nuevo as id_nuevo;');
    const idRuta = result[0]?.id_nuevo;

    console.log("🆕 Ruta creada con ID:", idRuta);

    if (!idRuta) {
      throw new Error("No se pudo obtener el ID de la ruta creada");
    }

    // 3. Si se creó la ruta y hay unidades, asociarlas con horarios
    if (idRuta && unidades && Array.isArray(unidades) && unidades.length > 0 && 
        horarios && Array.isArray(horarios) && horarios.length > 0) {
      
      console.log("🔗 Asociando unidades con horarios:", { 
        idRuta, 
        unidades, 
        horarios, 
        tiempoEstimado 
      });
      
      try {
        // Usar el procedimiento almacenado corregido
        await conn.query(
          `CALL sp_asociar_unidades_activas_a_rutas_con_horarios(?, ?, ?)`,
          [idRuta, JSON.stringify(horarios), JSON.stringify(unidades)]
        );
        console.log("✅ Unidades asociadas correctamente via SP");
        
      } catch (spError: any) {
        console.error("⚠️ Error en SP, creando viajes manualmente:", spError.message);
        
        // Fallback: Crear viajes manualmente
        await crearViajesManualmente(conn, idRuta, unidades, horarios, tiempoEstimado);
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Ruta creada correctamente",
      id: idRuta
    });

  } catch (err: any) {
    console.error("❌ Error al crear ruta:", err);
    return NextResponse.json(
      { 
        ok: false, 
        error: err.sqlMessage || err.message || "Error interno del servidor" 
      },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}

// Función auxiliar para crear viajes manualmente
async function crearViajesManualmente(
  conn: any, 
  idRuta: number, 
  unidades: number[], 
  horarios: string[], 
  tiempoEstimado: string
) {
  for (let i = 0; i < Math.min(unidades.length, horarios.length); i++) {
    const unidadId = unidades[i];
    const horario = horarios[i];
    
    if (unidadId && horario) {
      // Parsear tiempo estimado (formato HH:MM:SS)
      const [h, m, s] = (tiempoEstimado || "04:00:00").split(':').map(Number);
      
      // Crear hora de salida
      const [horasSalida, minutosSalida] = horario.split(':').map(Number);
      const horaSalida = new Date();
      horaSalida.setHours(horasSalida, minutosSalida, 0, 0);
      
      // Calcular hora de llegada sumando el tiempo estimado
      const horaLlegada = new Date(horaSalida);
      horaLlegada.setHours(
        horaSalida.getHours() + h,
        horaSalida.getMinutes() + m,
        horaSalida.getSeconds() + s
      );
      
      // Verificar que la unidad existe y está activa
      const [unidadCheck]: any = await conn.query(
        `SELECT COUNT(*) as count 
         FROM TBL_UNIDADES u 
         JOIN TBL_ESTADO_UNIDAD e ON u.Id_EstadoUnidad_FK = e.Id_EstadoUnidad_PK 
         WHERE u.Id_Unidad_PK = ? AND e.Estado_Unidad = 'ACTIVO'`,
        [unidadId]
      );
      
      if (unidadCheck[0]?.count > 0) {
        await conn.query(
          `INSERT INTO TBL_VIAJES (Fecha, Hora_Salida, Hora_Estimada_Llegada, Id_Unidad_FK, Id_Rutas_FK)
           VALUES (CURDATE(), ?, ?, ?, ?)`,
          [horaSalida, horaLlegada, unidadId, idRuta]
        );
        console.log(`✅ Viaje creado para unidad ${unidadId} a las ${horario}`);
      } else {
        console.warn(`⚠️ Unidad ${unidadId} no está activa, omitiendo...`);
      }
    }
  }
}