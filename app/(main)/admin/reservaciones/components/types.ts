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
  asiento_peso?: string; // 🆕 usado en la vista VW_ADMIN_RESERVAS para mostrar asiento o costo
}

// 🔹 Reservación de viaje (tiene asiento)
export interface ReservacionViaje extends ReservacionBase {
  tipo: 'viaje';
  id_viaje?: number;   // 🆕 referencia al viaje
  id_asiento?: number; // 🆕 id del asiento seleccionado
  asiento?: string;
}

// 🔹 Reservación de encomienda (tiene costo)
export interface ReservacionEncomienda extends ReservacionBase {
  tipo: 'encomienda';
  id_encomienda?: number; // 🆕 referencia al envío
  costo?: number;         // ✅ reemplaza peso → costo
}

// 🔹 Tipo flexible que puede representar cualquiera de las dos
export type ReservacionFormData = Partial<ReservacionViaje | ReservacionEncomienda>;

// ==========================================
// 🧩 Ejemplo de datos simulados (opcional)
// ==========================================
export const EJEMPLOS_RESERVACIONES: ReservacionBase[] = [
  {
    id: 'R001',
    cliente: 'Juan Pérez',
    ruta: 'Tegucigalpa - San Pedro Sula',
    unidad: 'BUS-001',
    estado: 'confirmada',
    fecha: new Date(),
    tipo: 'viaje',
    asiento_peso: 'Asiento 12', // 🆕
  },
  {
    id: 'R002',
    cliente: 'María Gómez',
    ruta: 'San Pedro Sula - Tegucigalpa',
    unidad: 'BUS-002',
    estado: 'pendiente',
    fecha: new Date(),
    tipo: 'encomienda',
    asiento_peso: 'Costo L. 350.00', // 🆕
  },
];
