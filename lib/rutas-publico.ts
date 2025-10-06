// lib/rutas-publico.ts
export type RutaCliente = {
  id: number;
  origen: string;
  destino: string;
  tiempoEstimado: string | null; // "HH:mm:ss"
  distancia: number | null;
  precio: number;                // ya filtramos que venga con precio
  horarios: string[];            // ["06:00","12:00","18:00"]
  // opcional para mostrar sin corchetes:
  horariosStr?: string;          // "6:00 • 12:00 • 18:00"
};

export async function getRutasPublic(): Promise<RutaCliente[]> {
  const res = await fetch('/api/rutas-publico', { cache: 'no-store' });
  if (!res.ok) throw new Error('No se pudo cargar rutas');
  const data = await res.json();
  const items = (data?.items ?? []) as any[];
  return items.map(r => ({
    id: r.id,
    origen: r.origen,
    destino: r.destino,
    tiempoEstimado: r.tiempoEstimado ?? null,
    distancia: r.distancia ?? null,
    precio: Number(r.precio),
    horarios: r.horarios ?? [],
    horariosStr: Array.isArray(r.horarios)
      ? r.horarios.map((h: string) => String(h).replace(/^0/,'')).join(' • ')
      : ''
  }));
}

export async function getRutaPublic(id: number): Promise<{
  header: Omit<RutaCliente, 'horarios'|'horariosStr'>;
  horarios: string[];
  horariosStr: string;
}> {
  const res = await fetch(`/api/rutas-publico/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Ruta no encontrada');
  const data = await res.json();
  const h = data.header;
  const horarios: string[] = data.horarios ?? [];
  return {
    header: {
      id: h.id, origen: h.origen, destino: h.destino,
      tiempoEstimado: h.tiempoEstimado ?? null,
      distancia: h.distancia ?? null,
      precio: Number(h.precio)
    },
    horarios,
    horariosStr: horarios.map((x: string) => x.replace(/^0/,'')).join(' • ')
  };
}
