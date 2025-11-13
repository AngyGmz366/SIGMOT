export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminAuth } from '@/lib/firebaseAdmin';

/**
 * PUT /api/clientes/reservas/cancelar/:id
 * Cancela una reservación del cliente autenticado.
 * ✔ Autenticación SOLO por Bearer (Firebase JS SDK)
 * ✔ Mantiene modo DEV (dniManual)
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const conn = await db.getConnection();

  try {
    const { motivo, dni: dniManual } = await req.json();

    if (!motivo || motivo.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Debe indicar un motivo de cancelación.' },
        { status: 400 }
      );
    }

    let dni: string | null = null;
    let firebaseUID: string | null = null;

    // ----------------------------
    // Intentar obtener token Bearer
    // ----------------------------
    const authHeader =
      req.headers.get('authorization') || req.headers.get('Authorization');

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      try {
        // 🔥 Verificación correcta (sin getAuth() directo)
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
    // Fallback modo DEV
    // ----------------------------
    if (!dni && dniManual) {
      dni = dniManual;
      console.warn('⚠️ Modo DEV: usando DNI recibido en body');
    }

    // ----------------------------
    // Validar sesión
    // ----------------------------
    if (!dni) {
      return NextResponse.json(
        { ok: false, error: 'No hay sesión activa o DNI no encontrado.' },
        { status: 401 }
      );
    }

    // ----------------------------
    // Verificar que la reservación pertenece al cliente
    // ----------------------------
    const [rows]: any = await conn.query(
      `
      SELECT r.Id_Reserva_PK
      FROM mydb.TBL_RESERVACIONES r
      INNER JOIN mydb.TBL_CLIENTES c ON r.Id_Cliente_FK = c.Id_Cliente_PK
      INNER JOIN mydb.TBL_PERSONAS p ON c.Id_Persona_FK = p.Id_Persona_PK
      WHERE p.DNI = ? AND r.Id_Reserva_PK = ?;
      `,
      [dni, params.id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'No tiene permisos para cancelar esta reservación.' },
        { status: 403 }
      );
    }

    // ----------------------------
    // Llamar al SP
    // ----------------------------
    await conn.query('CALL mydb.sp_reservacion_cancelar(?, ?)', [params.id, motivo]);

    return NextResponse.json({
      ok: true,
      message: 'Reservación cancelada correctamente.',
      idReserva: params.id,
    });

  } catch (err: any) {
    console.error('❌ Error en PUT /api/clientes/reservas/cancelar/:id:', err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.sqlMessage || err?.message || 'Error al cancelar la reservación.',
      },
      { status: 500 }
    );
  } finally {
    try {
      conn.release();
    } catch (releaseErr) {
      console.error('❌ Error al liberar conexión en finally:', releaseErr);
    }
  }
}
