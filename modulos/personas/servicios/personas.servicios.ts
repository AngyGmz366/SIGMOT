import axios from 'axios';
import api from '@/lib/axios';

const API = '/api/personas';












/* ================================
   🔹 LISTAR PERSONAS
   Soporta tipoPersona y estado
================================ */
export async function listarPersonas(tipoPersona?: number, estado?: string) {
  // ✅ Construye la URL con ambos parámetros dinámicamente
  const url = `${API}?${[
    tipoPersona ? `tipoPersona=${tipoPersona}` : '',
    estado ? `estado=${estado}` : '',
  ]
    .filter(Boolean)
    .join('&')}`;

  try {
    const { data } = await axios.get(url);

    if (data.error) throw new Error(data.error);
    const raw = data.items || [];

    // 🔹 Normalizamos la estructura
    return raw.map((p: any, i: number) => ({
      Id_Persona_PK: p.Id_Persona ?? i,
      Nombres: p.Nombres ?? '',
      Apellidos: p.Apellidos ?? '',
      DNI: p.DNI ?? '',
      Telefono: p.Telefono ?? '',
      Correo_Electronico: p.Correo ?? '',
      Departamento: p.Departamento ?? '',
      Municipio: p.Municipio ?? '',
      Genero: p.Genero ?? 'N/A',
      TipoPersona: p.TipoPersona ?? 'N/A',
      Rol_Sistema: p.Rol_Sistema ?? 'Sin usuario',
      Estado_Usuario: p.Estado_Usuario ?? 'N/A',
      Estado_Persona: p.Estado_Persona ?? 1,
      Fecha_Nacimiento: p.Fecha_Nacimiento ?? '',
    }));
  } catch (err: any) {
    console.error('❌ Error al listar personas:', err);
    throw new Error(err?.response?.data?.error || 'Error al listar personas');
  }
}

/* ================================
   🔹 CREAR
================================ */
export async function crearPersona(payload: any) {
  try {
    console.log('📦 Payload recibido por servicio crearPersona:', payload);

    // ✅ Asegurar que estado_persona sea ID numérico
    let estadoPersona = payload.estado_persona;
    if (typeof estadoPersona === 'string') {
      const mapaEstados: Record<string, number> = { ACTIVA: 1, ELIMINADA: 2 };
      estadoPersona = mapaEstados[estadoPersona.toUpperCase()] ?? 1;
    }
    payload.estado_persona = estadoPersona;

    // ✅ Llamada al backend
    const { data } = await axios.post(API, payload);

    if (data.error) throw new Error(data.error);
    return data.message || 'Persona creada correctamente';
  } catch (err: any) {
    const detalle = err?.response?.data || err?.message || 'Error desconocido';
    console.error('❌ Error creando persona (detalle):', detalle);
    throw new Error(detalle?.error || detalle?.message || 'Error al crear persona');
  }
}

/* ================================
   🔹 OBTENER
================================ */
export async function obtenerPersona(id: number) {
  try {
    const { data } = await axios.get(`${API}/${id}`);
    if (data.error) throw new Error(data.error);
    return data.item;
  } catch (err: any) {
    console.error('❌ Error obteniendo persona:', err);
    throw new Error(err?.response?.data?.error || 'Error al obtener persona');
  }
}

/* ================================
   🔹 ACTUALIZAR
================================ */
export async function actualizarPersona(id: number, payload: any) {
  try {
    console.log('📦 Payload recibido por servicio actualizarPersona:', payload);

    // ✅ Asegurar que estado_persona sea ID numérico
    let estadoPersona = payload.estado_persona;
    if (typeof estadoPersona === 'string') {
      const mapaEstados: Record<string, number> = { ACTIVA: 1, ELIMINADA: 2 };
      estadoPersona = mapaEstados[estadoPersona.toUpperCase()] ?? 1;
    }
    payload.estado_persona = estadoPersona;

    // ✅ Llamada al backend
    const { data } = await axios.put(`${API}/${id}`, payload);

    if (data.error) throw new Error(data.error);
    return data.message || 'Persona actualizada correctamente';
  } catch (err: any) {
    console.error('❌ Error actualizando persona:', err);

    if (err.response) {
      console.error('Detalles del error de la respuesta:', err.response?.data);
      throw new Error(err.response.data?.error || 'Error al actualizar persona');
    }

    throw new Error(err.message || 'Error desconocido al actualizar persona');
  }
}

/* ================================
   🔹 ELIMINAR INDIVIDUAL
================================ */
export async function eliminarPersona(idPersona: number, idUsuarioAdmin: number) {
  try {
    const { data } = await axios.delete(
      `${API}/${idPersona}?idUsuarioAdmin=${idUsuarioAdmin}`
    );
    if (data.error) throw new Error(data.error);
    return data.message;
  } catch (err: any) {
    console.error('❌ Error eliminando persona:', err.response?.data || err.message);
    throw new Error(err?.response?.data?.error || 'Error al eliminar persona');
  }
}

/* ================================
   🔹 ELIMINAR MÚLTIPLES
================================ */
export async function eliminarPersonas(ids: number[], idUsuarioAdmin: number) {
  try {
    const { data } = await axios.post(`${API}/eliminar-multiples`, {
      ids,
      idUsuarioAdmin,
    });
    if (data.error) throw new Error(data.error);
    return data.message || 'Personas eliminadas correctamente';
  } catch (err: any) {
    console.error('❌ Error eliminando múltiples personas:', err.response?.data || err.message);
    throw new Error(err?.response?.data?.error || 'Error al eliminar múltiples personas');
  }
}
