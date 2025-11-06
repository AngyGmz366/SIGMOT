// ----------------------
// 🧾 Venta base
// ----------------------
export type VentaItem = {
  id: number | null;
  tipoVenta: 'boleto' | 'encomienda';
  fecha: string;
  precio: number;
  descuento: number;
  total: number;
  estado: string;
  metodoPago: string;

  // 🔗 Cliente genérico para ambos tipos
  Id_ClienteGeneral_FK?: number | null;
    Id_Cliente_FK?: number | null;           // ✅ agregado aquí

};

// ----------------------
// 🎟️ Boleto
// ----------------------
export type Boleto = VentaItem & {
  tipoVenta: 'boleto';

  // 🖥️ Textos visibles en UI
  cliente: string;
  cedula: string;
  telefono: string;
  origen: string;
  destino: string;
  asiento: string;
  asiento: string;
  autobus: string;
  horaSalida: string;
  horaLlegada: string;
  horario?: string | null;
  
  precio: number;

  // 🔹 Fecha nacimiento (para calcular edad/tercera edad)
  fechaNacimiento?: string | null;

  // 🔗 FKs (únicos que vamos a usar para persistencia)
  Id_Ticket_PK?: number | null;      // para compatibilidad con SP
  Id_Cliente_FK?: number | null;
  Id_Viaje_FK?: number | null;
  Id_Asiento_FK?: number | null;
  Id_Unidad_FK?: number | null;
  Id_PuntoVenta_FK?: number | null;
  Id_MetodoPago_FK?: number | null;
  Id_EstadoTicket_FK?: number | null;
  Codigo_Ticket?: string;
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

  // 🔗 FKs
  Id_Encomiendas_PK?: number | null;
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
// 📋 Catálogo genérico
// ----------------------
export type Opcion = {
  label: string;
  value: string | number;
  extra?: {
    precio?: number;
    horarios?: string[];
  };
};

// ----------------------
// 🧾 Facturación
// ----------------------
export type FacturaForm = {
  descuentoBase: number;
  descuentoEdad: number;
  descuentoTotal: number;
  isv: number;
  total: number;
  empleado: number;
  metodoPago: number;
  edadCliente: number;
  tipoDescuento: 'TERCERA_EDAD' | 'ESTUDIANTIL' | 'DISCAPACIDAD' | null; // ✅ agregado
};
