// ✅ /Types/rutas.types.ts
import type { LatLngExpression } from 'leaflet';

type Coordenada = [number, number];

export interface Parada {
  nombre: string;
  posicion: Coordenada;
  horario: string[];
  tarifa: number;
}

export interface Ruta {
  id: string;
  nombre: string;
  origen: string;
  destino: string;
  estado: 'activo' | 'inactivo';
  coordenadas: Coordenada[];
  paradas: Parada[];
  tiempoEstimado?: string; // tiempo total estimado de la ruta
  asientosDisponibles?: number; // 👈 Agregado
}
