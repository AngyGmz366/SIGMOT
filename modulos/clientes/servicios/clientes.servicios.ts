import { http } from '@/lib/http';
import type { Cliente } from '@/types/persona';

/* =========================
   🔹 LISTAR CLIENTES
========================= */
export async function listarClientes(): Promise<Cliente[]> {
  const { data } = await http.get('/api/clientes');

  return (data.items ?? []).map((c: any) => ({
    id: c.id,                                // Id_Cliente_PK
    idPersona: c.id_persona,                 // Id_Persona_FK
    idEstadoCliente: c.id_estado_cliente,    // FK del catálogo
    estado: c.estado,                        // Texto del catálogo (ACTIVO/INACTIVO)
    persona: {
      Id_Persona: c.id_persona,
      Nombres: c.nombre || '—',
      Apellidos: '',
      DNI: '',
      Telefono: '',
      Fecha_Nacimiento: '',
      Genero: '',
      TipoPersona: 'Cliente',
      Correo: '',
      Departamento: '',
      Municipio: '',
    },
  })) as Cliente[];
}

/* =========================
   🔹 CREAR CLIENTE
========================= */
export async function crearCliente(payload: {
  idPersona: number;
  idEstadoCliente: number;
}) {
  const { data } = await http.post('/api/clientes', {
    Id_Persona_FK: payload.idPersona,
    Id_EstadoCliente_FK: payload.idEstadoCliente,
  });
  return data.result;
}

/* =========================
   🔹 ACTUALIZAR CLIENTE
========================= */
export async function actualizarCliente(
  id: number,
  payload: { idEstadoCliente: number }
) {
  const { data } = await http.put(`/api/clientes/${id}`, {
    Id_EstadoCliente_FK: payload.idEstadoCliente,
  });
  return data.result;
}

/* =========================
   🔹 ELIMINAR CLIENTE (soft delete)
========================= */
export async function eliminarCliente(id: number) {
  try {
    const { data } = await http.delete(`/api/clientes/${id}`);
    return data;
  } catch (err: any) {
    console.error('❌ Error eliminando cliente:', err?.response?.data || err.message);
    throw new Error(err?.response?.data?.error || 'Error al desactivar cliente');
  }
}

/* =========================
   🔹 BORRAR CLIENTE (wrapper)
========================= */
export async function borrarCliente(id: number): Promise<void> {
  try {
    await eliminarCliente(id);
  } catch (err: any) {
    console.error('❌ Error en borrarCliente:', err);
    throw new Error(err.message || 'Error al desactivar cliente');
  }
}
