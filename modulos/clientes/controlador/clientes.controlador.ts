// controlador/clientes.controlador.ts
import type { Cliente } from '@/types/persona';
import * as servicios from '@/modulos/clientes/servicios/clientes.servicios';

/* =========================
   🔹 Cargar clientes
========================= */
export async function cargarClientes(): Promise<Cliente[]> {
  try {
    const data = await servicios.listarClientes();
    return data;
  } catch (err: any) {
    console.error('❌ Error en cargarClientes:', err);
    throw new Error(err.message || 'Error al listar clientes');
  }
}

/* =========================
   🔹 Guardar cliente
========================= */
export async function guardarCliente(cliente: Cliente): Promise<void> {
  try {
    if (cliente.id && Number(cliente.id) > 0) {
      await servicios.actualizarCliente(Number(cliente.id), {
        estado: cliente.estado,
      });
    } else {
      await servicios.crearCliente({
        idPersona: Number(cliente.idPersona),
        estado: cliente.estado,
      });
    }
  } catch (err: any) {
    console.error('❌ Error en guardarCliente:', err);
    throw new Error(err.message || 'Error al guardar cliente');
  }
}
/* =========================
   🔹 BORRAR CLIENTE (soft delete)
========================= */
export async function borrarCliente(id: number): Promise<void> {
  try {
    await servicios.eliminarCliente(id);
  } catch (err: any) {
    console.error('❌ Error en borrarCliente:', err);
    throw new Error(err.message || 'Error al desactivar cliente');
  }
}