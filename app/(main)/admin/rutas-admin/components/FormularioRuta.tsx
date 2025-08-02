'use client';

import React, { useState, useEffect } from 'react';
import { Ruta } from '@/app/(main)/cliente/rutas/Types/rutas.types';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';

interface FormularioRutaProps {
  ruta: Ruta | null;
  onGuardar: (ruta: Ruta) => void;
  onCerrar: () => void;
}

const FormularioRuta: React.FC<FormularioRutaProps> = ({ ruta, onGuardar, onCerrar }) => {
  const [formData, setFormData] = useState<Ruta>({
    id: '',
    nombre: '',
    origen: '',
    destino: '',
    estado: 'activo',
    tiempoEstimado: '',
    coordenadas: [],
    paradas: [],
  });

  useEffect(() => {
    if (ruta) {
      setFormData(ruta);
    }
  }, [ruta]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEstadoChange = (e: any) => {
    setFormData(prev => ({ ...prev, estado: e.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar(formData);
  };

  return (
    <Card title={ruta ? 'Editar Ruta' : 'Nueva Ruta'} className="shadow-2 border-round-xl">
      <form onSubmit={handleSubmit} className="p-fluid grid formgrid">
        <div className="field col-12 md:col-6">
          <label htmlFor="id" className="font-medium">ID</label>
          <InputText
            id="id"
            name="id"
            value={formData.id}
            onChange={handleChange}
            disabled={!!ruta}
            required
          />
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor="nombre" className="font-medium">Nombre</label>
          <InputText
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor="origen" className="font-medium">Origen</label>
          <InputText
            id="origen"
            name="origen"
            value={formData.origen}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor="destino" className="font-medium">Destino</label>
          <InputText
            id="destino"
            name="destino"
            value={formData.destino}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor="estado" className="font-medium">Estado</label>
          <Dropdown
            id="estado"
            value={formData.estado}
            options={[
              { label: 'Activo', value: 'activo' },
              { label: 'Inactivo', value: 'inactivo' }
            ]}
            onChange={handleEstadoChange}
          />
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor="tiempoEstimado" className="font-medium">Tiempo Estimado</label>
          <InputText
            id="tiempoEstimado"
            name="tiempoEstimado"
            value={formData.tiempoEstimado}
            onChange={handleChange}
            placeholder="Ej. 3h 40min"
            required
          />
        </div>

        <div className="col-12 flex justify-end gap-2 mt-3">
          <Button type="submit" label="Guardar" icon="pi pi-check" className="p-button-sm p-button-primary" />
          <Button type="button" label="Cancelar" icon="pi pi-times" className="p-button-sm p-button-secondary" onClick={onCerrar} />
        </div>
      </form>
    </Card>
  );
};

export default FormularioRuta;
