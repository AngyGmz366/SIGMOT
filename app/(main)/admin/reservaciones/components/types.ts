export interface ReservacionBase {
  id: string;
  cliente: string;
  tipo: 'viaje' | 'encomienda';
  ruta: string;
  unidad: string;  // Nuevo campo para el bus
  estado: 'pendiente' | 'confirmado' | 'cancelado';
  fecha: Date;
}

export interface ReservacionViaje extends ReservacionBase {
  tipo: 'viaje';
  asiento: string;
}

export interface ReservacionEncomienda extends ReservacionBase {
  tipo: 'encomienda';
  peso: number;
  descripcion?: string;
}

