// 📁 /types/persona.ts


export interface Persona {
  Id_Persona: number;
  Nombres: string;
  Apellidos: string;
  DNI: string;
  Telefono: string;
  Fecha_Nacimiento: string;
  Genero: string | number;        // Descripción (e.g., "Masculino")
  TipoPersona: string | number; // Descripción (e.g., "Cliente")
  Correo: string;
  Departamento: string;
  Municipio: string;
  Rol_Sistema?: string;
  Estado_Usuario?: string;
  EstadoPersona?: string | number; // 

  
}

/* =======================================
   🔹 CLIENTE (tabla TBL_CLIENTES)
======================================= */
export interface Cliente {
  id: number;                  // Id_Cliente_PK
  idPersona: number;           // Id_Persona_FK
  idEstadoCliente: number;     // Id_EstadoCliente_FK (FK al catálogo)
  estado: string;              // e.Estado_Cliente → "ACTIVO" | "INACTIVO"
  persona?: Persona;           // Datos de persona vinculada
}



// /* =======================================
//    🔹 EMPLEADO (tabla TBL_EMPLEADOS)
// ======================================= */
export interface Empleado {
   id: number;                // Id_Empleado_PK
   idPersona: number;         // Id_Persona_FK
   codigoEmpleado: string;    // Código interno (ej. "EMP-000001")
  cargo: string;             // Cargo del empleado
   fechaContratacion: string; // Fecha de ingreso
   estado?: string;           // Opcional (ACTIVO/INACTIVO)
  persona?: Persona;         // Datos de la persona vinculada
 }



