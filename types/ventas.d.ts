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
    precio: string | number;
    tipoVenta: 'encomienda';
    estado: 'enviado' | 'en_transito' | 'entregado' | 'cancelado';
    metodoPago: 'efectivo' | 'tarjeta' | 'transferencia';
    total: number;
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