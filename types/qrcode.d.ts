// types/qr.ts
export interface BoletoQRData {
  id: number;
  cliente: string;
  destino: string;
  fecha: string;  // en formato ISO string
  precio: number;
}


interface BoletoPrintProps {
  cliente: string;
  destino: string;
  fecha: string;
  precio: number;
  codigoQRData: string; // Datos para el QR (puede ser URL, ID, json, etc)
}


declare module 'qrcode.react' {
  import * as React from 'react';

  interface QRCodeProps {
    value: string;
    size?: number;
    level?: 'L' | 'M' | 'Q' | 'H';
    bgColor?: string;
    fgColor?: string;
    includeMargin?: boolean;
    renderAs?: 'canvas' | 'svg';
    // ...otros props que uses
  }

  const QRCode: React.FC<QRCodeProps>;

  export default QRCode;
}
