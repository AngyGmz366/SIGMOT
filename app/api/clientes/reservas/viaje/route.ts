export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';

/**
 * 📦 POST /api/clientes/reservas/viaje
 * Crea una reservación de tipo VIAJE usando el usuario autenticado
 */
export async function POST(req: Request) {
  const conn = await db.getConnection();

  try {
    const { idViaje, idAsiento, fecha } = await req.json();

    // 🧠 Obtener cookie de sesión Firebase
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'No hay sesión activa.' }, { status: 401 });
    }

    // 🔹 Verificar token de Firebase
    const decoded = await getAuth().verifySessionCookie(sessionCookie, true);
    const firebaseUID = decoded.uid;

    // 🔹 Buscar el DNI del usuario autenticado
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

    const dni = rows?.[0]?.DNI ?? null;
    if (!dni) {
      return NextResponse.json({ error: 'No se encontró el DNI del cliente.' }, { status: 404 });
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
      { ok: false, error: err?.sqlMessage || err?.message || 'Error al crear reservación.' },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
