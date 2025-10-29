export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';

/**
 * 📄 GET /api/clientes/reservas
 * Devuelve todas las reservaciones pertenecientes al cliente autenticado.
 * Usa autenticación Firebase para identificar al usuario.
 */

export async function GET(req: Request) {
  let conn;
  try {
    conn = await db.getConnection();

    // 🔹 Parámetros opcionales (estado/tipo) desde querystring
    const { searchParams } = new URL(req.url);
    const estado = searchParams.get('estado'); // 'PENDIENTE', 'CONFIRMADA', 'CANCELADA'
    const tipo = searchParams.get('tipo');     // 'VIAJE', 'ENCOMIENDA'

    // 🔒 Autenticación mediante cookie Firebase
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ ok: false, error: 'No hay sesión activa.' }, { status: 401 });
    }

    // ✅ Verificar cookie Firebase y obtener UID del usuario autenticado
    const decoded = await getAuth().verifySessionCookie(sessionCookie, true);
    const firebaseUID = decoded.uid;

    // 🔍 Buscar el DNI vinculado al UID
    const [rowsDNI]: any = await conn.query(
      `SELECT p.DNI 
         FROM mydb.TBL_MS_USUARIO u
         INNER JOIN mydb.TBL_PERSONAS p ON p.Id_Persona_PK = u.Id_Persona_FK
       WHERE u.Firebase_UID = ? 
       LIMIT 1;`,
      [firebaseUID]
    );

    const dni = rowsDNI?.[0]?.DNI ?? null;

    if (!dni) {
      return NextResponse.json(
        { ok: false, error: 'No se encontró el DNI del usuario autenticado.' },
        { status: 404 }
      );
    }

    // 📦 Ejecutar SP con el DNI real
    const [rows]: any = await conn.query('CALL sp_reservaciones_por_cliente(?, ?, ?);', [
      dni,
      estado,
      tipo,
    ]);

    // 🔹 Normalizar respuesta (MySQL devuelve arrays anidados)
    const resultRows = Array.isArray(rows) ? rows[0] ?? [] : [];

    // 🧩 Adaptar estructura al front TablaReservaciones
    const reservaciones = resultRows.map((r: any) => ({
      id: r.IdReserva,
      tipo: r.Tipo,
      ruta: r.Ruta,
      unidad: r.Unidad,
      asiento: r.Asiento_Peso,
      fecha: r.Fecha_Reserva,
      estado: r.Estado,
    }));

    return NextResponse.json({ ok: true, items: reservaciones }, { status: 200 });
  } catch (err: any) {
    console.error('❌ Error en GET /api/clientes/reservas:', err);
    return NextResponse.json(
      { ok: false, error: err?.sqlMessage || err?.message || 'Error al obtener reservaciones.' },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}
