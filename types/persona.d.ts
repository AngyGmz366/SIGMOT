export interface Persona {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  correo: string;
  telefono: string;
  idGenero: string;
  idTipoPersona: string;
  idDireccion: string;
  idUsuario: string;
}

export interface Cliente {
  id: string;
  idPersona: string;
  estado: string;
  persona?: Persona; // ← opcional, para evitar errores en tiempo de ejecución
}



export interface Pago {
  id: string;
  idCliente: string;
  fechaPago: string; // ISO date string, ej. '2025-08-02'
  monto: number;
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia' | '';
}

export interface Viaje {
  id: string;
  idCliente: string;
  fecha: string; // O Date, si usas objetos de fecha
  origen: string;
  destino: string;
  costo: number;
}
