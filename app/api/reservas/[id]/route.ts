// /app/api/reservas/[id]/route.ts
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
});



// ==============================
//  GET /api/reservas/[id]
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
     CONCAT(p.Nombres, ' ', p.Apellidos) AS Cliente,
     r.Tipo_Reserva AS Tipo,
     r.Id_Viaje_FK,
     r.Id_Asiento_FK,
     r.Id_Encomienda_FK,
     e.Costo,
     CONCAT(rt.Origen, ' → ', rt.Destino) AS Ruta,
     CONCAT('Placa ', u.Numero_Placa, ' / ', u.Marca_Unidad) AS Unidad,
     CASE 
       WHEN r.Tipo_Reserva = 'VIAJE' THEN CONCAT('Asiento ', a.Numero_Asiento)
       WHEN r.Tipo_Reserva = 'ENCOMIENDA' THEN CONCAT('Costo ', e.Costo, ' Lps')
       ELSE NULL
     END AS Asiento_Peso,
     r.Estado,
     r.Fecha_Reserva
   FROM mydb.TBL_RESERVACIONES r
   LEFT JOIN mydb.TBL_CLIENTES c ON c.Id_Cliente_PK = r.Id_Cliente_FK
   LEFT JOIN mydb.TBL_PERSONAS p ON p.Id_Persona_PK = c.Id_Persona_FK
   LEFT JOIN mydb.TBL_ASIENTOS a ON a.Id_Asiento_PK = r.Id_Asiento_FK
   LEFT JOIN mydb.TBL_ENCOMIENDAS e ON e.Id_Encomiendas_PK = r.Id_Encomienda_FK
   LEFT JOIN mydb.TBL_VIAJES v ON v.Id_Viaje_PK = COALESCE(r.Id_Viaje_FK, e.Id_VIaje_FK)
   LEFT JOIN mydb.TBL_RUTAS rt ON rt.Id_Ruta_PK = v.Id_Rutas_FK
   LEFT JOIN mydb.TBL_UNIDADES u ON u.Id_Unidad_PK = v.Id_Unidad_FK
   WHERE r.Id_Reserva_PK = ? LIMIT 1;`,
  [id]
    );

    const data = normalizeCallResult(rows);
    if (!data?.length) {
      return NextResponse.json({ error: 'No existe la reservación' }, { status: 404 });
    }
    return NextResponse.json(mapRow(data[0]), { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.sqlMessage || e?.message || 'Error al obtener reservación' }, { status: 500 });
  } finally {
    conn.release();
  }
}


// ==============================
//  PUT /api/reservas/[id]
// ==============================
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'id inválido' }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const dni          = body?.dni ?? null;
  const idViaje      = body?.id_viaje ?? null;
  const idEncomienda = body?.id_encomienda ?? null;
  const idAsiento    = body?.id_asiento ?? null;
  const costo        = body?.costo ?? null;
  const fecha        = body?.fecha ? new Date(body.fecha) : null;
  const estado       = upperOrNull(body?.estado); // PENDIENTE/CONFIRMADA/CANCELADA
  const tipo         = upperOrNull(body?.tipo);   // VIAJE/ENCOMIENDA

  console.log("DEBUG tipo:", tipo, "idEncomienda:", idEncomienda, "idViaje:", idViaje);

  // Validaciones mejoradas
  if (!dni) {
    return NextResponse.json({ error: 'dni es obligatorio' }, { status: 400 });
  }

  if (tipo !== 'VIAJE' && tipo !== 'ENCOMIENDA') {
    return NextResponse.json({ error: 'tipo debe ser VIAJE o ENCOMIENDA' }, { status: 400 });
  }

  // Validación específica según el tipo
  if (tipo === 'VIAJE' && idViaje == null) {
    return NextResponse.json({ 
      error: 'id_viaje es obligatorio cuando tipo=VIAJE' 
    }, { status: 400 });
  }

  // Para ENCOMIENDA, permitimos que el SP cree una automáticamente si no se envía
  if (tipo === 'ENCOMIENDA' && idEncomienda == null && idViaje == null) {
    console.warn(`⚠️ id_encomienda e id_viaje no enviados, el SP necesitará al menos id_viaje`);
    return NextResponse.json({ 
      error: 'Para ENCOMIENDA debe enviar id_viaje o id_encomienda' 
    }, { status: 400 });
  }

  // Validación de costo
  if (costo !== null && (typeof costo !== 'number' || costo < 0)) {
    return NextResponse.json({ 
      error: 'costo debe ser un número positivo' 
    }, { status: 400 });
  }

  // Validación de asiento según tipo
  if (tipo === 'ENCOMIENDA' && idAsiento !== null) {
    console.warn(`⚠️ id_asiento ignorado para tipo ENCOMIENDA`);
  }

  const conn = await db.getConnection();
  try {
    await conn.query(
      `CALL sp_reserva_actualizar(?,?,?,?,?,?,?,?,?)`,
      [id, dni, idViaje, idEncomienda, idAsiento, costo, fecha, estado, tipo]
    );
    
    return NextResponse.json({ 
      ok: true,
      message: 'Reserva actualizada correctamente' 
    }, { status: 200 });
    
  } catch (e: any) {
    console.error('Error al actualizar reserva:', e);
    return NextResponse.json(
      { 
        error: e?.sqlMessage || e?.message || 'Error al actualizar reservación',
        code: e?.code
      },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}


// ==============================
//  DELETE /api/reservas/[id]
// ==============================
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  
  // Validación mejorada del ID
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'ID de reserva inválido' }, { status: 400 });
  }

  const conn = await db.getConnection();
  try {
    // Ejecutar el SP de eliminación
    await conn.query('CALL sp_reserva_eliminar(?)', [id]);
    
    return NextResponse.json({ 
      ok: true,
      message: 'Reserva cancelada correctamente' 
    }, { status: 200 });
    
  } catch (e: any) {
    console.error('Error al eliminar reserva:', e);
    
    // Mensajes de error más específicos
    let errorMessage = 'Error al cancelar reservación';
    let statusCode = 500;
    
    if (e?.sqlMessage) {
      errorMessage = e.sqlMessage;
      
      // Manejar errores específicos de MySQL
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