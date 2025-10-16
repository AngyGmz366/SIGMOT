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
      coordenadas,
      unidades,
    } = await req.json();

    console.log("🔄 Actualizando ruta:", { 
      id, 
      unidades, 
      horarios, 
      tiempoEstimado 
    });

    // 1. Actualizar la ruta básica
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
        typeof coordenadas === 'string' ? coordenadas : JSON.stringify(coordenadas || []),
        id
      ]
    );

    // 2. Eliminar viajes existentes para esta ruta
    await conn.query(
      `DELETE FROM TBL_VIAJES WHERE Id_Rutas_FK = ?`,
      [id]
    );

    // 3. Crear nuevos viajes con las unidades y horarios usando el SP
    if (unidades && Array.isArray(unidades) && unidades.length > 0 && 
        horarios && Array.isArray(horarios) && horarios.length > 0) {
      
      console.log("🔗 Re-asociando unidades con horarios:", { unidades, horarios });
      
      try {
        await conn.query(
          `CALL sp_asociar_unidades_activas_a_rutas_con_horarios(?, ?, ?)`,
          [id, JSON.stringify(horarios), JSON.stringify(unidades)]
        );
        console.log("✅ Unidades re-asociadas correctamente via SP");
      } catch (spError: any) {
        console.error("⚠️ Error en SP durante edición:", spError.message);
        
        // Fallback manual
        for (let i = 0; i < Math.min(unidades.length, horarios.length); i++) {
          const unidadId = unidades[i];
          const horario = horarios[i];
          
          if (unidadId && horario) {
            const [h, m, s] = (tiempoEstimado || "04:00:00").split(':').map(Number);
            const [horasSalida, minutosSalida] = horario.split(':').map(Number);
            
            const horaSalida = new Date();
            horaSalida.setHours(horasSalida, minutosSalida, 0, 0);
            
            const horaLlegada = new Date(horaSalida);
            horaLlegada.setHours(
              horaSalida.getHours() + h,
              horaSalida.getMinutes() + m,
              horaSalida.getSeconds() + s
            );
            
            await conn.query(
              `INSERT INTO TBL_VIAJES (Fecha, Hora_Salida, Hora_Estimada_Llegada, Id_Unidad_FK, Id_Rutas_FK)
               VALUES (CURDATE(), ?, ?, ?, ?)`,
              [horaSalida, horaLlegada, unidadId, id]
            );
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Ruta actualizada correctamente",
    });
    
  } catch (err: any) {
    console.error("❌ Error al actualizar ruta:", err);
    
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