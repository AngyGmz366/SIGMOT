import React from 'react';
import { VentaItem, Boleto, Encomienda } from '@/types/ventas'; // Asegúrate de importar los tipos
import { QRCodeSVG } from 'qrcode.react';

interface ComprobantePrintProps {
  item: VentaItem;
}

const ImprimirComprobante: React.FC<ComprobantePrintProps> = ({ item }) => {
  let qrData = '';

  if (item.tipoVenta === 'boleto') {
    const boleto = item as Boleto;  // Asegúrate de hacer el cast correctamente
    qrData = `VentaID:${boleto.id}|Cliente:${boleto.cliente}|Fecha:${boleto.fecha}|Total:${boleto.total}|Estado:${boleto.estado}`;
  } else if (item.tipoVenta === 'encomienda') {
    const encomienda = item as Encomienda;  // Asegúrate de hacer el cast correctamente
    qrData = `VentaID:${encomienda.id}|Remitente:${encomienda.remitente}|Destinatario:${encomienda.destinatario}|Origen:${encomienda.origen}|Destino:${encomienda.destino}|Fecha:${encomienda.fecha}|Estado:${encomienda.estado}`;
  }

  return (
    <div className="p-4" style={{ fontFamily: 'Arial, sans-serif', maxWidth: '400px', margin: '0 auto' }}>
      <div className="border-2 border-gray-800 p-4 rounded-lg">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">TRANSPORTE SAENS</h2>
          <p className="text-sm">COMPROBANTE DE RECIBO</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <p className="font-semibold">Cliente:</p>
            <p>{item.tipoVenta === 'boleto' ? (item as Boleto).cliente : (item as Encomienda).remitente}</p>
          </div>
          <div>
            <p className="font-semibold">Fecha:</p>
            <p>{item.fecha}</p>
          </div>
          {/* Aquí puedes agregar más propiedades dependiendo de si es Boleto o Encomienda */}
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

export default ImprimirComprobante;
