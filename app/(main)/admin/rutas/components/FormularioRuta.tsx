'use client';

import React, { useState, useEffect } from 'react';
import { Ruta } from '@/app/rutas/Types/rutas.types';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar(formData);
  };

  return (
    <div className="border p-4 rounded-md shadow bg-white space-y-4">
      <h3 className="text-xl font-semibold mb-2">
        {ruta ? 'Editar Ruta' : 'Nueva Ruta'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">ID</label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              className="p-inputtext w-full"
              disabled={!!ruta} // No editable en edición
              required
            />
          </div>
          <div>
            <label className="block font-medium">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="p-inputtext w-full"
              required
            />
          </div>
          <div>
            <label className="block font-medium">Origen</label>
            <input
              type="text"
              name="origen"
              value={formData.origen}
              onChange={handleChange}
              className="p-inputtext w-full"
              required
            />
          </div>
          <div>
            <label className="block font-medium">Destino</label>
            <input
              type="text"
              name="destino"
              value={formData.destino}
              onChange={handleChange}
              className="p-inputtext w-full"
              required
            />
          </div>
          <div>
            <label className="block font-medium">Estado</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="p-inputtext w-full"
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          <div>
            <label className="block font-medium">Tiempo Estimado</label>
            <input
              type="text"
              name="tiempoEstimado"
              value={formData.tiempoEstimado}
              onChange={handleChange}
              className="p-inputtext w-full"
              placeholder="Ej. 3h 40min"
              required
            />
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button type="submit" className="p-button p-button-primary">
            Guardar
          </button>
          <button
            type="button"
            className="p-button p-button-secondary"
            onClick={onCerrar}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioRuta;
