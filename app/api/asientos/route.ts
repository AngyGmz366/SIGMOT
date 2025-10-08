import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * GET: listar asientos
 * - Si pasas `unidadId` por query string, filtra solo los de esa unidad.
 */
// app/api/asientos/route.ts

export async function GET(req: Request) {
  const conn = await db.getConnection(); 
  try {
    const { searchParams } = new URL(req.url);
    const unidadId = searchParams.get("unidadId");
    

    console.log("🚌 API /api/asientos → query recibido:", req.url, "→ unidadId:", unidadId);

    if (!unidadId) {
      return NextResponse.json({ error: "Falta unidadId" }, { status: 400 });
    }

    // Consulta correcta según la estructura real de TBL_ASIENTOS
    const [rows]: any = await db.query(
      `SELECT 
         Id_Asiento_PK        AS id,
         Numero_Asiento       AS numero,
         Id_Unidad_FK         AS id_unidad,
         Id_EstadoAsiento_FK  AS id_estado_asiento
       FROM TBL_ASIENTOS
       WHERE Id_Unidad_FK = ?`,
      [unidadId]
    );

    // console.log("💺 Filas obtenidas de BD:", rows);

    await conn.query('DO 1');

    return NextResponse.json({
      items: [
        {
          unidad: Number(unidadId),
          asientos: rows,
        },
      ],
    });
  } catch (err: any) {
    console.error("❌ Error en /api/asientos:", err);
    return NextResponse.json(
      { error: "internal_error", detail: err.message },
      { status: 500 }
    );
  }
}



/**
 * POST: crear asiento
 * Requiere: Id_EstadoAsiento_FK, Id_Unidad_FK, Numero_Asiento
 */
export async function POST(req: Request) {
  try {
    const { Id_EstadoAsiento_FK, Id_Unidad_FK, Numero_Asiento } = await req.json();

    if (!Id_EstadoAsiento_FK || !Id_Unidad_FK || !Numero_Asiento) {
      return NextResponse.json(
        { error: 'missing_fields', detail: 'Campos requeridos: Id_EstadoAsiento_FK, Id_Unidad_FK, Numero_Asiento' },
        { status: 400 }
      );
    }

    const [result]: any = await db.query(
      `INSERT INTO TBL_ASIENTOS (Id_EstadoAsiento_FK, Id_Unidad_FK, Numero_Asiento)
       VALUES (?, ?, ?)`,
      [Id_EstadoAsiento_FK, Id_Unidad_FK, Numero_Asiento]
    );

    return NextResponse.json({ id: result.insertId });
  } catch (err: any) {
    console.error('❌ POST /api/asientos', err);
    return NextResponse.json({ error: 'internal_error', detail: String(err) }, { status: 500 });
  }
}
