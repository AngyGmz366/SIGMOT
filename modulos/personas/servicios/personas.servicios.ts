import axios from 'axios';
import api from '@/lib/axios';


const API = '/api/personas';

/* ================================
   🔹 LISTAR
================================ */
export async function listarPersonas(tipoPersona?: number) {
  const url = `${API}${tipoPersona ? `?tipoPersona=${tipoPersona}` : ''}`;

  try {
    const { data } = await axios.get(url);

    if (data.error) throw new Error(data.error);

    const raw = data.items || [];

    // 🔹 Normalizar los campos con base en los alias del SP
    return raw.map((p: any, i: number) => ({
      Id_Persona_PK: p.Id_Persona ?? i,
      Nombres: p.Nombres ?? '',
      Apellidos: p.Apellidos ?? '',
      DNI: p.DNI ?? '',
      Telefono: p.Telefono ?? '',
      Correo_Electronico: p.Correo ?? '',
      Departamento: p.Departamento ?? '',
      Municipio: p.Municipio ?? '',
      Genero: p.Genero ?? 'N/A',              // ← descripción del género
      TipoPersona: p.TipoPersona ?? 'N/A',    // ← descripción del tipo persona
      Rol_Sistema: p.Rol_Sistema ?? 'Sin usuario',
      Estado_Usuario: p.Estado_Usuario ?? 'N/A',
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
    const { data } = await axios.post('/api/personas', payload);

    if (data.error) throw new Error(data.error);
    return data.message || 'Persona creada correctamente';
  } catch (err: any) {
    const detalle = err?.response?.data || err?.message || 'Error desconocido';
    console.error('❌ Error creando persona (detalle):', detalle);
    throw new Error(
      detalle?.error || detalle?.message || 'Error al crear persona'
    );
  }
}


/* ================================
   🔹 OBTENER
================================ */
export async function obtenerPersona(id: number) {
  const { data } = await axios.get(`${API}/${id}`);
  if (data.error) throw new Error(data.error);
  return data.item;
}

/* ================================
   🔹 ACTUALIZAR
================================ */
export async function actualizarPersona(id: number, payload: any) {
  try {
    const { data } = await axios.put(`${API}/${id}`, payload);
    if (data.error) throw new Error(data.error);
    return data.message || 'Persona actualizada correctamente';
  } catch (err: any) {
    console.error('❌ Error actualizando persona:', err.response?.data || err.message);
    throw new Error(err?.response?.data?.error || 'Error al actualizar persona');
  }
}

/* ================================
   🔹 ELIMINAR
================================ */

/* ================================
   🔹 ELIMINAR INDIVIDUAL
================================ */
export async function eliminarPersona(idPersona: number, idUsuarioAdmin: number) {
  try {
    const { data } = await axios.delete(
      `/api/personas/${idPersona}?idUsuarioAdmin=${idUsuarioAdmin}`
    );
    return data;
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
    const { data } = await axios.post('/api/personas/eliminar-multiples', {
      ids,
      idUsuarioAdmin,
    });
    return data;
  } catch (err: any) {
    console.error('❌ Error eliminando múltiples personas:', err.response?.data || err.message);
    throw new Error(err?.response?.data?.error || 'Error al eliminar múltiples personas');
  }
}
