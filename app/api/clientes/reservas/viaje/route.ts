export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';

/**
 * 📦 POST /api/clientes/reservas/viaje
 * Crea una reservación de tipo VIAJE usando:
 *  1️⃣ Token Bearer (Firebase JS SDK)
 *  2️⃣ Cookie de sesión (login del sistema)
 *  3️⃣ DNI directo (modo DEV temporal)
 */

export async function POST(req: Request) {
  const conn = await db.getConnection();

  try {
    const body = await req.json();
    const { idViaje, idAsiento, fecha, dni: dniManual } = body;

    let dni: string | null = null;
    let firebaseUID: string | null = null;

    // ----------------------------
    // 1️⃣ Intentar obtener token de Authorization (Bearer)
    // ----------------------------
    const authHeader =
      req.headers.get('authorization') || req.headers.get('Authorization');

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = await getAuth().verifyIdToken(token);
        firebaseUID = decoded.uid;
      } catch (err) {
        console.warn('⚠️ Token Bearer inválido o expirado');
      }
    }

    // ----------------------------
    // 2️⃣ Intentar cookie de sesión (Firebase Admin)
    // ----------------------------
    if (!firebaseUID) {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('session')?.value;
      if (sessionCookie) {
        try {
          const decoded = await getAuth().verifySessionCookie(sessionCookie, true);
          firebaseUID = decoded.uid;
        } catch (err) {
          console.warn('⚠️ Cookie de sesión inválida o expirada');
        }
      }
    }

    // ----------------------------
    // 3️⃣ Buscar DNI según el UID
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
    // 4️⃣ Fallback: permitir dni directo en modo DEV
    // ----------------------------
    if (!dni && dniManual) {
      dni = dniManual;
      console.warn('⚠️ Modo DEV: usando DNI recibido en body');
    }

    // ----------------------------
    // 5️⃣ Validar que tengamos un DNI
    // ----------------------------
    if (!dni) {
      return NextResponse.json(
        { ok: false, error: 'No hay sesión activa o DNI no encontrado.' },
        { status: 401 }
      );
    }

    // 💾 Ejecutar SP con el DNI obtenido
    await conn.query('SET @out_id_reserva = NULL;');
    await conn.query('CALL sp_cliente_reservacion_crear_viaje(?,?,?,?,@out_id_reserva);', [
      dni,
      idViaje,
      idAsiento,
      fecha || new Date(),
    ]);

    // 🔹 Obtener ID de reserva
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
