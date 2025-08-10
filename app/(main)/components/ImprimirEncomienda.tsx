// components/ImprimirEncomienda.tsx
'use client';

import React from 'react';
import { Encomienda } from '@/types/ventas';
import { QRCodeSVG } from 'qrcode.react';

interface ImprimirEncomiendaProps {
  item: Encomienda;
}

const ImprimirEncomienda: React.FC<ImprimirEncomiendaProps> = ({ item }) => {
  const qrData = `EncomiendaID:${item.id}|Remitente:${item.remitente}|Destinatario:${item.destinatario}|Origen:${item.origen}|Destino:${item.destino}|Fecha:${item.fecha}|Estado:${item.estado}`;

  return (
    <div className="p-4" style={{ fontFamily: 'Arial, sans-serif', maxWidth: '400px', margin: '0 auto' }}>
      <div className="border-2 border-gray-800 p-4 rounded-lg">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">TRANSPORTE SAENS</h2>
          <p className="text-sm">COMPROBANTE ENCOMIENDA</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <p className="font-semibold">Remitente:</p>
            <p>{item.remitente}</p>
          </div>
          <div>
            <p className="font-semibold">Cédula:</p>
            <p>{item.cedulaRemitente || 'N/A'}</p>
          </div>
          <div>
            <p className="font-semibold">Destinatario:</p>
            <p>{item.destinatario}</p>
          </div>
          <div>
            <p className="font-semibold">Cédula:</p>
            <p>{item.cedulaDestinatario || 'N/A'}</p>
          </div>
          <div>
            <p className="font-semibold">Origen:</p>
            <p>{item.origen}</p>
          </div>
          <div>
            <p className="font-semibold">Destino:</p>
            <p>{item.destino}</p>
          </div>
          <div>
            <p className="font-semibold">Fecha:</p>
            <p>{item.fecha}</p>
          </div>
          <div>
            <p className="font-semibold">Teléfono:</p>
            <p>{item.telefono || 'N/A'}</p>
          </div>
          <div>
            <p className="font-semibold">Descripción:</p>
            <p>{item.descripcion}</p>
          </div>
          <div>
            <p className="font-semibold">Peso:</p>
            <p>{item.peso} kg</p>
          </div>
          <div>
            <p className="font-semibold">Estado:</p>
            <p className="capitalize">{item.estado}</p>
          </div>
          <div>
            <p className="font-semibold">Método Pago:</p>
            <p className="capitalize">{item.metodoPago}</p>
          </div>
        </div>

        <div className="border-t-2 border-gray-800 pt-2 mt-2 font-bold">
          <div className="flex justify-between">
            <span>Total:</span>
            <span>HNL {item.total?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        <div className="mt-4 text-center">
          <QRCodeSVG
            id="qr-code-svg"
            value={qrData}
            size={128}
            level="H"
            includeMargin={true}
          />
          <p className="text-xs mt-2">ID: {item.id}</p>
        </div>
      </div>
    </div>
  );
};

export default ImprimirEncomienda;
