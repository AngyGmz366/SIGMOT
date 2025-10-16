// app/(main)/admin/rutas-admin/components/types.ts

export type EstadoUI = "activo" | "inactivo";

export type RutaUI = {
  id: number;
  origen: string;
  destino: string;
  estado: EstadoUI;
  tiempoEstimado?: string | null;
  distancia?: number | null; // Agregar esta propiedad
  descripcion?: string | null;
  precio?: number | null;
  horarios?: string[];
  coordenadas?: { lat: number; lng: number }[];
  unidades?: number[];
};

export type UnidadAsignada = {
  unidadId: number;
  horario: string;
  nombreUnidad: string;
  index: number;
};