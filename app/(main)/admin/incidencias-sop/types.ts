export type EstadoIncidencia = 'Pendiente' | 'En Progreso' | 'Resuelto';

export interface Incidencia {
  id: number;
  titulo: string;
  categoria: string;
  descripcion: string;
  fecha: string; // Podrías cambiarlo a Date si luego manejarás fechas
  estado: EstadoIncidencia;
}

