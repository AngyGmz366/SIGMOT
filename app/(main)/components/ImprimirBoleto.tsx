// components/ImprimirBoleto.tsx
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Boleto } from '@/types/ventas';

interface BoletoPrintProps {
  item: Boleto;
}

const ImprimirBoleto: React.FC<BoletoPrintProps> = ({ item }) => {
  const qrData = `BoletoID:${item.id}|Cliente:${item.cliente}|Destino:${item.destino}|Fecha:${item.fecha}|Asiento:${item.asiento}|Bus:${item.autobus}`;

  return (
    <div className="p-4" style={{ fontFamily: 'Arial, sans-serif', maxWidth: '400px', margin: '0 auto' }}>
      <div className="border-2 border-gray-800 p-4 rounded-lg">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">TRANSPORTE SAENS</h2>
          <p className="text-sm">BOLETO DE VIAJE</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <p className="font-semibold">Cliente:</p>
            <p>{item.cliente}</p>
          </div>
          <div>
            <p className="font-semibold">Cédula:</p>
            <p>{item.cedula || 'N/A'}</p>
          </div>
          <div>
            <p className="font-semibold">Fecha:</p>
            <p>{item.fecha}</p>
          </div>
          <div>
            <p className="font-semibold">Hora Salida:</p>
            <p>{item.horaSalida || 'N/A'}</p>
          </div>
          <div>
            <p className="font-semibold">Destino:</p>
            <p>{item.destino}</p>
          </div>
          <div>
            <p className="font-semibold">Asiento:</p>
            <p>{item.asiento || 'N/A'}</p>
          </div>
          <div>
            <p className="font-semibold">Autobús:</p>
            <p>{item.autobus || 'N/A'}</p>
          </div>
          <div>
            <p className="font-semibold">Estado:</p>
            <p className="capitalize">{item.estado}</p>
          </div>
        </div>

        <div className="border-t-2 border-gray-800 pt-2 mt-2">
          <div className="flex justify-between">
            <span className="font-semibold">Total:</span>
            <span>HNL {item.total?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Método Pago:</span>
            <span className="capitalize">{item.metodoPago}</span>
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

export default ImprimirBoleto;
