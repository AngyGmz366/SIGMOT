// ==========================================
// 📘 Tipos base de Reservaciones SIGMOT
// ==========================================

// 🔹 Reservación base (común para viajes y encomiendas)
export interface ReservacionBase {
  id?: string; // ID único de la reserva (PK)
  dni?: string; // Clave principal de la persona
  cliente?: string; // Nombre completo del cliente
  ruta?: string; // Ruta (Origen → Destino)
  unidad?: string; // Unidad (Placa / Marca)
  estado?: 'pendiente' | 'confirmada' | 'cancelada'; // Estado lógico
  fecha?: Date | string; // Fecha de la reserva
  tipo?: 'viaje' | 'encomienda'; // Tipo de reserva
  asiento_peso?: string; // Muestra "Asiento X" o "Costo L. N"
  id_viaje?: number | null;         // FK al viaje (solo si tipo = 'viaje')
  id_asiento?: number | null;       // FK al asiento (solo si tipo = 'viaje')
  id_encomienda?: number | null;    // FK a la encomienda (solo si tipo = 'encomienda')
  costo?: number | null;           // Costo monetario (solo si tipo = 'encomienda')
}

// 🔹 Reservación de viaje (tiene asiento)
export interface ReservacionViaje extends ReservacionBase {
  tipo: 'viaje';
  id_viaje?: number;   // Referencia al viaje
  id_asiento?: number; // ID del asiento seleccionado
  asiento?: string;    // Descripción del asiento
}

// 🔹 Reservación de encomienda (tiene costo)
export interface ReservacionEncomienda extends ReservacionBase {
  tipo: 'encomienda';
  id_encomienda?: number; // Referencia a la encomienda
  costo?: number;         // Costo monetario
}

// 🔹 Tipo flexible para formularios
export type ReservacionFormData = Partial<ReservacionViaje & ReservacionEncomienda>;

// ==========================================
// 🧩 Ejemplo de datos simulados (opcional)
// ==========================================
export const EJEMPLOS_RESERVACIONES: ReservacionBase[] = [
  {
    id: 'R001',
    dni: '0801199907777',
    cliente: 'Juan Pérez',
    ruta: 'Tegucigalpa - San Pedro Sula',
    unidad: 'BUS-001',
    estado: 'confirmada',
    fecha: new Date(),
    tipo: 'viaje',
    asiento_peso: 'Asiento 12',
  },
  {
    id: 'R002',
    dni: '080120202020',
    cliente: 'María Gómez',
    ruta: 'San Pedro Sula - Tegucigalpa',
    unidad: 'BUS-002',
    estado: 'pendiente',
    fecha: new Date(),
    tipo: 'encomienda',
    asiento_peso: 'Costo L. 350.00',
  },
];
