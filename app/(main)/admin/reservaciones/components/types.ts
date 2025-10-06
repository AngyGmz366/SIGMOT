
// ==========================================
// 📘 Tipos base de Reservaciones SIGMOT
// ==========================================

// 🔹 Reservación base (común para viajes y encomiendas)
export interface ReservacionBase {
  id?: string;
  cliente?: string;
  ruta?: string;
  unidad?: string;
  estado?: 'pendiente' | 'confirmada' | 'cancelada';
  fecha?: Date;
  tipo?: 'viaje' | 'encomienda';
}

// 🔹 Reservación de viaje (tiene asiento)
export interface ReservacionViaje extends ReservacionBase {
  tipo: 'viaje';
  asiento?: string;
}

// 🔹 Reservación de encomienda (tiene peso)
export interface ReservacionEncomienda extends ReservacionBase {
  tipo: 'encomienda';
  peso?: number;
}

// 🔹 Tipo flexible que puede representar cualquiera de las dos
export type ReservacionFormData = Partial<ReservacionViaje | ReservacionEncomienda>;

// ==========================================
// 🧩 Ejemplo de datos simulados (opcional)
// ==========================================
// Puedes usarlo si necesitas pruebas locales o seeds
export const EJEMPLOS_RESERVACIONES: ReservacionBase[] = [
  {
    id: 'R001',
    cliente: 'Juan Pérez',
    ruta: 'Tegucigalpa-San Pedro Sula',
    unidad: 'BUS-001',
    estado: 'confirmada',
    fecha: new Date(),
    tipo: 'viaje',
  },
  {
    id: 'R002',
    cliente: 'María Gómez',
    ruta: 'San Pedro Sula-Tegucigalpa',
    unidad: 'BUS-002',
    estado: 'pendiente',
    fecha: new Date(),
    tipo: 'encomienda',
  },
];
