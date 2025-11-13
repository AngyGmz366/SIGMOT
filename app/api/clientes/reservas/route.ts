export const dynamic = "force-dynamic";
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminAuth } from '@/lib/firebaseAdmin';

/**
 * 📄 GET /api/clientes/reservas
 * Devuelve todas las reservaciones pertenecientes al cliente autenticado.
 * SOLO acepta Authorization: Bearer <idToken>
 */
export async function GET(req: Request) {
  let conn;
  try {
    conn = await db.getConnection();

    // 🔹 Parámetros opcionales
    const { searchParams } = new URL(req.url);
    const estado = searchParams.get('estado');
    const tipo = searchParams.get('tipo');

    let firebaseUID: string | null = null;

    // 1️⃣ Obtener token desde Authorization header (único método válido para tu app)
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      try {
        // 🔥 Validación correcta de token usando firebaseAdmin.ts
        const decoded = await adminAuth.verifyIdToken(token);
        firebaseUID = decoded.uid;
        console.log('✅ UID obtenido desde Authorization:', firebaseUID);
      } catch (err) {
        console.warn('⚠️ Token Bearer inválido o expirado.', err);
      }
    }

    if (!firebaseUID) {
      return NextResponse.json(
        { ok: false, error: 'No hay sesión activa.' },
        { status: 401 }
      );
    }

    // 3️⃣ Buscar DNI del cliente en base al UID (SIN CAMBIAR NADA)
    const [rowsDNI]: any = await conn.query(
      `
      SELECT p.DNI
      FROM mydb.TBL_MS_USUARIO u
      INNER JOIN mydb.TBL_PERSONAS p ON p.Id_Persona_PK = u.Id_Persona_FK
      WHERE u.Firebase_UID = ?
      LIMIT 1;
      `,
      [firebaseUID]
    );

    const dni = rowsDNI?.[0]?.DNI ?? null;
    if (!dni) {
      return NextResponse.json(
        { ok: false, error: 'No se encontró el DNI del usuario autenticado.' },
        { status: 404 }
      );
    }

    console.log('🔍 DNI encontrado:', dni);

    // 4️⃣ Llamar SP (SIN TOCAR NADA)
    const [rows]: any = await conn.query(
      'CALL sp_reservaciones_por_cliente(?, ?, ?);',
      [dni, estado, tipo]
    );

    const resultRows = Array.isArray(rows) ? rows[0] ?? [] : [];

    const reservaciones = resultRows.map((r: any) => ({
      id: r.IdReserva,
      tipo: r.Tipo?.toLowerCase(),
      ruta: r.Ruta,
      unidad: r.Unidad,
      asiento: r.Asiento_Peso,
      fecha: r.Fecha_Reserva,
      estado: r.Estado?.toLowerCase(),
    }));

    console.log(`✅ Reservaciones encontradas: ${reservaciones.length}`);

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
