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

const mapRow = (r: any) => ({
  id: r.Id_Reserva_PK,
  dni: r.DNI || r.Dni || null,
  correo: r.Correo || null,
  idCliente: r.IdCliente,
  cliente: r.Cliente,
  tipo: lower(r.Tipo),
  id_viaje: r.Id_Viaje_FK ?? null,
  id_encomienda: r.Id_Encomienda_FK ?? null,
  id_asiento: r.Id_Asiento_FK ?? null,
  costo: r.Costo ?? null,
  ruta: r.Ruta,
  unidad: r.Unidad,
  asiento_peso: r.Asiento_Peso,
  estado: lower(r.Estado),
  fecha: r.Fecha_Reserva,
  numero_asiento: r.Numero_Asiento, // Agregado para el formulario
});

// ==============================
//  GET /api/reservas/[id] - CORREGIDO
// ==============================
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'id inválido' }, { status: 400 });
  }

  const conn = await db.getConnection();
  try {
    const [rows]: any = await conn.query(
      `SELECT 
        r.Id_Reserva_PK,
        c.Id_Cliente_PK AS IdCliente,
        p.DNI,
        co.Correo AS Correo,
        CONCAT(p.Nombres, ' ', p.Apellidos) AS Cliente,
        r.Tipo_Reserva AS Tipo,
        r.Id_Viaje_FK,
        r.Id_Asiento_FK,
        r.Id_Encomienda_FK,
        COALESCE(e.Costo, t.Precio_Total) AS Costo,
        CONCAT(rt.Origen, ' → ', rt.Destino) AS Ruta,
        CONCAT('Placa ', u.Numero_Placa, ' / ', u.Marca_Unidad) AS Unidad,
        a.Numero_Asiento,
        CASE 
          WHEN r.Tipo_Reserva = 'VIAJE' THEN CONCAT('Asiento ', a.Numero_Asiento)
          WHEN r.Tipo_Reserva = 'ENCOMIENDA' THEN CONCAT('Costo ', COALESCE(e.Costo, t.Precio_Total), ' Lps')
          ELSE NULL
        END AS Asiento_Peso,
        r.Estado,
        r.Fecha_Reserva
      FROM mydb.TBL_RESERVACIONES r
      LEFT JOIN mydb.TBL_CLIENTES c ON c.Id_Cliente_PK = r.Id_Cliente_FK
      LEFT JOIN mydb.TBL_PERSONAS p ON p.Id_Persona_PK = c.Id_Persona_FK
      LEFT JOIN mydb.TBL_CORREOS co ON co.Id_Correo_PK = p.Id_Correo_FK  -- CORREGIDO: relación correcta
      LEFT JOIN mydb.TBL_ASIENTOS a ON a.Id_Asiento_PK = r.Id_Asiento_FK
      LEFT JOIN mydb.TBL_ENCOMIENDAS e ON e.Id_Encomiendas_PK = r.Id_Encomienda_FK
      LEFT JOIN mydb.TBL_VIAJES v ON v.Id_Viaje_PK = COALESCE(r.Id_Viaje_FK, e.Id_VIaje_FK)
      LEFT JOIN mydb.TBL_RUTAS rt ON rt.Id_Ruta_PK = v.Id_Rutas_FK
      LEFT JOIN mydb.TBL_UNIDADES u ON u.Id_Unidad_PK = v.Id_Unidad_FK
      LEFT JOIN mydb.TBL_TICKET t ON t.Id_Reserva_FK = r.Id_Reserva_PK
      WHERE r.Id_Reserva_PK = ? LIMIT 1;`,
      [id]
    );

    console.log('Resultado de la consulta:', rows); // Para debug

    const data = normalizeCallResult(rows);
    if (!data?.length) {
      return NextResponse.json({ error: 'No existe la reservación' }, { status: 404 });
    }
    
    return NextResponse.json(mapRow(data[0]), { status: 200 });
  } catch (e: any) {
    console.error('Error detallado en GET:', e);
    return NextResponse.json({ 
      error: 'Error al obtener reservación: ' + (e?.sqlMessage || e?.message),
      details: e?.toString()
    }, { status: 500 });
  } finally {
    conn.release();
  }
}

// ==============================
//  PUT /api/reservas/[id] - CON MEJOR MANEJO DE ERRORES
// ==============================
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'id inválido' }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));

  const dni          = body?.dni ? String(body.dni).trim() : null;
  const correo       = body?.correo ? String(body.correo).trim() : null;
  const idViaje      = body?.id_viaje ? Number(body.id_viaje) : null;
  const idEncomienda = body?.id_encomienda ? Number(body.id_encomienda) : null;
  const idAsiento    = body?.id_asiento ? Number(body.id_asiento) : null;
  const costo        = body?.costo ? Number(body.costo) : null;
  const fecha        = body?.fecha ? new Date(body.fecha) : null;
  const estado       = upperOrNull(body?.estado); 
  const tipo         = upperOrNull(body?.tipo);   

  // VALIDACIÓN
  if (!dni && !correo) {
    return NextResponse.json(
      { error: 'Debe enviar DNI o correo' }, 
      { status: 400 }
    );
  }

  if (tipo !== 'VIAJE' && tipo !== 'ENCOMIENDA') {
    return NextResponse.json({ error: 'tipo debe ser VIAJE o ENCOMIENDA' }, { status: 400 });
  }

  if (tipo === 'VIAJE' && idViaje == null) {
    return NextResponse.json({ error: 'id_viaje es obligatorio cuando tipo=VIAJE' }, { status: 400 });
  }

  if (tipo === 'ENCOMIENDA' && idViaje == null && idEncomienda == null) {
    return NextResponse.json({ error: 'Para ENCOMIENDA debe enviar id_viaje o id_encomienda' }, { status: 400 });
  }

  if (costo !== null && (typeof costo !== 'number' || costo < 0)) {
    return NextResponse.json({ error: 'costo debe ser un número positivo' }, { status: 400 });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // LLAMADA AL SP
    await conn.query(
      `CALL sp_reserva_actualizar(?,?,?,?,?,?,?,?,?,?)`,
      [
        id,            // p_id_reserva
        dni,           // p_dni
        correo,        // p_correo
        idViaje,       // p_id_viaje
        idEncomienda,  // p_id_encomienda
        idAsiento,     // p_id_asiento
        costo,         // p_costo
        fecha,         // p_fecha
        estado,        // p_estado
        tipo           // p_tipo
      ]
    );

    await conn.commit();

    return NextResponse.json(
      { ok: true, message: 'Reserva actualizada correctamente' },
      { status: 200 }
    );

  } catch (e: any) {
    await conn.rollback();
    console.error('Error al actualizar reserva:', e);
    
    // Manejo específico de errores del SP
    const errorMessage = e?.sqlMessage || e?.message || 'Error al actualizar reservación';
    
    if (errorMessage.includes('Persona no encontrada')) {
      return NextResponse.json(
        { error: 'No se encontró ninguna persona con el DNI o correo proporcionado' },
        { status: 404 }
      );
    }
    
    if (errorMessage.includes('Reserva no encontrada')) {
      return NextResponse.json(
        { error: 'La reservación que intenta actualizar no existe' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}

// ==============================
//  DELETE /api/reservas/[id] - SIN CAMBIOS
// ==============================
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'ID de reserva inválido' }, { status: 400 });
  }

  const conn = await db.getConnection();
  try {
    await conn.query('CALL sp_reserva_eliminar(?)', [id]);
    
    return NextResponse.json({ 
      ok: true,
      message: 'Reserva cancelada correctamente' 
    }, { status: 200 });
    
  } catch (e: any) {
    console.error('Error al eliminar reserva:', e);
    
    let errorMessage = 'Error al cancelar reservación';
    let statusCode = 500;
    
    if (e?.sqlMessage) {
      errorMessage = e.sqlMessage;
      
      if (e.sqlMessage.includes('Reserva no encontrada')) {
        statusCode = 404;
      } else if (e.sqlMessage.includes('foreign key constraint')) {
        errorMessage = 'No se puede cancelar la reserva porque tiene datos asociados';
        statusCode = 409;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        code: e?.code
      },
      { status: statusCode }
    );
  } finally {
    conn.release();
  }
}