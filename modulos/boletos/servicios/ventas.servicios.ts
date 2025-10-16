 // app/modulos/boletos/servicios/ventas.servicios.ts
import { http } from '@/lib/http';
import type { Boleto } from '@/types/ventas';


import axios from "axios";


/** Fila tal como viene de tu API */
type TicketRow = {
  Id_Ticket_PK: number;
  Codigo_Ticket?: string;
  Fecha_Hora_Compra?: string;
  Precio_Total?: number;
  Cliente?: string;
  Origen?: string; 
  Destino?: string;
  Asiento?: string;
  Autobus?: string;
  Hora_Salida?: string;
  Hora_Llegada?: string;
  Telefono?: string;
  DNI?: string;
  Estado?: string;
  Metodo?: string;
  Id_Cliente_FK?: number;
  Id_Viaje_FK?: number;
  Id_PuntoVenta_FK?: number;
  Id_MetodoPago_FK?: number;
  Id_EstadoTicket_FK?: number;
};

function toNumber(n: unknown, def = 0) {
  const v = Number(n);
  return Number.isFinite(v) ? v : def;
}

export type Opcion = {
  label: string;
  value: string | number;
};

/** Mapea la fila de ticket a tu tipo de UI `Boleto` */
export function mapTicketToBoleto(r: TicketRow): Boleto {
  return {
    id: r.Id_Ticket_PK,
    cliente: r.Cliente ?? '',
    origen: r.Origen || "",  

    destino: r.Destino ?? '',
    fecha: (r.Fecha_Hora_Compra ?? '').slice(0, 10),
    precio: toNumber(r.Precio_Total, 0),
    tipoVenta: 'boleto',
    asiento: r.Asiento ?? '',
    autobus: r.Autobus ?? '',
    horaSalida: r.Hora_Salida ?? '',
    horaLlegada: r.Hora_Llegada ?? '',
    telefono: r.Telefono ?? '',
    cedula: r.DNI ?? '',
    estado: (r.Estado as any) ?? 'vendido',
    metodoPago: (r.Metodo as any) ?? 'efectivo',
    descuento: 0,
    total: toNumber(r.Precio_Total, 0),
    
    Id_Cliente_FK: r.Id_Cliente_FK ?? null,
    Id_Viaje_FK: r.Id_Viaje_FK ?? null,
    Id_PuntoVenta_FK: r.Id_PuntoVenta_FK ?? 1,
    Id_MetodoPago_FK: r.Id_MetodoPago_FK ?? null,
    Id_EstadoTicket_FK: r.Id_EstadoTicket_FK ?? null,

    Codigo_Ticket: r.Codigo_Ticket,
  } as Boleto;
}

// ==================== CATALOGOS ====================

// CLIENTES

let clientesCache: Opcion[] | null = null;

export async function getClientes(): Promise<Opcion[]> {
  // ⚡ Si ya están en memoria, retornarlos al instante
  if (clientesCache && clientesCache.length > 0) {
    return clientesCache;
  }

  // 🔹 Si no, consultar la API
  const { data } = await http.get('/api/clientes');
  const items = (data?.items ?? []) as Array<{ id: number; nombre: string }>;

  // 🔹 Mapear al formato de opciones
  const clientes = items.map(c => ({
    value: c.id,
    label: c.nombre,
  }));

  // ⚡ Guardar en memoria para próximas llamadas
  clientesCache = clientes;

  return clientes;
}

// VIAJES (dropdown "Destino")
export async function getViajes(): Promise<Opcion[]> {
  const { data } = await http.get('/api/rutas-activas');
  const items = (data?.items ?? []) as Array<{
    id: number;
    label: string;
    value: number;
  }>;

  return items.map(v => ({
    value: v.id,
    label: v.label
  }));
}



// UNIDADES
export async function getUnidadesPorRuta(idRuta: number): Promise<Opcion[]> {
  try {
    const { data } = await axios.get(`/api/unidades-por-ruta/${idRuta}`);
    const items = data?.items ?? [];

    return items.map((u: any) => ({
      value: u.idUnidad,
      label: `${u.unidad} (${u.fecha} - ${u.horaSalida})`,
    }));
  } catch (err) {
    console.error('❌ Error obteniendo unidades por ruta:', err);
    return [];
  }
}


// ASIENTOS
export async function getAsientos(unidadId: number | string): Promise<Opcion[]> {
  const { data } = await http.get(`/api/asientos?unidadId=${unidadId}`);
  const grupo = (data?.items ?? []).find((g: any) => g.unidad == Number(unidadId));
  const rows: any[] = grupo?.asientos ?? [];

  return rows.map(a => ({
    label: `Asiento ${a.numero}`,
    value: a.id,
    disabled: a.id_estado_asiento !== 1, // solo habilitar disponibles
  }));
}

// MÉTODOS DE PAGO
export async function getMetodosPago(): Promise<Opcion[]> {
  const { data } = await http.get('/api/metodo.pago');
  const items = (data?.items ?? []) as Array<{ id: number; metodo: string }>;
  return items.map(m => ({ value: m.id, label: m.metodo }));
}

// ESTADOS DE TICKET
export async function getEstadosTicket(): Promise<Opcion[]> {
  const { data } = await http.get('/api/estado.ticket');
  const items = (data?.items ?? []) as Array<{ id: number; estado: string }>;
  return items.map(e => ({ value: e.id, label: e.estado }));
}

// PUNTOS DE VENTA
export async function getPuntosVenta(): Promise<Opcion[]> {
  const { data } = await http.get('/api/punto.venta');
  const items = (data?.items ?? []) as Array<{ id: number; nombre: string; ubicacion?: string }>;
  return items.map(p => ({ value: p.id, label: `${p.nombre} ${p.ubicacion ? `(${p.ubicacion})` : ''}` }));
}

// ==================== TICKETS (BOLETOS) ====================



export async function listarBoletos() {
  try {
    const res = await axios.get("/api/boletos");
    const items = res?.data?.items ?? [];

    //console.log("🧾 Datos crudos de /api/boletos:", items[0]); // 👈 puedes quitarlo después

return items.map((t: any) => ({
  id: t.Id_Ticket_PK,
  tipoVenta: "boleto",
  cliente: t.Cliente || "",
  origen: t.Origen || t.origen || "",     // ✅ muestra correctamente
  destino: t.Destino || t.destino || "",  // ✅ igual
  fecha: t.Fecha_Hora_Compra
    ? new Date(t.Fecha_Hora_Compra).toISOString().slice(0, 10)
    : "",
  precio: Number(t.Precio_Total ?? 0),
  estado: t.Estado || "",
  metodoPago: t.MetodoPago || "",
  total: Number(t.Precio_Total ?? 0),
  Id_Cliente_FK: t.Id_Cliente_FK ?? null,
  Id_Viaje_FK: t.Id_Viaje_FK ?? null,
  Id_PuntoVenta_FK: t.Id_PuntoVenta_FK ?? 1,
  Id_MetodoPago_FK: t.Id_MetodoPago_FK ?? null,
  Id_EstadoTicket_FK: t.Id_EstadoTicket_FK ?? null,
}));


  } catch (err: any) {
    console.error("❌ listarBoletos falló:", err?.response?.data || err);
    throw err;
  }
}




// Helper para calcular el total con descuento
function calcularTotal(precio?: number, descuento?: number) {
  const p = Number(precio) || 0;
  const d = Number(descuento) || 0;
  return Math.max(0, p - d);
}


// Crear
function generarCodigoTicketLocal() {
  return `T-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

export async function crearBoleto(b: Partial<Boleto>) {
  if (!b.Id_Viaje_FK) throw new Error("Viaje es obligatorio");
  if (!b.Id_Cliente_FK) throw new Error("Cliente es obligatorio");
  if (!b.Id_MetodoPago_FK) throw new Error("Método de pago es obligatorio");

 const payload: any = {
  // 2) Fecha: si no viene, usar la actual
  Fecha_Hora_Compra: b.fecha
    ? `${b.fecha} 00:00:00`
    : new Date().toISOString().slice(0, 19).replace("T", " "),

  // 3) Precio_Total: calcular en lugar de poner 0
  Precio_Total: calcularTotal(b.precio, b.descuento),

  Id_Viaje_FK: b.Id_Viaje_FK,
  Id_Cliente_FK: b.Id_Cliente_FK,
  Id_PuntoVenta_FK: b.Id_PuntoVenta_FK ?? 1,
  Id_MetodoPago_FK: b.Id_MetodoPago_FK,

  // 4) Estado por defecto si no viene
  Id_EstadoTicket_FK: b.Id_EstadoTicket_FK ?? 1,
};


  if (process.env.REQUIERE_CODIGO_TICKET) {
    payload.Codigo_Ticket = generarCodigoTicketLocal();
  }

  const { data } = await http.post('/api/boletos', payload);
  return data?.result as { Id_Ticket_PK: number; Codigo_Ticket: string };
}


// Actualizar
export async function actualizarBoleto(id: number, b: Partial<Boleto>) {
  const payload = {
    Fecha_Hora_Compra: b.fecha ? `${b.fecha} 00:00:00` : null,
    Precio_Total: b.precio != null ? toNumber(b.precio, 0) : null,
    Id_Viaje_FK: b.Id_Viaje_FK ?? null,
    Id_Cliente_FK: b.Id_Cliente_FK ?? null,
    Id_PuntoVenta_FK: b.Id_PuntoVenta_FK ?? null,
    Id_MetodoPago_FK: b.Id_MetodoPago_FK ?? null,
    Id_EstadoTicket_FK: b.Id_EstadoTicket_FK ?? null,
  };
  await http.put(`/api/boletos/${id}`, payload);
}

// Eliminar
export async function eliminarBoleto(id: number) {
  const res = await http.delete(`/api/boletos/${id}`);
  if (res.status !== 200) throw new Error(res.data?.error || 'Error eliminando boleto');
  return res.data;
}


// ==================== Helper ====================

export async function getCatalogos() {
  const [clientes, viajes, unidades, metodos, estados, puntos] = await Promise.all([
    getClientes(),
    getViajes(),
    getUnidadesPorRuta(1),
    getMetodosPago(),
    getEstadosTicket(),
    getPuntosVenta(),
  ]);

  return { clientes, viajes, unidades, metodos, estados, puntos };
}
