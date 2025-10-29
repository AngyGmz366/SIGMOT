// venta.controlador.ts
// -------------------------------------------------------------
// Controlador de ventas: lógica de negocio y persistencia.
// - Crear/editar boletos y encomiendas
// - Cálculo de totales
// - Filtros por modo
// - Persistencia en localStorage
// - Integración con APIs (tickets, clientes, viajes, asientos...)
// -------------------------------------------------------------

import type { VentaItem, Boleto, Encomienda } from '@/types/ventas';
import type { Opcion } from '../servicios/ventas.servicios';
import type { CrearBoletoResponse } from '@/modulos/boletos/servicios/ventas.servicios';
import {
  crearBoleto,
  actualizarBoleto,
  getCatalogos,
  getAsientos,
} from '@/modulos/boletos/servicios/ventas.servicios';


const STORAGE_KEY = 'ventaItems';

// --- Utilidades internas ---

/** Convierte a número seguro (evita NaN). */
function toNumberSafe(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** Calcula total = precio - descuento (no negativo). */
export function calcularTotal(precio: unknown, descuento: unknown = 0): number {
  const p = toNumberSafe(precio, 0);
  const d = toNumberSafe(descuento, 0);
  const total = p - d;
  return total < 0 ? 0 : total;
}

/** Type Guard para Boleto. */
export function esBoleto(item: VentaItem): item is Boleto {
  return item?.tipoVenta === 'boleto';
}

/** Carga desde localStorage (seguro en SSR). */
export function cargarItems(): VentaItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as VentaItem[]) : [];
  } catch {
    return [];
  }
}

/** Guarda en localStorage (seguro). */
export function guardarItems(items: VentaItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/** Plantilla de nuevo boleto. */
export function nuevoBoleto(): Boleto {
  return {
    id: null,
    cliente: '',
    origen: '',   // ✅ nuevo
    destino: '',
    fecha: '',
    precio: 0,
    tipoVenta: 'boleto',
    asiento: '',
    autobus: '',
    horaSalida: '',
    horaLlegada: '',
    telefono: '',
    cedula: '',
    estado: 'vendido',
    metodoPago: 'efectivo',
    descuento: 0,
    total: 0,
  };
}

/** Plantilla de nueva encomienda. */
export function nuevaEncomienda(): Encomienda {
  return {
    id: null,
    remitente: '',
    destinatario: '',
    origen: '',
    destino: '',
    fecha: '',
    descripcion: '',
    peso: 0,
    precio: 0,
    tipoVenta: 'encomienda',
    telefono: '',
    cedulaRemitente: '',
    cedulaDestinatario: '',
    estado: 'enviado',
    metodoPago: 'efectivo',
    descuento: 0,
    total: 0,
  };
}

/** Inserta o actualiza un boleto en BD vía API y recalcula total. */
export async function upsertBoletoAPI(
  boleto: Boleto,
  itemsActuales: VentaItem[]
): Promise<{ items: VentaItem[]; created: boolean; item: Boleto }> {
  const copia = [...itemsActuales];
  const b: Boleto = { ...boleto, total: calcularTotal(boleto.precio, boleto.descuento) };

  if (b.id) {
    await actualizarBoleto(b.id, b);
    const idx = copia.findIndex((i) => i.id === b.id);
    if (idx >= 0) copia[idx] = b;
    return { items: copia, created: false, item: b };
  } else {
    // ✅ NO tipar como CrearBoletoResponse; normalizamos
    const res = await crearBoleto(b) as unknown;

    // Normalizador: soporta respuesta nueva {Id_Ticket_PK, Codigo_Ticket}
    // y vieja {id, message}
    const { Id_Ticket_PK, Codigo_Ticket } = (() => {
      // @ts-ignore inspection dinámica
      if (res && typeof res === 'object' && 'Id_Ticket_PK' in res) {
        // @ts-ignore
        return { Id_Ticket_PK: Number(res.Id_Ticket_PK), Codigo_Ticket: String(res.Codigo_Ticket ?? '') };
      }
      // @ts-ignore
      const id = Number((res as any)?.id ?? 0);
      return { Id_Ticket_PK: id, Codigo_Ticket: '' };
    })();

    b.id = Id_Ticket_PK;
    b.Codigo_Ticket = Codigo_Ticket;

    copia.push(b);
    return { items: copia, created: true, item: b };
  }
}


/** Inserta o actualiza una encomienda (local, sin API aún). */
export function upsertEncomienda(
  encomienda: Encomienda,
  itemsActuales: VentaItem[]
): { items: VentaItem[]; created: boolean; item: Encomienda } {
  const copia = [...itemsActuales];
  const e: Encomienda = {
    ...encomienda,
    total: calcularTotal(encomienda.precio, encomienda.descuento),
  };

  if (e.id) {
    const idx = copia.findIndex((i) => i.id === e.id);
    if (idx >= 0) copia[idx] = e;
    return { items: copia, created: false, item: e };
  } else {
    e.id = Date.now();
    copia.push(e);
    return { items: copia, created: true, item: e };
  }
}

/** Devuelve items según modo actual. */
export function filtrarPorModo(
  items: VentaItem[],
  modo: 'boleto' | 'encomienda'
): VentaItem[] {
  return items.filter((i) =>
    modo === 'boleto' ? esBoleto(i) : i.tipoVenta === 'encomienda'
  );
}

/** Elimina por ids seleccionados. */
export function eliminarPorIds(
  ids: Array<number | string>,
  items: VentaItem[]
): VentaItem[] {
  const set = new Set(ids);
  return items.filter((i) => !set.has(i.id as any));
}

/** Prepara edición: retorna el tipo y el payload listo para el modal. */
export function prepararEdicion(
  item: VentaItem
): { tipo: 'boleto' | 'encomienda'; data: Boleto | Encomienda } {
  return esBoleto(item)
    ? { tipo: 'boleto', data: { ...(item as Boleto) } }
    : { tipo: 'encomienda', data: { ...(item as Encomienda) } };
}

// --- Catálogos y helpers ---

type Catalogos = {
  clientes?: Opcion[];
  destinos?: Opcion[];
  autobuses?: Opcion[];
  asientos?: Opcion[];
};

/** Dado un boleto con *_FK, completa los textos (cliente, destino, autobus, asiento). */
export function hidratarBoletoDesdeFK(b: Boleto, cat: Catalogos) {
  const byVal = (arr?: Opcion[], v?: any) =>
    arr?.find((o) => o.value === v)?.label || '';
  return {
    ...b,
    cliente: b.cliente || byVal(cat.clientes, b.Id_Cliente_FK),
    destino: b.destino || byVal(cat.destinos, b.Id_Viaje_FK),
    autobus: b.autobus || byVal(cat.autobuses, b.Id_Unidad_FK),
    asiento: b.asiento || byVal(cat.asientos, (b as any).Id_Asiento_FK),
  };
}

/** Dada una encomienda con *_FK, completa los textos. */
export function hidratarEncomiendaDesdeFK(e: Encomienda, cat: Catalogos) {
  const byVal = (arr?: Opcion[], v?: any) =>
    arr?.find((o) => o.value === v)?.label || '';
  return {
    ...e,
    remitente: e.remitente || byVal(cat.clientes, (e as any).Id_Remitente_FK),
    destinatario:
      e.destinatario || byVal(cat.clientes, (e as any).Id_Destinatario_FK),
    origen: e.origen || byVal(cat.destinos, (e as any).Id_Origen_FK),
    destino: e.destino || byVal(cat.destinos, (e as any).Id_Destino_FK),
  };
}

/** Carga todos los catálogos necesarios para boleto/encomienda */
export async function cargarCatalogos() {
  return await getCatalogos();
}

/** Carga asientos de un bus específico */
export async function cargarAsientos(busId: number) {
  return await getAsientos(busId);
}
