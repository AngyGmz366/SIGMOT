import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Boleto } from '@/types/ventas';

interface BoletoPrintProps {
  item: Boleto;
  factura?: any;
}

const ImprimirBoleto: React.FC<BoletoPrintProps> = ({ item, factura }) => {
  const qrData = `BoletoID:${item.id}|Cliente:${item.cliente}|Destino:${item.destino}|Fecha:${item.fecha}|Asiento:${item.asiento}|Bus:${item.autobus}`;
console.log('Boleto a imprimir:', item);


  return (
    <div className="p-4" style={{ fontFamily: 'Arial, sans-serif', maxWidth: '400px', margin: '0 auto' }}>
      <div className="border-2 border-gray-800 p-4 rounded-lg">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">TRANSPORTE SAENZ</h2>
          <p className="text-sm">BOLETO DE VIAJE</p>
          <p className="text-sm">RTN: 08019953636892</p>
          <p className="text-sm">Tel: 2242-6150</p>
          <p className="text-sm">Email: contacto@transportessaenz.com</p>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-4">
          {/* Datos del boleto */}
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
            <p className="capitalize">{item.estado || 'N/A'}</p>
          </div>

          {/* Información de la factura */}
          {factura && (
            <div className="border-t-2 border-gray-800 pt-2 mt-2">
              <div>
                <p className="font-semibold">Número de Factura:</p>
                <p>{factura.Codigo_Factura || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold">Método de Pago:</p>
                <p>{factura.MetodoPago || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold">Fecha:</p>
                <p>{factura.Fecha || 'N/A'}</p>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Subtotal:</span>
                <span>HNL {factura.Subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Descuento:</span>
                <span>HNL {factura.Descuento?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">ISV (15%):</span>
                <span>HNL {factura.ISV?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between font-bold text-xl">
                <span>Total a pagar:</span>
                <span>HNL {factura.Total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          )}

          {/* Código QR */}
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
    </div>
  );
};

export default ImprimirBoleto;
