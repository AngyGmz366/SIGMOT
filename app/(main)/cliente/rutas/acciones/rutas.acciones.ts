import { RutaPublica, horariosToStr } from "../Types/rutas.types";

/**
 * 🔹 carga todas las rutas públicas activas desde la API
 */
export async function getRutasPublic(): Promise<RutaPublica[]> {
  const res = await fetch("/api/rutas-publico", { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar rutas");

  const data = await res.json();
  const items = (data?.items ?? []) as any[];

  return items.map((r) => {
    // 🧩 Normalización defensiva de datos
    const id = r.id ?? r.Id_Ruta_PK ?? 0;
    const origen = r.origen ?? r.Origen ?? "";
    const destino = r.destino ?? r.Destino ?? "";
    const tiempoEstimado = r.tiempoEstimado ?? r.Tiempo_Estimado ?? null;
    const distancia = Number(r.distancia ?? r.Distancia ?? 0);
    const precio = Number(r.precio ?? r.Precio ?? 0);

    // 🕒 Parsear horarios
    let horarios: string[] = [];
    try {
      if (typeof r.horarios === "string") {
        horarios = JSON.parse(r.horarios);
      } else if (Array.isArray(r.horarios)) {
        horarios = r.horarios;
      }
    } catch {
      horarios = [];
    }

    // 📍 Parsear coordenadas
    let coordenadas: { lat: number; lng: number }[] = [];
    try {
      if (typeof r.coordenadas === "string") {
        coordenadas = JSON.parse(r.coordenadas);
      } else if (Array.isArray(r.coordenadas)) {
        coordenadas = r.coordenadas;
      }
    } catch {
      coordenadas = [];
    }

    return {
      id,
      origen,
      destino,
      tiempoEstimado,
      distancia,
      precio,
      horarios,
      coordenadas, // 👈 importante para el mapa
    } as RutaPublica;
  });
}

/**
 * 🔹 Carga una ruta pública individual por ID
 */
export async function getRutaPublic(id: number) {
  const res = await fetch(`/api/rutas-publico/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Ruta no encontrada");

  const data = await res.json();
  const h = data.header ?? {};

  // 🕒 Parsear horarios
  let horarios: string[] = [];
  try {
    if (typeof data.horarios === "string") {
      horarios = JSON.parse(data.horarios);
    } else if (Array.isArray(data.horarios)) {
      horarios = data.horarios;
    }
  } catch {
    horarios = [];
  }

  return {
    header: {
      id: h.id ?? h.Id_Ruta_PK ?? 0,
      origen: h.origen ?? h.Origen ?? "",
      destino: h.destino ?? h.Destino ?? "",
      tiempoEstimado: h.tiempoEstimado ?? h.Tiempo_Estimado ?? null,
      distancia: Number(h.distancia ?? h.Distancia ?? 0),
      precio: Number(h.precio ?? h.Precio ?? 0),
    },
    horarios,
    horariosStr: horariosToStr(horarios),
  };
}
