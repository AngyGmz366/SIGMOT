import { RutaPublica, horariosToStr } from "../Types/rutas.types";

export async function getRutasPublic(): Promise<RutaPublica[]> {
  const res = await fetch("/api/rutas-publico", { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar rutas");
  const data = await res.json();
  const items = (data?.items ?? []) as any[];
  return items.map((r) => ({
    id: r.id,
    origen: r.origen,
    destino: r.destino,
    tiempoEstimado: r.tiempoEstimado ?? null,
    distancia: r.distancia ?? null,
    precio: Number(r.precio),
    horarios: r.horarios ?? [],
  }));
}

export async function getRutaPublic(id: number) {
  const res = await fetch(`/api/rutas-publico/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Ruta no encontrada");
  const data = await res.json();
  const h = data.header;
  const horarios: string[] = data.horarios ?? [];
  return {
    header: {
      id: h.id,
      origen: h.origen,
      destino: h.destino,
      tiempoEstimado: h.tiempoEstimado ?? null,
      distancia: h.distancia ?? null,
      precio: Number(h.precio),
    },
    horarios,
    horariosStr: horariosToStr(horarios),
  };
}
