import api from '@/lib/axios';

/**
 * 🔹 Obtener todos los estados de mantenimiento desde la API
 * GET /api/mantenimientos/estado-mantenimiento
 */
export async function obtenerEstadosMantenimiento() {
  try {
    const res = await api.get('/api/Mantenimientos/estado-mantenimiento');
    return res.data;
  } catch (error) {
    console.error('❌ Error al obtener estados de mantenimiento:', error);
    throw error;
  }
}
