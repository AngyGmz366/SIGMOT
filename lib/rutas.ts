// lib/rutas.ts
export type Ruta = {
  Id_Ruta_PK: number;
  Distancia: number | null;
  Tiempo_Estimado: string | null; // 'HH:mm:ss'
  Origen: string;
  Destino: string;
  Descripcion: string | null;
  Estado: 'ACTIVA' | 'INACTIVA';
};

export async function getRutas(): Promise<Ruta[]> {
  const res = await fetch('/api/rutas', { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'No se pudo cargar rutas');
  return data.items as Ruta[];
}

export async function crearRuta(input: {
  distancia?: number | null;
  tiempo_estimado?: string | null;
  origen: string;
  destino: string;
  descripcion?: string | null;
  estado?: 'ACTIVA' | 'INACTIVA';
}) {
  const res = await fetch('/api/rutas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Error al crear ruta');
  return data as { ok: true; id: number };
}

export async function actualizarRuta(id: number, input: {
  distancia?: number | null;
  tiempo_estimado?: string | null;
  origen: string;
  destino: string;
  descripcion?: string | null;
  estado?: 'ACTIVA' | 'INACTIVA';
}) {
  const res = await fetch(`/api/rutas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Error al actualizar ruta');
  return data as { ok: true; id: number };
}

export async function cambiarEstadoRuta(id: number, estado: 'ACTIVA' | 'INACTIVA') {
  const res = await fetch(`/api/rutas/${id}/estado`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Error al cambiar estado');
  return data as { ok: true; id: number; estado: 'ACTIVA' | 'INACTIVA' };
}
