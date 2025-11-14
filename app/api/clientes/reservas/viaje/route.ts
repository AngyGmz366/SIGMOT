export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminAuth } from '@/lib/firebaseAdmin';

/**
 * POST /api/clientes/reservas/viaje
 * Crea una reservación de tipo VIAJE
 * Token Bearer (Firebase Cliente)
 * Fallback DNI dev
 */
export async function POST(req: Request) {
  const conn = await db.getConnection();

  try {
    const body = await req.json();
    const { idViaje, idAsiento, fecha, dni: dniManual } = body;

    let dni: string | null = null;
    let firebaseUID: string | null = null;

    // ----------------------------
    // Validar sesión desde Authorization: Bearer <idToken>
    // ----------------------------
    const authHeader =
      req.headers.get('authorization') || req.headers.get('Authorization');

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      try {
        const decoded = await adminAuth.verifyIdToken(token);
        firebaseUID = decoded.uid;
      } catch (err) {
        console.warn('⚠️ Token Bearer inválido o expirado');
      }
    }

    // ----------------------------
    // Buscar DNI según UID
    // ----------------------------
    if (firebaseUID) {
      const [rows]: any = await conn.query(
        `
        SELECT p.DNI
        FROM mydb.TBL_MS_USUARIO u
        INNER JOIN mydb.TBL_PERSONAS p ON p.Id_Persona_PK = u.Id_Persona_FK
        WHERE u.Firebase_UID = ?
        LIMIT 1;
        `,
        [firebaseUID]
      );

      dni = rows?.[0]?.DNI ?? null;
    }

    // ----------------------------
    // Modo DEV (no tocado)
    // ----------------------------
    if (!dni && dniManual) {
      dni = dniManual;
      console.warn('⚠️ Modo DEV: usando DNI recibido en body');
    }

    // ----------------------------
    // Validación final
    // ----------------------------
    if (!dni) {
      return NextResponse.json(
        { ok: false, error: 'No hay sesión activa o DNI no encontrado.' },
        { status: 401 }
      );
    }

    // Ejecutar SP
    await conn.query('SET @out_id_reserva = NULL;');
    await conn.query('CALL sp_cliente_reservacion_crear_viaje(?,?,?,?,@out_id_reserva);', [
      dni,
      idViaje,
      idAsiento,
      fecha || new Date(),
    ]);

    const [out]: any = await conn.query('SELECT @out_id_reserva AS idReserva;');
    const idReserva = out?.[0]?.idReserva ?? null;

    return NextResponse.json(
      {
        ok: true,
        message: 'Reservación creada exitosamente.',
        idReserva,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('❌ Error en POST /api/clientes/reservas/viaje:', err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.sqlMessage || err?.message || 'Error al crear reservación.',
      },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
