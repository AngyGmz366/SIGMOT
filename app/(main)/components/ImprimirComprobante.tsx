// components/ImprimirComprobante.tsx
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Venta } from '@/types/ventas';

interface ComprobantePrintProps {
  item: Venta;
}

const ImprimirComprobante: React.FC<ComprobantePrintProps> = ({ item }) => {
  // Datos para el QR: id, cliente, fecha, total y estado
  const qrData = `VentaID:${item.id}|Cliente:${item.cliente}|Fecha:${item.fecha}|Total:${item.total}|Estado:${item.estado}`;

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
            <p>{item.cliente}</p>
          </div>
          <div>
            <p className="font-semibold">Fecha:</p>
            <p>{new Date(item.fecha).toLocaleString()}</p>
          </div>

          <div className="col-span-2">
            <p className="font-semibold">Productos:</p>
            <ul className="list-disc ml-5">
              {item.productos.map(p => (
                <li key={p.productoId}>
                  {p.nombre} x {p.cantidad} @ ${p.precioUnitario.toFixed(2)} = ${p.subtotal.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold">Estado:</p>
            <p className="capitalize">{item.estado}</p>
          </div>
          <div>
            <p className="font-semibold">Método de Pago:</p>
            <p className="capitalize">{item.metodoPago}</p>
          </div>
        </div>

        <div className="border-t-2 border-gray-800 pt-2 mt-2 flex justify-between font-semibold text-lg">
          <span>Total a pagar:</span>
          <span>${item.total?.toFixed(2) || '0.00'}</span>
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
