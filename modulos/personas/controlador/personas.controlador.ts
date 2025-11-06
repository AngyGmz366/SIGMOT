import type { Persona } from '@/types/persona';
import * as servicios from '@/modulos/personas/servicios/personas.servicios';
import axios from 'axios';

/* ===============================
   🔹 CARGAR PERSONAS
================================ */
export async function cargarPersonas(tipoPersona?: number): Promise<Persona[]> {
  try {
    const personas = await servicios.listarPersonas(tipoPersona);

    return personas.map((p: any) => ({
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
      EstadoPersona: p.Estado_Persona || 1, // 👈 agrega el estado numérico
      Fecha_Nacimiento: p.Fecha_Nacimiento ?? '',
    }));
  } catch (err: any) {
    console.error('❌ Error en controlador cargarPersonas:', err);
    throw new Error(err.message || 'Error al cargar personas');
  }
}

/* ===============================
   🔹 GUARDAR / ACTUALIZAR PERSONA
================================ */

export async function guardarPersona(persona: Persona): Promise<Persona> {
  try {
    // 🔹 Mapear tipo de persona textual -> ID numérico
  

    // 🔹 Determinar el estado de la persona
    let estadoPersona: number;
    if (typeof persona.EstadoPersona === 'string') {
      const mapaEstados: Record<string, number> = { ACTIVA: 1, ELIMINADA: 2 };
      estadoPersona = mapaEstados[persona.EstadoPersona.toUpperCase()] ?? 1;
    } else if (typeof persona.EstadoPersona === 'number') {
      estadoPersona = persona.EstadoPersona;
    } else {
      estadoPersona = 1; // Por defecto ACTIVA
    }

    // ✅ 🔹 Normalizar la fecha para MySQL (YYYY-MM-DD)
    let fechaNormalizada = null;
    if (persona.Fecha_Nacimiento) {
      const fecha = new Date(persona.Fecha_Nacimiento);
      fechaNormalizada = fecha.toISOString().split('T')[0]; // ← esta línea corrige el error
    }

    // 🔹 Construcción del payload
// 🔹 Determinar tipo_persona correctamente (numérico o texto)
const tipoPersonaMap: Record<string, number> = {
  Cliente: 1,
  Empleado: 2,
};

const tipoPersonaFinal =
  typeof persona.TipoPersona === 'number'
    ? persona.TipoPersona
    : tipoPersonaMap[persona.TipoPersona as keyof typeof tipoPersonaMap] || 1;

// 🔹 Construcción del payload
const payload = {
  nombres: persona.Nombres?.trim() || null,
  apellidos: persona.Apellidos?.trim() || null,
  dni: persona.DNI?.trim() || null,
  telefono: persona.Telefono?.trim() || null,
  correo: persona.Correo?.trim() || '',
  genero_id: persona.Genero ? Number(persona.Genero) : null,
  fecha_nac: fechaNormalizada,
  departamento: persona.Departamento?.trim() || '',
  municipio: persona.Municipio?.trim() || '',
  tipo_persona: tipoPersonaFinal, // ✅ corregido
  id_usuario_admin: 1,
  estado_persona: estadoPersona, // 👈 numérico garantizado
};


    console.log('📤 Payload enviado al backend:', payload);

    if (persona.Id_Persona && persona.Id_Persona > 0) {
      await servicios.actualizarPersona(persona.Id_Persona, payload);
    } else {
      await servicios.crearPersona(payload);
    }

    return persona;
  } catch (err: any) {
    console.error('❌ Error en controlador guardarPersona:', err);
    throw new Error(err.message || 'Error al guardar persona');
  }
}


/* ===============================
   🔹 ELIMINAR PERSONA
================================ */
export async function eliminarPersona(idPersona: number, idUsuarioAdmin: number) {
  try {
    const { data } = await axios.delete(
      `/api/personas/${idPersona}?idUsuarioAdmin=${idUsuarioAdmin}`
    );
    if (data.error) throw new Error(data.error);
    return data.message;
  } catch (error: any) {
    console.error('❌ Error al eliminar persona:', error.response?.data || error.message);
    throw error;
  }
}
