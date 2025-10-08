export type RutaPublica = {
  id: number;
  origen: string;
  destino: string;
  tiempoEstimado: string | null; // "HH:mm:ss" o null
  distancia: number | null;
  precio: number;                // viene con valor (filtrado en API)
  horarios: string[];            // ["06:00","12:00","18:00"]
};

// opcional para pintar rápido sin corchetes
export function horariosToStr(hs: string[]) {
  return (hs ?? []).map(h => String(h).replace(/^0/, '')).join(' • ');
}
