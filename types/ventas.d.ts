// ----------------------
// 🧾 Venta base
// ----------------------
export type VentaItem = {
  id?: number | null;
  tipoVenta: 'boleto' | 'encomienda';
  fecha: string;
  precio: number;
  descuento: number;
  total: number;
  estado: string;
  metodoPago: string;

  // 🔗 Relaciones base
  Id_ClienteGeneral_FK?: number | null;
  Id_Cliente_FK?: number | null;
};

// ----------------------
// 🎟️ Boleto
// ----------------------
export type Boleto = VentaItem & {
  tipoVenta: 'boleto';

  // 🖥️ Datos visibles en UI
  cliente: string;
  cedula: string;
  telefono: string;
  origen: string;
  destino: string;
  asiento: string;
  autobus: string;
  horaSalida: string;
  horaLlegada: string;
  horario?: string | null;
  Numero_Asiento?: string;
  asiento?: string;
  numero_asiento?: string;
  precio?: number;
  total?: number;
  asiento?: string;
  estadoAsiento?: string;

  // 🧾 Compatibilidad con diferentes fuentes de ID
  id_boleto?: number | null;
  Id_Ticket_PK?: number | null;

  // 🔹 FKs
  Id_Cliente_FK?: number | null;
  Id_Viaje_FK?: number | null;
  Id_Asiento_FK?: number | null;
  Id_Unidad_FK?: number | null;
  Id_PuntoVenta_FK?: number | null;
  Id_MetodoPago_FK?: number | null;
  Id_EstadoTicket_FK?: number | null;
  Id_Empleado_FK?: number | null;

  // 🔹 Otros datos
  Codigo_Ticket?: string;
  fechaNacimiento?: string | null;
};

// ----------------------
// 📦 Encomienda
// ----------------------
export type Encomienda = VentaItem & {
  tipoVenta: 'encomienda';

  remitente: string;
  destinatario: string;
  origen: string;
  destino: string;
  descripcion: string;
  peso: number;
  telefono: string;
  cedulaRemitente: string;
  cedulaDestinatario: string;
  estado?: 'enviado' | 'entregado' | 'en_transito' | 'cancelado';

  // 🔹 Compatibilidad de ID
  id_encomienda?: number | null;
  Id_Encomiendas_PK?: number | null;

  // 🔗 FKs
  Id_Remitente_FK?: number | null;
  Id_Destinatario_FK?: number | null;
  Id_Origen_FK?: number | null;
  Id_Destino_FK?: number | null;
  Id_PuntoVenta_FK?: number | null;
  Id_MetodoPago_FK?: number | null;
  Id_EstadoEncomienda_FK?: number | null;

  Codigo_Encomienda?: string;
};

// ----------------------
// 🧾 Facturación
// ----------------------
export interface FacturaForm {
  subtotal: number; // 🔹 Nuevo: subtotal antes del descuento
  descuentoBase?: number;
  descuentoEdad?: number;
  descuentoTotal: number;
  isv: number;
  total: number;
  empleado?: number;
  metodoPago?: number;
  edadCliente?: number;
  tipoDescuento: number | null;
}

// ----------------------
// 🎟️ Tipos de descuento
// ----------------------
export type TipoDescuento = {
  id_Tipo_Descuento: number; // ID del descuento
  Nombre_Descuento: string;  // Nombre del descuento
  Descripcion: string;       // Descripción del descuento (si aplica)
  Porcentaje_Descuento: number; // Porcentaje del descuento
  Condicion_Aplica: string; // Condiciones del descuento (si aplica)
  monto?: number;           // Monto del descuento (si aplica)
};

export type TipoDescuentoSimple = {
  id: number;
  tipo: string;
  monto: number;
  Nombre_Descuento?: string;
  Porcentaje_Descuento?: number;
  id_Tipo_Descuento?: number;
};



// =======================================================
// 🔹 VIAJE (placeholder para historial futuro)
// =======================================================
export interface Viaje {
  id: number;
  idCliente: number;
  fecha: string;
  origen: string;
  destino: string;
  costo: number;
}

// =======================================================
// 🔹 PAGO (placeholder para historial futuro)
// =======================================================
export interface Pago {
  id: number;
  idCliente: number;
  fechaPago: string; // ISO string
  monto: number;
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia' | '';
}