import api from '@/lib/axios'; // usa el alias @/lib/axios

export async function listarMantenimientos() {
  const res = await api.get('/api/Mantenimientos');
  return res.data;
}

export async function crearMantenimiento(data: any) {
  const res = await api.post('/api/Mantenimientos', data);
  return res.data;
}

export async function actualizarMantenimiento(id: number, data: any) {
  const res = await api.put(`/api/Mantenimientos/${id}`, data);
  return res.data;
}

export async function eliminarMantenimiento(id: number) {
  const res = await api.delete(`/api/Mantenimientos/${id}`);
  return res.data;
}

export async function obtenerMantenimiento(id: number) {
  const res = await api.get(`/api/Mantenimientos/${id}`);
  return res.data;
}

