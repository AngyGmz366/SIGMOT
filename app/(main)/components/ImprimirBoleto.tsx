'use client';
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Boleto, FacturaForm } from '@/types/ventas';

interface BoletoPrintProps {
  data: Boleto;
  factura?: FacturaForm;
  visible?: boolean;
  onHide?: () => void;
}

const ImprimirBoleto: React.FC<BoletoPrintProps> = ({ data, factura }) => {
  const qrData = `Boleto:${data.Codigo_Ticket}|Cliente:${data.cliente}|Ruta:${data.origen}→${data.destino}|Fecha:${data.fecha}|Salida:${data.horaSalida}`;

  const subtotal = factura?.subtotal ?? Number(data.precio ?? data.total ?? 0);
  const descuento = factura?.descuentoTotal ?? 0;
  const isv = factura?.isv ?? (subtotal - descuento) * 0.15;
  const total = factura?.total ?? subtotal - descuento + isv;

  const Separator = () => <div className="border-t border-dashed border-gray-600 my-1"></div>;

  return (
    <div
      className="p-2"
      style={{
        fontFamily: 'Consolas, monospace',
        maxWidth: '280px',
        margin: '0 auto',
        fontSize: '10px',
        lineHeight: '1.4',
      }}
    >
      {/* ENCABEZADO */}
      <div className="text-center">
        <img
          src="/demo/images/login/LOGO-SIGMOT.png"
          alt="Logo SIGMOT"
          className="mx-auto mb-2"
          style={{ width: '150px', height: 'auto', objectFit: 'contain' }}
        />
        <h2 className="text-sm font-extrabold uppercase mb-0 mt-1">GRUPO SAENZ</h2>
        <p className="text-xs font-semibold mt-0 mb-1">BOLETO DE VIAJE</p>
        <p className="mb-0">RTN: 08019953636892</p>
        <p className="mb-0">Tel: 2242-6150 | Email: contacto@gruposaenz.com</p>
      </div>

      <Separator />

      {/* DATOS DE FACTURA */}
      <div className="text-left mb-2">
        <p className="mb-0">FACTURA: 000-002-01-{data.Codigo_Ticket}</p>
        <p className="mb-0">
          Fecha de Emisión: {new Date().toLocaleDateString()}{' '}
          {new Date().toLocaleTimeString()}
        </p>
      </div>

      <Separator />

      {/* DATOS DEL CLIENTE */}
      <div className="text-left mb-2">
        <p className="mb-0">CLIENTE: {data.cliente}</p>
        <p className="mb-0">DNI/RTN: {data.cedula}</p>
        <p className="mb-0">TELÉFONO: {data.telefono}</p>
      </div>

      <Separator />

      {/* DETALLE DEL VIAJE */}
      <div className="text-center mb-2 font-bold text-xs bg-gray-200 p-1">
        <p className="mb-0 uppercase">DETALLE DEL VIAJE</p>
      </div>

      <div className="mb-2 space-y-1">
        <div className="flex justify-between">
          <span>RUTA:</span>
          <span className="font-extrabold">{data.origen} → {data.destino}</span>
        </div>

      
        <div className="flex justify-between">
          <span>BOLETO N°:</span>
          <span className="font-bold">{data.Codigo_Ticket}</span>
        </div>

      <div className="flex justify-between">
  <span>UNIDAD:</span>
  <span className="font-bold">
    {data.autobus || (data as any).Autobus || (data as any).Numero_Placa || '—'}
  </span>
</div>

<div className="flex justify-between">
  <span>ASIENTO:</span>
  <span className="font-bold">
    {data.asiento || (data as any).Numero_Asiento || (data as any).Asiento || 'No asignado'}
  </span>
</div>



        <div className="flex justify-between">
          <span>FECHA:</span>
          <span>{data.fecha}</span>
        </div>
        <div className="flex justify-between">
          <span>HORA SALIDA:</span>
          <span className="font-extrabold text-red-700">{data.horaSalida}</span>
        </div>
        <div className="flex justify-between">
          <span>MÉTODO PAGO:</span>
          <span>{data.metodoPago}</span>
        </div>

         <div className="flex justify-between mb-4">
        <span>ESTADO:</span>
        <span className="font-semibold">{data.estado?.toUpperCase() || '—'}</span>
      </div>
      </div>

      <Separator />

      {/* PRECIOS */}
      <div className="mb-2">
        <div className="flex justify-between">
          <span>SUBTOTAL:</span>
          <span>HNL {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Importe Exento:</span>
          <span>HNL 0.00</span>
        </div>
        <div className="flex justify-between">
          <span>Importe Gravado 15%:</span>
          <span>HNL {(subtotal - descuento).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>ISV (15%):</span>
          <span>HNL {isv.toFixed(2)}</span>
        </div>
      </div>

      <Separator />

      <div className="flex justify-between font-extrabold text-sm mb-2">
        <span>TOTAL A PAGAR:</span>
        <span>HNL {total.toFixed(2)}</span>
      </div>

      <Separator />

      {/* QR */}
      <div className="mt-2 text-center">
        <QRCodeSVG value={qrData} size={90} level="H" includeMargin={false} />
        <p className="mt-1 font-bold text-xs">
          {data.Codigo_Ticket} | {data.origen} → {data.destino}
        </p>
      </div>

      <Separator />

      {/* NOTAS */}
      <div className="text-xs mt-3 text-center">
        <p className="font-bold mb-0">¡Gracias por viajar con GRUPO SAENZ!</p>
        <p className="mb-0">Conserve su boleto para el abordaje y reclamo de equipaje.</p>
        <p className="mb-0">Para T&C y verificación, escanee el QR.</p>
      </div>
    </div>
  );
};

export default ImprimirBoleto;
