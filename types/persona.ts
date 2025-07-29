export interface Persona {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento?: string; // ISO string
  correo: string;
  telefono: string;
  idGenero: string;
  idTipoPersona: string;
  idDireccion: string;
  idUsuario?: string; // Opcional
}

export interface Cliente {
  id: string;
  idPersona: string;
  estado: boolean;
  fechaRegistro: string;
  fechaUltimaActualizacion: string;
  observaciones: string;
  historialViajes: string[]; // Puedes usar un objeto si lo deseas más detallado
  historialPagos: string[];  // Igual, podría ser más complejo luego
}
