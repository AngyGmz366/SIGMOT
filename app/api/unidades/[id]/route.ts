export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
type Ctx = { params: { id: string } };

// ✅ Actualizar unidad
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const idUnidad = Number(id);
    const body = await req.json();
  
    const { numeroPlaca, marcaUnidad, modelo, anio, capacidadAsientos, descripcion } = body;
  
    try {
      // Ejecutar el SP de actualización
      await db.query(
        `CALL mydb.sp_unidades_actualizar(?, ?, ?, ?, ?, ?, ?);`,
        [idUnidad, numeroPlaca, marcaUnidad, modelo, anio, capacidadAsientos, descripcion]
      );
  
      // 🔹 Retornar el registro actualizado
      const [rows]: any = await db.query(
        `SELECT 
           Id_Unidad_PK AS id,
           Numero_Placa AS placa,
           Marca_Unidad AS marcaUnidad,
           Modelo AS modelo,
           Año AS año,
           Capacidad_Asientos AS capacidadAsientos,
           Descripcion AS descripcion
         FROM mydb.TBL_UNIDADES
         WHERE Id_Unidad_PK = ?;`,
        [idUnidad]
      );
  
      return NextResponse.json(rows[0], { status: 200 });
    } catch (error: any) {
      console.error('❌ Error al actualizar unidad:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  
  export async function POST(req: Request) {
    const body = await req.json();
    const { numeroPlaca, marcaUnidad, modelo, anio, capacidadAsientos, descripcion, idEstadoFk } = body;
  
    const conn = await db.getConnection();
    try {
      // Llamada al procedimiento de inserción
      const [result]: any = await conn.query(
        `CALL sp_unidades_crear(?, ?, ?, ?, ?, ?, @nuevoId);
         SELECT @nuevoId AS idNuevo;`,
        [numeroPlaca, marcaUnidad, modelo, anio, capacidadAsientos, descripcion, idEstadoFk]
      );
  
      // Obtén el ID recién creado
      const idNuevo = result[1][0].idNuevo;
  
      // 🔹 Selecciona la unidad recién insertada para retornarla al front
      const [unidadCreada]: any = await conn.query(
        `SELECT 
           Id_Unidad_PK AS id,
           Numero_Placa AS placa,
           Marca_Unidad AS marcaUnidad,
           Modelo AS modelo,
           Año AS año,
           Capacidad_Asientos AS capacidadAsientos,
           Descripcion AS descripcion
         FROM mydb.TBL_UNIDADES
         WHERE Id_Unidad_PK = ?`,
        [idNuevo]
      );
  
      return NextResponse.json(unidadCreada[0], { status: 201 });
    } catch (error: any) {
      console.error("❌ Error al crear unidad:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
      conn.release();
    }
  }

  export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const idUnidad = Number(id);
  
    try {
      const [rows]: any = await db.query(`CALL mydb.sp_unidades_obtener(?);`, [idUnidad]);
      return NextResponse.json(rows[0]?.[0] ?? {});
    } catch (error: any) {
      console.error('❌ Error al obtener unidad:', error);
      return NextResponse.json(
        { error: 'Error al obtener unidad' },
        { status: 500 }
      );
    }
  }
  
  export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const idUnidad = Number(params.id);
  
    if (isNaN(idUnidad)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }
  
    try {
      console.log("🗑️ Eliminando unidad con ID:", idUnidad);
  
      const [rows]: any = await db.query(`CALL mydb.sp_unidades_eliminar(?);`, [idUnidad]);
      const filasAfectadas = rows?.[0]?.[0]?.filas_afectadas || 0;
  
      if (filasAfectadas > 0) {
        return NextResponse.json({
          ok: true,
          message: `Unidad ${idUnidad} eliminada correctamente.`,
        });
      }
  
      return NextResponse.json({
        ok: false,
        message: `No se encontró la unidad con ID ${idUnidad}.`,
      }, { status: 404 });
  
    } catch (error: any) {
      console.error('❌ Error al eliminar unidad:', error);
      return NextResponse.json(
        { error: 'Error al eliminar unidad', details: error.message },
        { status: 500 }
      );
    }
  }