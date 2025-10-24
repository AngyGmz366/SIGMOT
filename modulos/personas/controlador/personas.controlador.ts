// persona.controlador.ts
// -------------------------------------------------------------
// Controlador de Personas: lógica de negocio y persistencia
// -------------------------------------------------------------

import type { Persona } from '@/types/persona';
import * as servicios from '@/modulos/personas/servicios/personas.servicios';
import axios from 'axios';


/** Carga todas las personas, opcionalmente filtrando por tipo */
export async function cargarPersonas(tipoPersona?: number): Promise<Persona[]> {
  try {
    const personas = await servicios.listarPersonas(tipoPersona);
    return personas.map((p: {
      Id_Persona_PK: number;
      Nombres: string;
      Apellidos: string;
      DNI: string;
      Telefono: string;
      Correo_Electronico: string;
      Departamento: string;
      Municipio: string;
      Genero: string;
      TipoPersona: string;
      Rol_Sistema?: string;
      Estado_Usuario?: string;
      Fecha_Nacimiento?: string;
    }) => ({
      Id_Persona: p.Id_Persona_PK,
      Nombres: p.Nombres,
      Apellidos: p.Apellidos,
      DNI: p.DNI,
      Telefono: p.Telefono,
      Correo: p.Correo_Electronico,
      Departamento: p.Departamento,
      Municipio: p.Municipio,
      Genero: p.Genero,
      TipoPersona: p.TipoPersona,
      Rol_Sistema: p.Rol_Sistema ?? 'Sin usuario',
      Estado_Usuario: p.Estado_Usuario ?? 'N/A',
      Fecha_Nacimiento: p.Fecha_Nacimiento ?? '',
    }));
  } catch (err: any) {
    console.error('❌ Error en controlador cargarPersonas:', err);
    throw new Error(err.message || 'Error al cargar personas');
  }
}


/** Guardar o actualizar persona */
export async function guardarPersona(persona: Persona): Promise<Persona> {
  try {
    // 🔹 Mapear tipo de persona textual -> ID numérico
    const tipoPersonaMap: Record<string, number> = {
      Cliente: 1,
      Empleado: 2,
    };

    const payload = {
      nombres: persona.Nombres?.trim() || null,
      apellidos: persona.Apellidos?.trim() || null,
      dni: persona.DNI?.trim() || null,
      telefono: persona.Telefono?.trim() || null,
      // 🔹 correo: nunca null, envía cadena vacía si falta
      correo: persona.Correo?.trim() || '', 
      genero_id: persona.Genero ? Number(persona.Genero) : null, // 🔢 numérico (1–4)
      fecha_nac: persona.Fecha_Nacimiento || null,
      departamento: persona.Departamento?.trim() || '',
      municipio: persona.Municipio?.trim() || '',
      tipo_persona: tipoPersonaMap[persona.TipoPersona] || 1, // 🔢 valor numérico
      id_usuario_admin: 1,
    };

    console.log('📤 Payload enviado al backend:', payload);

    if (persona.Id_Persona && persona.Id_Persona > 0) {
      await servicios.actualizarPersona(persona.Id_Persona, payload);
    } else {
        if (!payload.genero_id) {
  console.error('🚨 GENERO VACÍO:', persona.Genero, payload);
}

      await servicios.crearPersona(payload);
    }

    return persona;
  } catch (err: any) {
    console.error('❌ Error en controlador guardarPersona:', err);
    throw new Error(err.message || 'Error al guardar persona');
  }
}

export async function eliminarPersona(idPersona: number, idUsuarioAdmin: number) {
  try {
    const { data } = await axios.delete(`/api/personas/${idPersona}?idUsuarioAdmin=${idUsuarioAdmin}`);
    if (data.error) throw new Error(data.error);
    return data.message;
  } catch (error: any) {
    console.error("❌ Error al eliminar persona:", error.response?.data || error.message);
    throw error;
  }
}
