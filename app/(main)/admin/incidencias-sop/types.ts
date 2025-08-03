export interface Incidencia {
  id: number;
  titulo: string;
  categoria: string;
  descripcion: string;
  fecha: string;
  estado: 'Pendiente' | 'En Progreso' | 'Resuelto';
}
