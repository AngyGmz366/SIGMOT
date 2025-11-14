import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';

/**
 * POST /api/clientes/reservas/encomienda
 * Crea una reservación de tipo ENCOMIENDA.
 */
export async function POST(req: NextRequest) {
  const conn = await db.getConnection();

  try {
    const body = await req.json();
    const { dni: dniManual, idViaje, descripcion, fecha, costo } = body;

    let dni: string | null = null;
    let firebaseUID: string | null = null;

    // ----------------------------
    // Obtener UID desde Authorization: Bearer <idToken>
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
      const [rows]: any[] = await conn.query(
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
    // Modo DEV (siempre lo mantengo como está)
    // ----------------------------
    if (!dni && dniManual) {
      dni = dniManual;
      console.warn('⚠️ Modo DEV: usando DNI recibido en body');
    }

    // ----------------------------
    // Validación de DNI
    // ----------------------------
    if (!dni) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'No se pudo encontrar el DNI del cliente. Asegúrese de que haya sesión activa o proporcione un DNI válido.',
        },
        { status: 401 }
      );
    }

    // ----------------------------
    // Validación de campos (SIN CAMBIOS)
    // ----------------------------
    if (!descripcion || descripcion.length > 50) {
      return NextResponse.json(
        { ok: false, error: 'La descripción no puede exceder los 50 caracteres.' },
        { status: 400 }
      );
    }

    if (isNaN(costo) || costo <= 0) {
      return NextResponse.json(
        { ok: false, error: 'El costo debe ser un número válido y mayor que 0.' },
        { status: 400 }
      );
    }

    if (fecha && isNaN(new Date(fecha).getTime())) {
      return NextResponse.json(
        { ok: false, error: 'Fecha inválida.' },
        { status: 400 }
      );
    }

    // ----------------------------
    // Ejecutar SP
    // ----------------------------
    console.log('Llamando al SP con los siguientes parámetros:', {
      dni,
      idViaje,
      descripcion,
      fecha,
      costo,
    });

    await conn.query('SET @out_id_reserva = NULL;');
    await conn.query(
      'CALL sp_cliente_reservacion_crear_encomienda(?,?,?,?,?,@out_id_reserva);',
      [
        dni, // DNI del cliente
        idViaje ?? null,
        descripcion,
        fecha || new Date(),
        costo,
      ]
    );

    const [out]: any[] = await conn.query('SELECT @out_id_reserva AS idReserva;');
    const idReserva = out?.[0]?.idReserva ?? null;

    if (!idReserva) {
      console.error('❌ No se obtuvo el idReserva');
      return NextResponse.json(
        { ok: false, error: 'No se pudo obtener el ID de la reservación.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: 'Reservación de encomienda creada exitosamente.',
        idReserva,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('❌ Error en POST /api/clientes/reservas/encomienda:', err);
    return NextResponse.json(
      { ok: false, error: 'Error al crear reservación.' },
      { status: 500 }
    );
  } finally {
    try {
      conn.release();
    } catch (releaseErr) {
      console.error('❌ Error al liberar la conexión en finally:', releaseErr);
    }
  }
}
