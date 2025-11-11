import { http } from '@/lib/http';
import axios from 'axios';
import type { Boleto } from '@/types/ventas';

/* ===================== Tipos ===================== */
export type Opcion = {
  label: string;
  value: string | number;
  extra?: {                     // ✅ debe estar exactamente así
    precio?: number;
    horarios?: string[];
  };
};



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

/* ===================== Helpers ===================== */
function toNumber(n: unknown, def = 0) {
  const v = Number(n);
  return Number.isFinite(v) ? v : def;
}

function calcularTotal(precio?: number, descuento?: number) {
  const p = Number(precio) || 0;
  const d = Number(descuento) || 0;
  return Math.max(0, p - d);
}

/* ===================== Mapeo API → UI ===================== */
// servicios/ventas.servicios.ts
export function mapTicketToBoleto(r: TicketRow): Boleto {
  return {
    id: r.Id_Ticket_PK,
    cliente: r.Cliente ?? '',
    origen: r.Origen ?? '',
    destino: r.Destino ?? '',
    fecha: (r.Fecha_Hora_Compra ?? '').slice(0, 10),
    precio: toNumber(r.Precio_Total, 0),
    tipoVenta: 'boleto',

    // 👇 fallback extra
    asiento: (r as any).Asiento ?? (r as any).Numero_Asiento ?? (r as any).numero_asiento ?? '',
    autobus: (r as any).Autobus ?? (r as any).Placa ?? (r as any).Unidad ?? '',

    horaSalida: (r as any).Hora_Salida ?? '',
    horaLlegada: (r as any).Hora_Llegada ?? '',
    telefono: (r as any).Telefono ?? '',
    cedula: (r as any).DNI ?? '',

    estado: (r as any).Estado_Ticket ?? r.Estado ?? 'pendiente',
    metodoPago: (r as any).Metodo_Pago ?? (r as any).Metodo ?? 'efectivo',

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

/* ===================== Catálogos ===================== */
// Cache para clientes activos
let clientesCache: Opcion[] | null = null;

// 👇 Exporta un invalidador simple
export function invalidateClientesCache() {
  clientesCache = null;
}


export async function getClientes(): Promise<Opcion[]> {
  // 🔹 Si ya está cacheado, devolvemos lo mismo
  if (clientesCache && clientesCache.length > 0) {
    return clientesCache;
  }

  // 🔹 Pedimos SOLO clientes activos (estado = 1)
  const { data } = await http.get('/api/clientes?estado=1');
  const items = data?.items ?? [];

  // 🔹 Mapeamos los clientes a formato { value, label }
  clientesCache = items.map((c: any) => ({
    value: c.id,
    label: c.nombre, // puedes agregar más info abajo si querés
  }));

  return clientesCache ?? [];
}

// ==================== RUTAS ACTIVAS (VIAJES) ====================

export async function getViajes(): Promise<Opcion[]> {
  try {
    // 🔹 Consultar las rutas activas desde el backend
    const { data } = await http.get('/api/rutas-activas');
    const items = data?.items ?? [];

    // 🔹 Mapear cada ruta al formato de opciones con información extra
    return items.map((v: any) => ({
      value: v.id,                                  // Id de la ruta
      label: `${v.label} (L. ${v.precio})`,         // Texto que verá el usuario
      extra: {                                      // 🟩 Información adicional
        precio: Number(v.precio ?? 0),
        horarios: Array.isArray(v.horarios)
          ? v.horarios
          : typeof v.horarios === 'string'
            ? (() => {
                try {
                  return JSON.parse(v.horarios);    // Convierte JSON a array
                } catch {
                  return [];
                }
              })()
            : [],
      },
    }));
  } catch (err) {
    console.error('❌ Error obteniendo rutas activas:', err);
    return [];
  }
}


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

export async function getAsientos(unidadId: number | string): Promise<Opcion[]> {
  const { data } = await http.get(`/api/asientos?unidadId=${unidadId}`);
  const grupo = (data?.items ?? []).find((g: any) => g.unidad == Number(unidadId));
  const rows: any[] = grupo?.asientos ?? [];
  return rows.map(a => ({
    label: `Asiento ${a.numero}`,
    value: a.id,
    disabled: a.id_estado_asiento !== 1,
  }));
}

export async function getMetodosPago(): Promise<Opcion[]> {
  const { data } = await http.get('/api/metodo.pago');
  return (data?.items ?? []).map((m: any) => ({ value: m.id, label: m.metodo }));
}

export async function getEstadosTicket(): Promise<Opcion[]> {
  const { data } = await http.get('/api/estado.ticket');
  return (data?.items ?? []).map((e: any) => ({ value: e.id, label: e.estado }));
}

export async function getPuntosVenta(): Promise<Opcion[]> {
  const { data } = await http.get('/api/punto.venta');
  return (data?.items ?? []).map((p: any) => ({
    value: p.id,
    label: `${p.nombre}${p.ubicacion ? ` (${p.ubicacion})` : ''}`,
  }));
}

/* ===================== Tickets ===================== */

export async function listarBoletos(): Promise<Boleto[]> {
  try {
    const { data } = await axios.get('/api/boletos');
    const items = data?.items ?? [];
    return items.map(mapTicketToBoleto);
  } catch (err: any) {
    console.error('❌ listarBoletos falló:', err?.response?.data || err);
    throw err;
  }
}






export type CrearBoletoResponse = {
  Id_Ticket_PK: number;
  Codigo_Ticket: string;
  message?: string;
};



export async function crearBoleto(b: Partial<Boleto>) {
  if (!b.Id_Viaje_FK) throw new Error('Viaje es obligatorio');
  if (!b.Id_Cliente_FK) throw new Error('Cliente es obligatorio');
  if (!b.Id_MetodoPago_FK) throw new Error('Método de pago es obligatorio');
  if (!b.Id_Asiento_FK) throw new Error('Debe seleccionar un asiento');

  const payload = {
    Fecha_Hora_Compra:
      b.fecha ? `${b.fecha} 00:00:00` : new Date().toISOString().slice(0, 19).replace('T', ' '),
    Precio_Total: calcularTotal(b.precio, b.descuento),
    Id_Viaje_FK: b.Id_Viaje_FK,
    Id_Cliente_FK: b.Id_Cliente_FK,
    Id_PuntoVenta_FK: b.Id_PuntoVenta_FK ?? 1,
    Id_MetodoPago_FK: b.Id_MetodoPago_FK,
    Id_EstadoTicket_FK: b.Id_EstadoTicket_FK ?? 1,
    Id_Asiento_FK: b.Id_Asiento_FK,
  };

   const { data } = await http.post('/api/boletos', payload);
  const newId  = data?.result?.Id_Ticket_PK ?? data?.Id_Ticket_PK ?? data?.insertId ?? null;
  const codigo = data?.result?.Codigo_Ticket ?? data?.Codigo_Ticket ?? '';

  if (!newId) throw new Error('No se pudo obtener el ID del ticket');

  return { Id_Ticket_PK: Number(newId), Codigo_Ticket: String(codigo || '') };
}

export async function actualizarBoleto(id: number, b: Partial<Boleto>) {
  const payload = {
    Fecha_Hora_Compra: b.fecha ? `${b.fecha} 00:00:00` : null,
    Precio_Total: b.precio != null ? toNumber(b.precio, 0) : null,
    Id_Viaje_FK: b.Id_Viaje_FK ?? null,
    Id_Cliente_FK: b.Id_Cliente_FK ?? null,
    Id_PuntoVenta_FK: b.Id_PuntoVenta_FK ?? null,
    Id_MetodoPago_FK: b.Id_MetodoPago_FK ?? null,
    Id_EstadoTicket_FK: b.Id_EstadoTicket_FK ?? null,
    Id_Asiento_FK: b.Id_Asiento_FK ?? null,
  };
  await http.put(`/api/boletos/${id}`, payload);
}

export async function eliminarBoleto(id: number) {
  const { data, status } = await http.delete(`/api/boletos/${id}`);
  if (status !== 200) throw new Error(data?.error || 'Error eliminando boleto');
  return data;
}

/* ===================== Catálogos agrupados ===================== */
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



///facturas 
// servicios/facturas.ts

export const obtenerDetallesFactura = async (idFactura: number) => {
  try {
    const { data } = await axios.get(`/api/facturas/${idFactura}/detalles`);
    return data; // debe devolver un array con los detalles de la factura
  } catch (error) {
    console.error("Error al obtener detalles de factura:", error);
    return [];
  }
};


// servicios/facturas.ts

export const obtenerTiposDescuento = async (): Promise<Opcion[]> => {
  try {
    const { data } = await axios.get('/api/catalogos?tipo=tipo_descuento');
    const items = data?.items ?? [];

    // Mapeamos los datos a un formato adecuado para el Dropdown
    return items.map((item: any) => ({
      value: item.value,
      label: `${item.label} (${item.value}%)`, // Se incluye el porcentaje en el label
    }));
  } catch (error) {
    console.error("Error al obtener tipos de descuento:", error);
    return []; // En caso de error, retornamos un array vacío
  }
};
