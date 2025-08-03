'use client';

import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useIncidencias } from './hooks/useIncidencias';

export default function PageIncidenciasSop() {
  const { incidencias, agregarIncidencia } = useIncidencias();

  const tiposIncidencia = [
    { label: 'Queja', value: 'Queja' },
    { label: 'Sugerencia', value: 'Sugerencia' },
    { label: 'Problema técnico', value: 'Problema técnico' }
  ];

  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const manejarEnvio = () => {
    if (!tipo || !descripcion) {
      alert('Por favor completa todos los campos.');
      return;
    }
    agregarIncidencia(tipo, descripcion);
    setTipo('');
    setDescripcion('');
  };

  return (
    <div className="p-4 space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-800">Incidencias y Soporte</h2>
        <Button
          label="Enviar incidencia"
          icon="pi pi-send"
          className="p-button-rounded"
          style={{ backgroundColor: '#6a1b9a', border: 'none', color: 'white' }}
          onClick={manejarEnvio}
        />
      </div>

      {/* Formulario */}
      <Card className="shadow-2 border-round-xl p-4">
        <div className="grid formgrid p-fluid">
          <div className="field col-12 md:col-4">
            <label htmlFor="tipo" className="font-medium">Tipo de incidencia</label>
            <Dropdown
              id="tipo"
              value={tipo}
              options={tiposIncidencia}
              onChange={(e) => setTipo(e.value)}
              placeholder="Seleccione"
            />
          </div>

          <div className="field col-12 md:col-8">
            <label htmlFor="descripcion" className="font-medium">Descripción</label>
            <InputTextarea
              id="descripcion"
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe la incidencia..."
            />
          </div>
        </div>
      </Card>

      {/* Tabla */}
      <Card title="Mis incidencias" className="shadow-2 border-round-xl">
        <DataTable value={incidencias} paginator rows={5} responsiveLayout="scroll">
          <Column field="id" header="ID" style={{ width: '60px' }} />
          <Column field="fecha" header="Fecha" />
          <Column field="tipo" header="Tipo" />
          <Column
            field="estado"
            header="Estado"
            body={(rowData) => (
              <span
                className={`px-2 py-1 rounded text-white text-sm ${
                  rowData.estado === 'Abierto'
                    ? 'bg-red-500'
                    : rowData.estado === 'En proceso'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
              >
                {rowData.estado}
              </span>
            )}
          />
          <Column field="descripcion" header="Descripción" />
        </DataTable>
      </Card>
    </div>
  );
}
