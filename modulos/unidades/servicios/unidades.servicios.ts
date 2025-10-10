import api from '@/lib/axios';

export async function listarUnidades() {
  const res = await api.get('/api/unidades'); // sin filtros
  return res.data;
}
