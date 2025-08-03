'use client';
import { useEffect, useRef } from 'react';

export default function QRGenerator({ value }: { value: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        // Simulación de QR - en producción usar react-qr-code
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = '#000000';
        
        // Patrón de cuadrados simulando QR
        for (let i = 10; i < 190; i += 40) {
          for (let j = 10; j < 190; j += 40) {
            ctx.fillRect(i, j, 30, 30);
          }
        }
        
        // Texto de simulación
        ctx.font = '10px Arial';
        ctx.fillText(value.substring(0, 15), 20, 180);
      }
    }
  }, [value]);

  return (
    <canvas 
      ref={canvasRef} 
      width={200} 
      height={200}
      aria-label="Código QR de reserva"
    />
  );
}