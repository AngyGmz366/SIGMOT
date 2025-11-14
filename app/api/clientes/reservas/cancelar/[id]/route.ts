export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminAuth } from '@/lib/firebaseAdmin';

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
    let correo: string | null = null;
    let firebaseUID: string | null = null;

    // ----------------------------
    // 1. Obtener token Bearer
    // ----------------------------
    const authHeader =
      req.headers.get('authorization') || req.headers.get('Authorization');

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      try {
        const decoded = await adminAuth.verifyIdToken(token);
        firebaseUID = decoded.uid;
        correo = decoded.email ?? null;

        // identidades (Google)
        if (!correo && decoded.firebase?.identities?.['google.com']) {
          correo = decoded.firebase.identities['google.com'][0] ?? null;
        }

      } catch (err) {
        console.warn('⚠️ Token Bearer inválido o expirado');
      }
    }

    // ----------------------------
    // 2. Buscar DNI y correo en BD por UID
    // ----------------------------
    if (firebaseUID) {
      const [rowsUser]: any = await conn.query(
        `
        SELECT p.DNI, cr.Correo
        FROM mydb.TBL_MS_USUARIO u
        INNER JOIN mydb.TBL_PERSONAS p ON p.Id_Persona_PK = u.Id_Persona_FK
        LEFT JOIN mydb.TBL_CORREOS cr ON cr.Id_Correo_PK = p.Id_Correo_FK
        WHERE u.Firebase_UID = ?
        LIMIT 1;
        `,
        [firebaseUID]
      );

      if (rowsUser?.length) {
        dni = dni ?? rowsUser[0].DNI ?? null;
        correo = correo ?? rowsUser[0].Correo ?? null;
      }
    }

    // ----------------------------
    // 3. Fallback modo DEV
    // ----------------------------
    if (!dni && dniManual) {
      dni = dniManual;
      console.warn('⚠️ Modo DEV: usando DNI recibido en body');
    }

    // ----------------------------
    // 4. Debe existir DNI o correo
    // ----------------------------
    if (!dni && !correo) {
      return NextResponse.json(
        { ok: false, error: 'No se encontró DNI ni correo del usuario.' },
        { status: 401 }
      );
    }

    // ----------------------------
    // 5. Validar propiedad de reservación (DNI O CORREO)
    // ----------------------------
    const [rowsCheck]: any = await conn.query(
      `
      SELECT r.Id_Reserva_PK
      FROM mydb.VW_ADMIN_RESERVAS r
      WHERE r.Id_Reserva_PK = ?
        AND (r.DNI = ? OR r.Correo = ?)
      LIMIT 1;
      `,
      [params.id, dni, correo]
    );

    if (rowsCheck.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'No tiene permisos para cancelar esta reservación.' },
        { status: 403 }
      );
    }

    // ----------------------------
    // 6. Llamar SP
    // ----------------------------
    await conn.query(
      'CALL mydb.sp_reservacion_cancelar(?, ?)',
      [params.id, motivo]
    );

    return NextResponse.json({
      ok: true,
      message: 'Reservación cancelada correctamente.',
      idReserva: params.id,
    });

  } catch (err: any) {
    console.error('❌ Error en cancelar reservación:', err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.sqlMessage || err?.message || 'Error al cancelar reservación.',
      },
      { status: 500 }
    );
  } finally {
    try { conn.release(); } catch {}
  }
}
