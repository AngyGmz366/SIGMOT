export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
type Ctx = { params: { id: string } };

function validarUnidad(data: any) {
  const errores: string[] = [];
  const anioActual = new Date().getFullYear();

  if (!data.numeroPlaca || !String(data.numeroPlaca).trim()) {
    errores.push("La placa es obligatoria");
  } else if (!/^[A-Z0-9-]+$/i.test(String(data.numeroPlaca).trim())) {
    errores.push("La placa solo puede contener letras, números y guiones");
  } else if (String(data.numeroPlaca).trim().length > 15) {
    errores.push("La placa no puede exceder 15 caracteres");
  }

  if (!data.marcaUnidad || !String(data.marcaUnidad).trim()) {
    errores.push("La marca es obligatoria");
  } else if (String(data.marcaUnidad).trim().length > 10) {
    errores.push("La marca no puede exceder 10 caracteres");
  }

  if (!data.modelo || !String(data.modelo).trim()) {
    errores.push("El modelo es obligatorio");
  } else if (String(data.modelo).trim().length > 10) {
    errores.push("El modelo no puede exceder 10 caracteres");
  }

  if (data.anio === null || data.anio === undefined || data.anio === "") {
    errores.push("El año es obligatorio");
  } else if (!/^\d{4}$/.test(String(data.anio))) {
    errores.push("El año debe tener exactamente 4 dígitos numéricos");
  } else if (Number(data.anio) < 1950 || Number(data.anio) > anioActual + 1) {
    errores.push(`El año debe estar entre 1950 y ${anioActual + 1}`);
  }

  if (
    data.capacidadAsientos === null ||
    data.capacidadAsientos === undefined ||
    data.capacidadAsientos === ""
  ) {
    errores.push("La capacidad de asientos es obligatoria");
  } else if (!/^\d{1,3}$/.test(String(data.capacidadAsientos))) {
    errores.push("La capacidad de asientos debe tener máximo 3 dígitos");
  } else if (
    Number(data.capacidadAsientos) < 1 ||
    Number(data.capacidadAsientos) > 100
  ) {
    errores.push("La capacidad de asientos debe estar entre 1 y 100");
  }

  if (data.descripcion && String(data.descripcion).length > 250) {
    errores.push("La descripción no puede exceder 250 caracteres");
  }

  return errores;
}

// PUT /api/unidades/[id]
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const idUnidad = Number(id);
  const body = await req.json();

  const errores = validarUnidad(body);
  if (errores.length > 0) {
    return NextResponse.json(
      { error: errores.join(", ") },
      { status: 400 }
    );
  }

  const {
    numeroPlaca,
    marcaUnidad,
    modelo,
    anio,
    capacidadAsientos,
    descripcion
  } = body;

  try {
    await db.query(
      `CALL mydb.sp_unidades_actualizar(?, ?, ?, ?, ?, ?, ?);`,
      [
        idUnidad,
        String(numeroPlaca).trim(),
        String(marcaUnidad).trim(),
        String(modelo).trim(),
        Number(anio),
        Number(capacidadAsientos),
        descripcion?.trim() || null
      ]
    );

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
    console.error("❌ Error al actualizar unidad:", error);

    const msg = error?.message || "";
    let errorTraducido = "Error al actualizar la unidad";

    if (/duplicad|duplicate|existe|placa/i.test(msg)) {
      errorTraducido = "Ya existe una unidad con esa placa";
    } else if (/too long for column/i.test(msg)) {
      if (/numero_placa|placa/i.test(msg)) {
        errorTraducido = "La placa excede la longitud permitida";
      } else if (/marca_unidad|marcaunidad|marca/i.test(msg)) {
        errorTraducido = "La marca excede la longitud permitida";
      } else if (/modelo/i.test(msg)) {
        errorTraducido = "El modelo excede la longitud permitida";
      } else if (/capacidad_asientos|capacidadasientos/i.test(msg)) {
        errorTraducido = "La capacidad de asientos excede la longitud permitida";
      } else {
        errorTraducido = "Uno de los campos excede la longitud permitida";
      }
    }

    const status = /duplicad|duplicate|existe|placa/i.test(msg) ? 409 : 400;
    return NextResponse.json({ error: errorTraducido }, { status });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { numeroPlaca, marcaUnidad, modelo, anio, capacidadAsientos, descripcion, idEstadoFk } = body;

  const conn = await db.getConnection();
  try {
    const [result]: any = await conn.query(
      `CALL sp_unidades_crear(?, ?, ?, ?, ?, ?, @nuevoId);
       SELECT @nuevoId AS idNuevo;`,
      [numeroPlaca, marcaUnidad, modelo, anio, capacidadAsientos, descripcion, idEstadoFk]
    );

    const idNuevo = result[1][0].idNuevo;

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
    console.error("❌ Error al obtener unidad:", error);
    return NextResponse.json(
      { error: "Error al obtener unidad" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const idUnidad = Number(params.id);

  if (isNaN(idUnidad)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
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

    return NextResponse.json(
      {
        ok: false,
        message: `No se encontró la unidad con ID ${idUnidad}.`,
      },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("❌ Error al eliminar unidad:", error);
    return NextResponse.json(
      { error: "Error al eliminar unidad", details: error.message },
      { status: 500 }
    );
  }
}