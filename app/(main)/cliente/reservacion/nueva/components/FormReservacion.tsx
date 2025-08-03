'use client';
import { useState } from 'react';
import { Button } from 'primereact/button';
import RutaSelector from './RutaSelector';
import AsientoSelector from './AsientoSelector';
import BoletoPreview from './BoletoPreview';

export default function FormReservacion() {
  const [step, setStep] = useState<'form' | 'confirmacion'>('form');
  const [formData, setFormData] = useState({
    tipo: 'viaje',
    ruta: null,
    fecha: new Date(),
    hora: '',
    asiento: null,
    peso: null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirmacion');
  };

  if (step === 'confirmacion') {
    return <BoletoPreview data={formData} onBack={() => setStep('form')} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <RutaSelector 
          formData={formData}
          setFormData={setFormData}
        />
        
        {formData.tipo === 'viaje' && (
          <AsientoSelector
            formData={formData}
            setFormData={setFormData}
          />
        )}
      </div>

      <Button 
        label="Continuar" 
        type="submit" 
        className="w-full" 
        disabled={!formData.ruta}
      />
    </form>
  );
}