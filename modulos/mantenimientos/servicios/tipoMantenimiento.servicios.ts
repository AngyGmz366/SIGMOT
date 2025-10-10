import api from '@/lib/axios';

/**
 * 🔹 Obtener todos los tipos de mantenimiento desde la API
 * GET /api/mantenimientos/tipo-mantenimiento
 */
export async function obtenerTiposMantenimiento() {
  try {
    const res = await api.get('/api/Mantenimientos/tipo-mantenimiento');
    return res.data;
  } catch (error) {
    console.error('❌ Error al obtener tipos de mantenimiento:', error);
    throw error;
  }
}
