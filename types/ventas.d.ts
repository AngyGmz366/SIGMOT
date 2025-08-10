// @/types/ventas.ts

// Representa un boleto de viaje vendido
// type/boleto.ts

// Representa un boleto de viaje vendido
interface Boleto {
    id: number | null;
    cliente: string;
    destino: string;
    fecha: string;
    precio: number | string;
    // Campos adicionales opcionales
    tipoVenta?: 'boleto' | 'encomienda';
    asiento?: string;
    autobus?: string;
    horaSalida?: string;
    horaLlegada?: string;
    telefono?: string;
    cedula?: string;
    estado?: 'vendido' | 'reservado' | 'cancelado';
    metodoPago?: 'efectivo' | 'tarjeta' | 'transferencia';
    descuento?: number;
    total?: number;
}

// Props para el modal de crear/editar boleto
interface BoletoDialogProps {
  visible: boolean;
  onHide: () => void;
  boleto: BoletoType;           // Aquí debes usar el tipo correcto de tu modelo 'boleto'
  setBoleto: React.Dispatch<React.SetStateAction<BoletoType>>;
  onSave: () => void;
  submitted: boolean;
}


export interface Encomienda {
    id: number | null;
    remitente: string;
    destinatario: string;
    origen: string;
    destino: string;
    fecha: string;
    descripcion: string;
    peso: number;
    precio: number | string;
    tipoVenta: 'encomienda';
    telefono?: string;
    cedulaRemitente?: string;
    cedulaDestinatario?: string;
    estado?: 'enviado' | 'en_transito' | 'entregado' | 'cancelado';
    metodoPago?: 'efectivo' | 'tarjeta' | 'transferencia';
    descuento?: number;
    total?: number;
}

export type VentaItem = Boleto | Encomienda;


interface BoletoDialogProps {
    visible: boolean;
    onHide: () => void;
    boleto: Boleto;
    setBoleto: (boleto: Boleto) => void;
    onSave: () => void;
    submitted?: boolean;
}


// export interface VentaItem {
//   id: number | null;
//    tipoVenta: 'boleto' | 'encomienda'; 
//   cliente?: string;
//   cedula?: string;
//   telefono?: string;
//   destino?: string;
//   fecha?: string;
//   precio?: number;
//   descuento?: number;
//   total?: number;
//   metodoPago?: string;
//   estado?: string;  // Puedes usar un enum para representar los estados
// }



/////////////////////////////77777

// types/ventas.ts

export interface ProductoVendido {
  productoId: number;
  codigo: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Venta {
  id: number | null;
  fecha: string; // ISO string
  cliente: string;
  documento?: string; // opcional, para el documento del cliente, que usas en el PDF
  montoPagado?: number;

  cobrada?: boolean;
  productos: ProductoVendido[];
  subtotal?: number;  // opcional, que usas en el PDF
  impuestos?: number; // opcional, que usas en el PDF
  total: number;
  estado: 'pendiente' | 'completada' | 'cancelada';
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia';
  observaciones?: string;
  montoRecibido?: number;
  cambio?: number;
  comprobante?: string;
}
