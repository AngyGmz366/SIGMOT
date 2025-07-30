'use client';
import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import './styles/incidencias.css';

// Datos simulados para categorías
const categorias = [
  {
    icono: 'pi pi-book',
    titulo: 'Base de conocimientos',
    descripcion: 'Artículos y guías para resolver problemas frecuentes.'
  },
  {
    icono: 'pi pi-question-circle',
    titulo: 'Preguntas frecuentes',
    descripcion: 'Respuestas rápidas a dudas comunes.'
  },
  {
    icono: 'pi pi-comments',
    titulo: 'Foro de comunidad',
    descripcion: 'Interactúa con otros usuarios y comparte soluciones.'
  }
];

// Datos simulados para incidencias reportadas
const incidenciasMock = [
  { id: 1, fecha: '2025-07-20', tipo: 'Queja', estado: 'Abierto', descripcion: 'El bus llegó tarde' },
  { id: 2, fecha: '2025-07-22', tipo: 'Sugerencia', estado: 'Cerrado', descripcion: 'Agregar más horarios nocturnos' },
  { id: 3, fecha: '2025-07-25', tipo: 'Problema técnico', estado: 'En proceso', descripcion: 'Fallo en la compra de boletos en línea' }
];

export default function PageIncidenciasSop() {
  const tiposIncidencia = [
    { label: 'Queja', value: 'queja' },
    { label: 'Sugerencia', value: 'sugerencia' },
    { label: 'Problema técnico', value: 'problema' }
  ];

  const [incidencias] = useState(incidenciasMock);

  return (
    <div className="p-4 space-y-6">
      {/* Título */}
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Incidencias y Soporte</h2>

      {/* Barra de búsqueda */}
      <div className="flex gap-2 mb-6">
        <span className="p-input-icon-left w-full md:w-30rem">
          <i className="pi pi-search" />
          <InputText placeholder="Buscar en soporte..." className="w-full" />
        </span>
        <Button icon="pi pi-arrow-right" label="Buscar" />
      </div>

      {/* Categorías */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {categorias.map((cat, index) => (
          <Card
            key={index}
            className="text-center shadow-2 border-round-xl category-card"
          >
            <i className={`${cat.icono} text-4xl text-primary mb-3`}></i>
            <h3 className="text-lg font-semibold mb-2">{cat.titulo}</h3>
            <p className="text-sm text-gray-600">{cat.descripcion}</p>
          </Card>
        ))}
      </div>

      <Divider />

      {/* Formulario para reportar incidencia */}
      <Card title="Reportar una incidencia" className="shadow-2 border-round-xl">
        <div className="p-fluid grid formgrid">
          <div className="field col-12 md:col-6">
            <label htmlFor="nombre">Nombre</label>
            <InputText id="nombre" placeholder="Tu nombre" />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="tipo">Tipo de incidencia</label>
            <Dropdown id="tipo" options={tiposIncidencia} placeholder="Seleccione" />
          </div>

          <div className="field col-12">
            <label htmlFor="descripcion">Descripción</label>
            <InputTextarea
              id="descripcion"
              rows={4}
              placeholder="Describe la incidencia..."
            />
          </div>

          <div className="field col-12 flex justify-end">
            <Button label="Enviar incidencia" icon="pi pi-send" className="p-button-primary" />
          </div>
        </div>
      </Card>

      <Divider />

      {/* Tabla de incidencias del cliente */}
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
