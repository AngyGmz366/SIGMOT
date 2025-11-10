// src/lib/voucher.ts
export type TipoReservacion = 'VIAJE' | 'ENCOMIENDA';

export type ReservacionFront = {
  id: number | string;
  tipo: TipoReservacion;               // 'VIAJE' | 'ENCOMIENDA'
  ruta?: string;                       // "Origen → Destino"
  unidad?: string;                     // "Placa XXX / Marca"
  asiento?: string | number | null;    // solo VIAJE
  fecha: string | Date;
  estado: string;
  precio?: number | string | null;          // VIAJE
  costoEncomienda?: number | string | null; // ENCOMIENDA
  origen?: string | null;              // opcional si manejas origen/destino por separado
  destino?: string | null;
};

export type ClienteMin = {
  nombreCompleto: string;
  dni?: string | null;
};

export type VoucherData = {
  IdReserva: string;
  Tipo: TipoReservacion;
  Estado: string;
  Fecha: string;        // ISO
  Cliente: string;
  Origen?: string | null;
  Destino?: string | null;
  Unidad?: string | null;
  NumeroAsiento?: string | null;
  Monto?: string | null; // precio/costo formateado
};

export function buildVoucherData(r: ReservacionFront, cliente: ClienteMin): VoucherData {
  const isEncomienda = r.tipo === 'ENCOMIENDA';
  const montoRaw = isEncomienda ? r.costoEncomienda : r.precio;
  const montoFmt =
    montoRaw === null || montoRaw === undefined || montoRaw === '' ? null :
    `${Number(montoRaw).toFixed(2)} Lps`;

  const [origen, destino] = r.ruta?.includes('→')
    ? r.ruta.split('→').map(s => s.trim())
    : [r.origen ?? null, r.destino ?? null];

  return {
    IdReserva: String(r.id),
    Tipo: r.tipo,
    Estado: r.estado,
    Fecha: (r.fecha instanceof Date ? r.fecha : new Date(r.fecha)).toISOString(),
    Cliente: cliente.nombreCompleto,
    Origen: origen ?? null,
    Destino: destino ?? null,
    Unidad: r.unidad ?? null,
    NumeroAsiento: r.tipo === 'VIAJE' ? (r.asiento ? String(r.asiento) : 'N/A') : null,
    Monto: montoFmt
  };
}
