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
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const { searchParams } = new URL(req.url);
  const idUsuarioAdmin = Number(searchParams.get('idUsuarioAdmin'));

  if (!id || !idUsuarioAdmin) {
    return jsonError('Parámetros inválidos', 400);
  }

  const conn = await db.getConnection();
  try {
    console.log('🗑 Eliminando persona ID:', id);

    // ⚙️ Ejecutar SP y limpiar resultados
    const [resultSets]: any = await conn.query('CALL mydb.sp_personas_eliminar(?, ?)', [id, idUsuarioAdmin]);
    await conn.query('DO 1'); // fuerza cierre de result set si hay más de uno

    return json({ message: 'Persona eliminada correctamente', id }, 200);
  } catch (e: any) {
    console.error('❌ Error en DELETE /personas/[id]:', e);
    return jsonError(e?.sqlMessage || e?.message || 'Error al eliminar persona', 500);
  } finally {
    conn.release();
  }
}
