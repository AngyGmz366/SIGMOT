export const runtime = 'nodejs';
import { db } from '@/lib/db_api';

// Utility functions to return JSON responses
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
    estado_persona,
  } = body;

  const conn = await db.getConnection();
  try {
    console.log('✏️ Actualizando persona ID:', id);
    console.log('📤 Body recibido:', body);

    // ✅ Verificar que el estado sea numérico
    let estadoId = estado_persona;
    if (typeof estado_persona === 'string') {
      const mapaEstados: Record<string, number> = {
        ACTIVA: 1,
        ELIMINADA: 2,
        INACTIVA: 2,
      };
      estadoId = mapaEstados[estado_persona.toUpperCase()] ?? 1;
    }

    console.log('🔄 Estado convertido a ID:', estadoId);

    // ✅ Llamada corregida (13 parámetros)
    await conn.query('CALL mydb.sp_personas_actualizar(?,?,?,?,?,?,?,?,?,?,?,?,?)', [
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
      estadoId,
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
  if (!id || isNaN(id)) {
    return new Response(JSON.stringify({ ok: false, error: 'ID inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const conn = await db.getConnection();
  try {
    await conn.query('CALL mydb.sp_personas_eliminar(?, ?)', [id, 1]); // id, idUsuarioAdmin (ejemplo)

    return new Response(JSON.stringify({ ok: true, message: 'Persona eliminada correctamente' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('❌ Error en DELETE /personas/[id]:', e?.sqlMessage || e?.message);
    return new Response(JSON.stringify({ ok: false, error: e?.sqlMessage || e?.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    conn.release();
  }
}
