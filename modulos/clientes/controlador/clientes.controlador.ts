import { listarClientes, crearCliente, actualizarCliente, eliminarCliente } from '../servicios/clientes.servicios';
import type { Cliente } from '@/types/persona';

export async function cargarClientes(): Promise<Cliente[]> {
  return await listarClientes();
}

export async function guardarCliente(cliente: Cliente) {
  if (cliente.id) {
    return await actualizarCliente(Number(cliente.id), Number(cliente.idPersona));
  } else {
    return await crearCliente(Number(cliente.idPersona));
  }
}

export async function borrarCliente(id: string) {
  return await eliminarCliente(Number(id));
}
