// types/ventas.ts
export interface VentaItem {
    id: number | null;
    tipoVenta?: 'boleto' | 'encomienda';
    estado?: string;
    metodoPago?: string;
    precio: number | string;
    descuento?: number;
    total?: number;
    fecha?: string;
    destino?: string;
    [key: string]: any; // Para propiedades adicionales específicas de cada tipo
}

export interface Boleto extends VentaItem {
    cliente: string;
    cedula?: string;
    telefono?: string;
    destino: string;
    autobus?: string;
    asiento?: string;
    horaSalida?: string;
    horaLlegada?: string;
    tipoVenta?: 'boleto';
}

export interface Encomienda extends VentaItem {
    remitente: string;
    destinatario: string;
    origen: string;
    cedulaRemitente?: string;
    cedulaDestinatario?: string;
    descripcion: string;
    peso: number;
    tipoVenta?: 'encomienda';
}

export interface BoletoDialogProps {
    visible: boolean;
    onHide: () => void;
    boleto: Boleto;
    setBoleto: React.Dispatch<React.SetStateAction<Boleto>>;
    onSave: () => void;
    submitted?: boolean;
}

export interface EncomiendaDialogProps {
    visible: boolean;
    onHide: () => void;
    encomienda: Encomienda;
    setEncomienda: React.Dispatch<React.SetStateAction<Encomienda>>;
    onSave: () => void;
    submitted?: boolean;
}

export interface ImprimirModalProps {
    visible: boolean;
    onHide: () => void;
    item: VentaItem | null;
    onConfirm: () => void;
}