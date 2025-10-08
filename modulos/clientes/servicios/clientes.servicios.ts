import { http } from '@/lib/http';
import type { Cliente } from '@/types/persona';

export async function listarClientes() {
  const { data } = await http.get('/api/clientes');
  return data.items?.map((c: any) => ({
    id: c.Id_Cliente_PK,
    idPersona: c.Id_Persona_FK,
    nombre: `${c.Nombres} ${c.Apellidos}`,
    dni: c.DNI,
  })) as Cliente[];
}

export async function crearCliente(idPersona: number) {
  const { data } = await http.post('/api/clientes', { Id_Persona_FK: idPersona });
  return data.result;
}

export async function actualizarCliente(id: number, idPersona: number) {
  const { data } = await http.put(`/api/clientes/${id}`, { Id_Persona_FK: idPersona });
  return data.result;
}

export async function eliminarCliente(id: number) {
  const { data } = await http.delete(`/api/clientes/${id}`);
  return data;
}
