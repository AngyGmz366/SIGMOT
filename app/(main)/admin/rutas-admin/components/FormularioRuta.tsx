'use client';

import React, { useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';

type EstadoUI = 'activo' | 'inactivo';

export type RutaUI = {
  id: number;                        // 0 cuando es nueva
  origen: string;
  destino: string;
  estado: EstadoUI;
  tiempoEstimado?: string | null;    // HH:mm:ss
  distancia?: number | null;
  descripcion?: string | null;
};

interface FormularioRutaProps {
  ruta: RutaUI | null;
  onGuardar: (ruta: RutaUI) => void;
  onCerrar: () => void;
  loading?: boolean;
}

const FormularioRuta: React.FC<FormularioRutaProps> = ({ ruta, onGuardar, onCerrar, loading }) => {
  const [formData, setFormData] = useState<RutaUI>({
    id: 0,
    origen: '',
    destino: '',
    estado: 'activo',
    tiempoEstimado: '03:40:00',
    distancia: null,
    descripcion: null
  });

  useEffect(() => {
    if (ruta) setFormData(ruta);
    else setFormData({
      id: 0,
      origen: '',
      destino: '',
      estado: 'activo',
      tiempoEstimado: '03:40:00',
      distancia: null,
      descripcion: null
    });
  }, [ruta]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEstadoChange = (e: DropdownChangeEvent) => {
    setFormData(prev => ({ ...prev, estado: e.value as EstadoUI }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.origen?.trim() || !formData.destino?.trim()) return;
    if (formData.tiempoEstimado && !/^\d{2}:\d{2}:\d{2}$/.test(formData.tiempoEstimado)) {
      alert('Tiempo estimado debe tener formato HH:mm:ss (ej. 03:40:00)');
      return;
    }
    onGuardar({
      ...formData,
      origen: formData.origen.trim(),
      destino: formData.destino.trim(),
      tiempoEstimado: formData.tiempoEstimado || null
    });
  };

  return (
    <Card title={ruta && ruta.id !== 0 ? 'Editar Ruta' : 'Nueva Ruta'} className="shadow-2 border-round-xl">
      <form onSubmit={handleSubmit} className="p-fluid grid formgrid">
        {ruta && ruta.id !== 0 && (
          <div className="field col-12 md:col-6">
            <label className="font-medium">ID</label>
            <InputText value={String(formData.id)} disabled />
          </div>
        )}

        <div className="field col-12 md:col-6">
          <label htmlFor="origen" className="font-medium">Origen</label>
          <InputText id="origen" name="origen" value={formData.origen} onChange={handleChange} required />
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor="destino" className="font-medium">Destino</label>
          <InputText id="destino" name="destino" value={formData.destino} onChange={handleChange} required />
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor="estado" className="font-medium">Estado</label>
          <Dropdown
            id="estado"
            value={formData.estado}
            options={[{ label: 'Activo', value: 'activo' }, { label: 'Inactivo', value: 'inactivo' }]}
            onChange={handleEstadoChange}
            className="w-full"
          />
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor="tiempoEstimado" className="font-medium">Tiempo Estimado</label>
          <InputText
            id="tiempoEstimado"
            name="tiempoEstimado"
            value={formData.tiempoEstimado || ''}
            onChange={handleChange}
            placeholder="HH:mm:ss (ej. 03:40:00)"
            required
          />
        </div>

        <div className="col-12 flex justify-end gap-2 mt-3">
          <Button type="button" label="Cancelar" icon="pi pi-times" className="p-button-secondary p-button-sm" onClick={onCerrar} disabled={loading} />
          <Button type="submit" label="Guardar" icon="pi pi-check" className="p-button-primary p-button-sm" loading={loading} />
        </div>
      </form>
    </Card>
  );
};

export default FormularioRuta;
