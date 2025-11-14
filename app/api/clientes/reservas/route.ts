export const dynamic = "force-dynamic";
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminAuth } from '@/lib/firebaseAdmin';

export async function GET(req: Request) {
  let conn;
  try {
    conn = await db.getConnection();

    const { searchParams } = new URL(req.url);
    const estado = searchParams.get('estado');
    const tipo   = searchParams.get('tipo');

    let firebaseUID: string | null = null;
    let correo: string | null = null;
    let dni: string | null = null;

    // ----------------------------
    // 1️⃣ Obtener token
    // ----------------------------
    const authHeader =
      req.headers.get('authorization') || req.headers.get('Authorization');

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      try {
        const decoded = await adminAuth.verifyIdToken(token);
        firebaseUID = decoded.uid ?? null;

        // Correo directo del token
        correo = decoded.email ?? null;

        // Google login
        if (!correo && decoded.firebase?.identities?.['google.com']) {
          correo = decoded.firebase.identities['google.com'][0];
        }

        // Otras identidades (por si acaso)
        if (!correo && decoded.firebase?.identities) {
          for (const provider of Object.keys(decoded.firebase.identities)) {
            const ids = decoded.firebase.identities[provider];
            if (ids?.length > 0) {
              correo = ids[0];
              break;
            }
          }
        }

      } catch (err) {
        console.warn("⚠️ Token inválido:", err);
      }
    }

    if (!firebaseUID) {
      return NextResponse.json(
        { ok: false, error: "No hay sesión activa." },
        { status: 401 }
      );
    }

    // ----------------------------
    // 2️⃣ Buscar DNI y correo en la BD
    // ----------------------------
    const [rowsData]: any = await conn.query(
      `
      SELECT p.DNI, c.Correo
      FROM mydb.TBL_MS_USUARIO u
      INNER JOIN mydb.TBL_PERSONAS p ON p.Id_Persona_PK = u.Id_Persona_FK
      LEFT JOIN mydb.TBL_CORREOS c   ON c.Id_Correo_PK = p.Id_Correo_FK
      WHERE u.Firebase_UID = ?
      LIMIT 1;
      `,
      [firebaseUID]
    );

    if (rowsData?.length) {
      dni    = rowsData[0].DNI    ?? dni;
      correo = rowsData[0].Correo ?? correo;
    }

    // ----------------------------
    // 3️⃣ Validación final:
    // Debe tener al menos 1 dato
    // ----------------------------
    if (!dni && !correo) {
      return NextResponse.json(
        { ok: false, error: "El usuario no tiene DNI ni correo registrado." },
        { status: 404 }
      );
    }

    // ----------------------------
    // 4️⃣ Ejecutar SP (ahora con 4 parámetros)
    // ----------------------------
    const [rows]: any = await conn.query(
      `CALL sp_reservaciones_por_cliente(?,?,?,?);`,
      [dni, correo, estado, tipo]
    );

    const result = Array.isArray(rows) ? rows[0] ?? [] : [];

    const reservaciones = result.map((r: any) => ({
      id: r.IdReserva,
      cliente: r.Cliente,
      tipo: r.Tipo?.toLowerCase(),
      ruta: r.Ruta,
      unidad: r.Unidad,
      asiento: r.Asiento_Peso,
      fecha: r.Fecha_Reserva,
      estado: r.Estado?.toLowerCase()
    }));

    return NextResponse.json(
      { ok: true, items: reservaciones },
      { status: 200 }
    );

  } catch (err: any) {
    console.error("❌ Error GET /api/clientes/reservas:", err);
    return NextResponse.json(
      { ok: false, error: err.sqlMessage ?? err.message },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}
