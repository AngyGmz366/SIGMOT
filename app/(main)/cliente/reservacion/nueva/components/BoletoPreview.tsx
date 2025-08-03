'use client';
import { Button } from 'primereact/button';
import QRGenerator from './QRGenerator';

export default function BoletoPreview({ data, onBack }: { 
  data: any;
  onBack: () => void;
}) {
  const handleDownload = () => {
    // Simulación de descarga (en producción usaríamos una librería como jsPDF)
    const blob = new Blob([`Boleto de ${data.tipo}\nRuta: ${data.ruta}\nFecha: ${data.fecha.toLocaleDateString()}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boleto-${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="border rounded-lg p-6 shadow-md max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-blue-600">GRUPO SAENZ</h2>
        <p className="text-lg font-medium">
          Boleto de {data.tipo === 'viaje' ? 'Viaje' : 'Encomienda'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <h3 className="font-semibold border-b pb-1">Datos del Cliente</h3>
          <p><strong>Nombre:</strong> [Nombre del cliente]</p>
          <p><strong>Documento:</strong> [N° documento]</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold border-b pb-1">Detalles del Viaje</h3>
          <p><strong>Ruta:</strong> {data.ruta}</p>
          <p><strong>Fecha:</strong> {data.fecha.toLocaleDateString()}</p>
          <p><strong>Hora:</strong> {data.hora}</p>
          {data.tipo === 'viaje' ? (
            <p><strong>Asiento:</strong> {data.asiento || 'Por asignar'}</p>
          ) : (
            <p><strong>Peso:</strong> {data.peso} kg</p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="border p-2 mb-2">
          <QRGenerator value={`RESERVA-${Date.now()}`} />
        </div>
        <p className="text-sm text-gray-500">Escanee este código al abordar</p>
      </div>

      <div className="flex justify-between mt-6">
        <Button 
          label="Volver" 
          icon="pi pi-arrow-left" 
          onClick={onBack} 
          className="p-button-outlined" 
        />
        <Button 
          label="Descargar Boleto" 
          icon="pi pi-download" 
          onClick={handleDownload} 
          className="p-button-success" 
        />
      </div>
    </div>
  );
}