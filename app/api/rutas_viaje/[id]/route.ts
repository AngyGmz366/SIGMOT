    export const runtime = 'nodejs';
import { db } from '@/lib/db_api';

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
function jsonError(message: string, status = 500, extra?: any) {
  return json({ ok: false, error: message, ...(extra ? { detail: extra } : {}) }, status);
}

/**
 * 🔹 Devuelve el Id_Ruta_FK de un viaje específico
 * Ejemplo: GET /api/ruta-por-viaje/12
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const idViaje = Number(params.id);
  if (!idViaje || isNaN(idViaje)) return jsonError('ID de viaje inválido', 400);

  const conn = await db.getConnection();
  try {
    const [rows]: any = await conn.query(
      `SELECT Id_Rutas_FK AS Id_Ruta_FK FROM mydb.TBL_VIAJES WHERE Id_Viaje_PK = ?;
`,
      [idViaje]
    );

    if (!rows?.length) return jsonError('Viaje no encontrado', 404);

    return json({ ok: true, Id_Ruta_FK: rows[0].Id_Ruta_FK }, 200);
  } catch (e: any) {
    console.error('❌ Error /ruta-por-viaje:', e?.message || e);
    return jsonError(e?.sqlMessage || e?.message || 'Error al obtener ruta del viaje', 500);
  } finally {
    conn.release();
  }
}
