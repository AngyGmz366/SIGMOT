export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { db } from "../../../lib/db"; // ruta relativa desde app/api/unidades

// GET /api/unidades?placa=&marca=&modelo=&anio=&estado=&limit=50&offset=0
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const placa  = searchParams.get("placa");
  const marcaUnidad  = searchParams.get("marcaUnidad");
  const modelo = searchParams.get("modelo");
  const anio   = searchParams.get("anio");
  const estado = searchParams.get("estado");
  const limit  = Number(searchParams.get("limit") ?? 50);
  const offset = Number(searchParams.get("offset") ?? 0);

  const [rows]: any = await db.query(
    "CALL mydb.sp_unidades_listar(?,?,?,?,?,?,?)",
    [
      placa ?? null,
      marcaUnidad ?? null,
      modelo ?? null,
      anio ? Number(anio) : null,
      estado ? Number(estado) : null,
      limit,
      offset,
    ]
  );
  return NextResponse.json(rows[0] ?? []);
}

function validarUnidad(data: any) {
  const errores: string[] = []
  const anioActual = new Date().getFullYear()

  if (!data.numeroPlaca || !String(data.numeroPlaca).trim()) {
    errores.push("La placa es obligatoria")
  } else if (!/^[A-Z0-9-]+$/i.test(String(data.numeroPlaca).trim())) {
    errores.push("La placa solo puede contener letras, números y guiones")
  } else if (String(data.numeroPlaca).trim().length > 15) {
    errores.push("La placa no puede exceder 15 caracteres")
  }

  if (!data.marcaUnidad || !String(data.marcaUnidad).trim()) {
    errores.push("La marca es obligatoria")
  } else if (String(data.marcaUnidad).trim().length > 10) {
    errores.push("La marca no puede exceder 10 caracteres")
  }

  if (!data.modelo || !String(data.modelo).trim()) {
    errores.push("El modelo es obligatorio")
  } else if (String(data.modelo).trim().length > 10) {
    errores.push("El modelo no puede exceder 10 caracteres")
  }

  if (data.anio === null || data.anio === undefined || data.anio === '') {
    errores.push("El año es obligatorio")
  } else if (!/^\d{4}$/.test(String(data.anio))) {
    errores.push("El año debe tener exactamente 4 dígitos numéricos")
  } else if (Number(data.anio) < 1950 || Number(data.anio) > anioActual + 1) {
    errores.push(`El año debe estar entre 1950 y ${anioActual + 1}`)
  }

  if (data.capacidadAsientos === null || data.capacidadAsientos === undefined || data.capacidadAsientos === '') {
    errores.push("La capacidad de asientos es obligatoria")
  } else if (!/^\d{1,3}$/.test(String(data.capacidadAsientos))) {
    errores.push("La capacidad de asientos debe tener máximo 3 dígitos")
  } else if (Number(data.capacidadAsientos) < 1 || Number(data.capacidadAsientos) > 100) {
    errores.push("La capacidad de asientos debe estar entre 1 y 100")
  }

  if (data.descripcion && String(data.descripcion).length > 250) {
    errores.push("La descripción no puede exceder 250 caracteres")
  }

  return errores
}

// POST /api/unidades
export async function POST(req: Request) {
  try {
    const b = await req.json();

    const errores = validarUnidad(b)

    if (errores.length > 0) {
      return NextResponse.json(
        { error: errores.join(", ") },
        { status: 400 }
      )
    }

    const params = [
      b.numeroPlaca,
      b.marcaUnidad ?? null,
      b.modelo ?? null,
      b.anio ?? null,
      b.capacidadAsientos ?? null,
      b.descripcion ?? null,
      b.idEstadoFk ?? 1,
    ];


    const [rows]: any = await db.query("CALL mydb.sp_unidades_crear_con_asientos(?,?,?,?,?,?,?)", params);
    const nuevoId = rows[0][0].Id_Unidad_PK;

    const [one]: any = await db.query("CALL mydb.sp_unidades_obtener(?)", [nuevoId]);
    return NextResponse.json(one[0][0], { status: 201 });
  } catch (e: any) {
    const msg = e?.message || "";

    let errorTraducido = "Error al crear la unidad";

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
