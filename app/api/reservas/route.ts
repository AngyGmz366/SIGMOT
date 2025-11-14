// /app/api/reservas/route.ts
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

function normalizeCallResult(rows: any): any[] {
  if (Array.isArray(rows)) {
    if (Array.isArray(rows[0])) return rows[0];
    if (rows.length && typeof rows[0] === 'object' && !('affectedRows' in rows[0])) return rows;
  }
  return [];
}

const upperOrNull = (v?: string | null) => (v ? String(v).toUpperCase() : null);
const lower = (v: any) => (v ?? '').toString().toLowerCase();

function mapRow(r: any) {
  return {
    id: String(r.Id_Reserva_PK),
    idCliente: r.IdCliente,
    cliente: r.Cliente,
    tipo: lower(r.Tipo),
    ruta: r.Ruta,
    unidad: r.Unidad,
    asiento_peso: r.Asiento_Peso,
    estado: lower(r.Estado),
    fecha: r.Fecha_Reserva,
  };
}

// ==============================
//  GET /api/reservas
// ==============================
export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get('limit')) || 10;
  const offset = Number(url.searchParams.get('offset')) || 0;
  const estado = upperOrNull(url.searchParams.get('estado')); // PENDIENTE/CONFIRMADA/CANCELADA
  const tipo = upperOrNull(url.searchParams.get('tipo'));     // VIAJE/ENCOMIENDA
  const soloActivasParam = url.searchParams.get('solo_activas');
  const soloActivas = soloActivasParam === null ? 1 : Number(soloActivasParam) === 1 ? 1 : 0;

  const conn = await db.getConnection();
  try {
    const [rows]: any = await conn.query(
      'CALL sp_reserva_listar(?,?,?,?,?)',
      [limit, offset, estado, tipo, soloActivas]
    );

    const items = normalizeCallResult(rows).map(mapRow);
    return NextResponse.json({ items }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.sqlMessage || e?.message || 'Error al listar reservaciones' },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}

// ==============================
//  POST /api/reservas
// ==============================
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const tipo = upperOrNull(body?.tipo); // VIAJE | ENCOMIENDA
  const fecha = body?.fecha ? new Date(body.fecha) : new Date();
  const dni = body?.dni || null;
  const correo = body?.correo || null;

  if (!dni && !correo) {
  return NextResponse.json({ error: 'Debe enviar DNI o correo' }, { status: 400 });
  }

  const conn = await db.getConnection();
  try {
    await conn.query('SET @out := NULL');

    // =====================
    // VIAJE
    // =====================
    if (tipo === 'VIAJE') {
      const idViaje = Number(body?.id_viaje);
      const idAsiento = Number(body?.id_asiento);

      if (!Number.isFinite(idViaje)) {
        return NextResponse.json({ error: 'id_viaje es obligatorio y numérico' }, { status: 400 });
      }
      if (!Number.isFinite(idAsiento)) {
        return NextResponse.json({ error: 'id_asiento es obligatorio y numérico' }, { status: 400 });
      }

      await conn.query(
        'CALL mydb.sp_reserva_viaje_crear_con_boleto(?,?,?,?,?,@id_reserva,@id_ticket)',
        [dni, correo, idViaje, idAsiento, fecha]
        );

         // 🔹 Solo devolver el id_reserva al front (igual que con encomiendas)
        const [[vars]]: any = await conn.query('SELECT @id_reserva AS id_reserva;');
        const idReserva = vars?.id_reserva ?? null;

     return NextResponse.json({ id: idReserva }, { status: 201 });
    }

// =====================
// ENCOMIENDA
// =====================
else if (tipo === 'ENCOMIENDA') {
  const idViaje = Number(body?.id_viaje);
  const costo = Number(body?.costo) || null;
  const descripcion = body?.descripcion || null;

  // Validación mínima
  if (!dni && !correo) {
    return NextResponse.json(
      { error: 'Debe enviar DNI o correo' },
      { status: 400 }
    );
  }

  if (!Number.isFinite(idViaje)) {
    return NextResponse.json(
      { error: 'id_viaje es obligatorio y numérico' },
      { status: 400 }
    );
  }

  // OUT
  await conn.query('SET @id_reserva := NULL');
  await conn.query('SET @id_ticket := NULL');

  // ⚡ LLamada correcta al SP con DNI y CORREO
  await conn.query(
    'CALL mydb.sp_reserva_encomienda_crear_con_boleto(?,?,?,?,?,?,@id_reserva,@id_ticket)',
    [
      dni || null,         // p_dni
      correo || null,      // p_correo
      idViaje,             // p_id_viaje
      costo,               // p_costo
      descripcion,         // p_descripcion
      fecha                // p_fecha
    ]
  );

  // Obtener OUT
  const [[vars]]: any = await conn.query(
    'SELECT @id_reserva AS id_reserva, @id_ticket AS id_ticket;'
  );

  const idReserva = vars?.id_reserva ?? null;

  return NextResponse.json(
    { id: idReserva },
    { status: 201 }
  );
}


    else {
      return NextResponse.json({ error: 'tipo debe ser VIAJE o ENCOMIENDA' }, { status: 400 });
    }

    const [outRows]: any = await conn.query('SELECT @out AS id');
    const id = outRows?.[0]?.id ?? null;
    return NextResponse.json({ id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.sqlMessage || e?.message || 'Error al crear reservación' },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
