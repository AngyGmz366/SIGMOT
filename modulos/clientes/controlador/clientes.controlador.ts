import type { Cliente } from '@/types/persona';
import type { Pago, Viaje } from '@/types/ventas';
import * as servicios from '@/modulos/clientes/servicios/clientes.servicios';

/* =========================
   🔹 Cargar clientes
========================= */
export async function cargarClientes(): Promise<Cliente[]> {
  try {
    const clientes = await servicios.listarClientes();
    return clientes ?? [];
  } catch (err: any) {
    console.error('❌ Error en cargarClientes:', err);
    throw new Error(err?.message || 'Error al listar clientes');
  }
}

/* =========================
   🔹 Guardar cliente (crear o actualizar)
========================= */
export async function guardarCliente(cliente: Cliente): Promise<void> {
  try {
    // Validación mínima
    if (!cliente.idPersona) {
      throw new Error('El cliente debe tener una persona asociada');
    }

    if (cliente.id && Number(cliente.id) > 0) {
      // ✅ Actualizar cliente existente
      await servicios.actualizarCliente(Number(cliente.id), {
        idEstadoCliente: cliente.idEstadoCliente,
      });
    } else {
      // ✅ Crear nuevo cliente
      await servicios.crearCliente({
        idPersona: Number(cliente.idPersona),
        idEstadoCliente: cliente.idEstadoCliente,
      });
    }
  } catch (err: any) {
    console.error('❌ Error en guardarCliente:', err);
    throw new Error(err?.message || 'Error al guardar cliente');
  }
}

/* =========================
   🔹 Desactivar cliente (soft delete)
========================= */
export async function borrarCliente(id: number): Promise<void> {
  try {
    if (!id) throw new Error('ID de cliente no válido');
    await servicios.eliminarCliente(id);
  } catch (err: any) {
    console.error('❌ Error en borrarCliente:', err);
    throw new Error(err?.message || 'Error al desactivar cliente');
  }
}


/* =========================
   🔹 Controlador para cargar historial completo
========================= */
export async function cargarHistorialCliente(idCliente: number) {
  try {
    const historial = await servicios.obtenerHistorialCliente(idCliente);
    return historial; // { pagos, viajes }
  } catch (err: any) {
    console.error('❌ Error en cargarHistorialCliente:', err);
    throw new Error(err?.message || 'No se pudo cargar el historial del cliente');
  }
}