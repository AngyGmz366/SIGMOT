import { http } from '@/lib/http';
import type { Cliente } from '@/types/persona';

/* =========================
   🔹 LISTAR CLIENTES
========================= */
export async function listarClientes() {
  const { data } = await http.get('/api/clientes');

  return data.items.map((c: any) => ({
    id: c.id,                          // coincide con JSON
    idPersona: c.id_persona,           // coincide con JSON
    estado: c.Estado,                  // coincide con JSON
    nombreCompleto: c.nombre || '—',   // nuevo campo para mostrar en tabla
  })) as Cliente[];
}

/* =========================
   🔹 CREAR CLIENTE
========================= */
export async function crearCliente(payload: { idPersona: number; estado: string }) {
  const { data } = await http.post('/api/clientes', {
    Id_Persona_FK: payload.idPersona,
    Estado: payload.estado,
  });
  return data.result;
}

/* =========================
   🔹 ACTUALIZAR CLIENTE
========================= */
export async function actualizarCliente(id: number, payload: { estado: string }) {
  const { data } = await http.put(`/api/clientes/${id}`, {
    Estado: payload.estado,
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
   🔹 BORRAR CLIENTE (llama al servicio)
========================= */
export async function borrarCliente(id: number): Promise<void> {
  try {
    await eliminarCliente(id);
  } catch (err: any) {
    console.error('❌ Error en borrarCliente:', err);
    throw new Error(err.message || 'Error al desactivar cliente');
  }
}


