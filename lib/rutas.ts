// /lib/rutas.ts
export type Ruta = {
  Id_Ruta_PK: number;
  Distancia: number | null;
  Tiempo_Estimado: string | null; // 'HH:mm:ss'
  Origen: string;
  Destino: string;
  Descripcion: string | null;
  Estado: 'ACTIVA' | 'INACTIVA';
  Precio?: number | null;
  Horarios?: string[] | null;
  Coordenadas?: { lat: number; lng: number }[] | null;
};

/* ===============================
   🔹 Listar todas las rutas
   =============================== */
export async function getRutas(): Promise<Ruta[]> {
  const res = await fetch('/api/rutas', { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'No se pudo cargar rutas');
  return (data.items ?? []) as Ruta[];
}

/* ===============================
   🔹 Crear nueva ruta (usa SP sp_rutas_crear_max5)
   =============================== */
export async function crearRuta(input: {
  distancia?: number | null;
  tiempoEstimado?: string | null; // corregido: coincide con el endpoint
  origen: string;
  destino: string;
  descripcion?: string | null;
  estado?: 'ACTIVA' | 'INACTIVA';
  precio?: number | null;
  horarios?: string[]; // JSON
  coordenadas?: { lat: number; lng: number }[]; // JSON
}) {
  const res = await fetch('/api/rutas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      distancia: input.distancia ?? 0,
      tiempoEstimado: input.tiempoEstimado ?? '00:00:00',
      origen: input.origen.trim(),
      destino: input.destino.trim(),
      descripcion: input.descripcion ?? null,
      estado: input.estado ?? 'ACTIVA',
      precio: input.precio ?? 0,
      horarios: input.horarios ?? [],
      coordenadas: input.coordenadas ?? [],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Error al crear ruta');

  // El endpoint devuelve { ok: true, idNuevo }
  return data as { ok: boolean; idNuevo: number | null };
}

/* ===============================
   🔹 Actualizar ruta existente
   =============================== */
export async function actualizarRuta(
  id: number,
  input: {
    distancia?: number | null;
    tiempoEstimado?: string | null;
    origen: string;
    destino: string;
    descripcion?: string | null;
    estado?: 'ACTIVA' | 'INACTIVA';
    precio?: number | null;
    horarios?: string[];
    coordenadas?: { lat: number; lng: number }[];
  }
) {
  const res = await fetch(`/api/rutas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      distancia: input.distancia ?? 0,
      tiempoEstimado: input.tiempoEstimado ?? '00:00:00',
      origen: input.origen.trim(),
      destino: input.destino.trim(),
      descripcion: input.descripcion ?? null,
      estado: input.estado ?? 'ACTIVA',
      precio: input.precio ?? 0,
      horarios: input.horarios ?? [],
      coordenadas: input.coordenadas ?? [],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Error al actualizar ruta');
  return data as { ok: boolean; id: number };
}

/* ===============================
   🔹 Cambiar estado (ACTIVA / INACTIVA)
   =============================== */
export async function cambiarEstadoRuta(id: number, estado: 'ACTIVA' | 'INACTIVA') {
  const res = await fetch(`/api/rutas/${id}/estado`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Error al cambiar estado');
  return data as { ok: boolean; id: number; estado: 'ACTIVA' | 'INACTIVA' };
}
