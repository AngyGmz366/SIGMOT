export const runtime = 'nodejs';
import { db } from '@/lib/db_api';

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
function jsonError(message: string, status = 500, extra?: any) {
  return json({ error: message, ...(extra ? { detail: extra } : {}) }, status);
}

/* ==============================================
   🔹 GET /api/personas/:id
   ============================================== */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id) return jsonError('ID de persona inválido', 400);

  const conn = await db.getConnection();
  try {
    console.log('🔎 Obteniendo persona por ID:', id);
    const [rows]: any = await conn.query('CALL mydb.sp_personas_obtener(?)', [id]);
    const persona = rows?.[0]?.[0];

    if (!persona) return jsonError('Persona no encontrada', 404);
    return json({ item: persona }, 200);
  } catch (e: any) {
    console.error('❌ Error en GET /personas/[id]:', e);
    return jsonError(e?.sqlMessage || e?.message || 'Error al obtener persona');
  } finally {
    conn.release();
  }
}

/* ==============================================
   🔹 PUT /api/personas/:id
   ============================================== */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id) return jsonError('ID de persona inválido', 400);

  const body = await req.json().catch(() => ({}));
  const {
    nombres,
    apellidos,
    dni,
    genero_id,
    fecha_nac,
    telefono,
    correo,
    departamento,
    municipio,
    tipo_persona,
    id_usuario_admin,
  } = body;

  const conn = await db.getConnection();
  try {
    console.log('✏️ Actualizando persona ID:', id);

    await conn.query('CALL mydb.sp_personas_actualizar(?,?,?,?,?,?,?,?,?,?,?,?)', [
      id,
      nombres,
      apellidos,
      dni,
      genero_id,
      fecha_nac || null,
      telefono,
      correo,
      departamento,
      municipio,
      tipo_persona,
      id_usuario_admin,
    ]);

    return json({ message: 'Persona actualizada correctamente', id }, 200);
  } catch (e: any) {
    console.error('❌ Error en PUT /personas/[id]:', e);
    return jsonError(e?.sqlMessage || e?.message || 'Error al actualizar persona');
  } finally {
    conn.release();
  }
}

/* ==============================================
   🔹 DELETE /api/personas/:id?idUsuarioAdmin=10
   ============================================== */
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // 👈 aquí esperas la promesa correctamente
  const idPersona = Number(id);

  const { searchParams } = new URL(req.url);
  const idUsuarioAdmin = Number(searchParams.get('idUsuarioAdmin'));

  if (!idPersona) {
    return new Response(JSON.stringify({ error: 'ID de persona inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const conn = await db.getConnection();
  try {
    console.log('🗑 Eliminando persona ID:', idPersona);
    const [resultSets]: any = await conn.query(
      'CALL mydb.sp_personas_eliminar(?, ?)',
      [idPersona, idUsuarioAdmin]
    );
    await conn.query('DO 1'); // limpia resultsets abiertos

    return new Response(
      JSON.stringify({ message: 'Persona eliminada correctamente', id: idPersona }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    // Manejo elegante de error de FK
    if (e.code === 'ER_ROW_IS_REFERENCED_2') {
      return new Response(
        JSON.stringify({
          error:
            'No se puede eliminar la persona porque tiene registros asociados (clientes, encomiendas, etc.).',
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.error('❌ Error en DELETE /personas/[id]:', e?.sqlMessage || e?.message);
    return new Response(
      JSON.stringify({ error: e?.sqlMessage || e?.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    conn.release();
  }
}
