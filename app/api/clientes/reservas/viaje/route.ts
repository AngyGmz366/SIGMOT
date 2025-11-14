export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const conn = await db.getConnection();


  try {
    const body = await req.json();
    const { idViaje, idAsiento, fecha, dni: dniManual, correo: correoManual } = body;

    let dni: string | null = null;
    let correo: string | null = null;
    let firebaseUID: string | null = null;

    // ----------------------------
    // 1. Bearer Token
    // ----------------------------
    const header =
      req.headers.get('authorization') || req.headers.get('Authorization');

    let decoded: any = null;

    if (header?.startsWith("Bearer ")) {
      const token = header.split(" ")[1];
      try {
        decoded = await adminAuth.verifyIdToken(token);
        
        firebaseUID = decoded.uid ?? null;

        // ⚡ PRIORIDAD 1: email directo en el token
        correo = decoded.email ?? null;

        // ⚡ PRIORIDAD 2: Google login → identity claims de firebase
        if (!correo && decoded.firebase?.identities?.['google.com']) {
          correo = decoded.firebase.identities['google.com'][0] ?? null;
        }

        // ⚡ PRIORIDAD 3: algún proveedor adicional
        if (!correo && decoded.firebase?.identities) {
          const identities = decoded.firebase.identities;
          const keys = Object.keys(identities);
          for (const key of keys) {
            if (identities[key]?.length > 0) {
              correo = identities[key][0];
              break;
            }
          }
        }

      } catch (err) {
        console.warn("⚠ Token inválido:", err);
      }
    }

    // ----------------------------
    // 2. Buscar en BD por UID
    // ----------------------------
    if (firebaseUID) {
      const [rows]: any = await conn.query(
        `
        SELECT p.DNI, c.Correo
        FROM mydb.TBL_MS_USUARIO u
        JOIN mydb.TBL_PERSONAS p ON p.Id_Persona_PK = u.Id_Persona_FK
        LEFT JOIN mydb.TBL_CORREOS c ON c.Id_Correo_PK = p.Id_Correo_FK
        WHERE u.Firebase_UID = ?
        LIMIT 1;
        `,
        [firebaseUID]
      );

      if (rows?.length) {
        dni = dni ?? rows[0].DNI ?? null;
        correo = correo ?? rows[0].Correo ?? null;
      }
    }

    // ----------------------------
    // 3. Fallback manual
    // ----------------------------
    if (!dni && dniManual) dni = dniManual;
    if (!correo && correoManual) correo = correoManual;

    // ----------------------------
    // 4. Validación final
    // ----------------------------
    if (!dni && !correo) {
      return NextResponse.json(
        { ok: false, error: "Debe proporcionar DNI o correo electrónico." },
        { status: 400 }
      );
    }

    // ----------------------------
    // 5. Ejecutar SP
    // ----------------------------
    await conn.query(`SET @out_id_reserva = NULL;`);

    await conn.query(
      `CALL sp_cliente_reservacion_crear_viaje(?,?,?,?,?,@out_id_reserva);`,
      [
        dni,
        correo,
        idViaje,
        idAsiento,
        fecha || new Date()
      ]
    );

    const [out]: any = await conn.query(
      `SELECT @out_id_reserva AS idReserva;`
    );

    return NextResponse.json(
      {
        ok: true,
        message: "Reservación creada exitosamente.",
        idReserva: out?.[0]?.idReserva ?? null
      },
      { status: 201 }
    );

  } catch (err: any) {
    console.error("❌ Error:", err);
    return NextResponse.json(
      { ok: false, error: err?.sqlMessage || err?.message },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
