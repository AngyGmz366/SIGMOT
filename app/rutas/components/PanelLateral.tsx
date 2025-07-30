// /components/PanelLateral.tsx
import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { ListBox } from 'primereact/listbox';
import { Card } from 'primereact/card';
import { Ruta } from '../Types/rutas.types';

interface PanelLateralProps {
  rutas: Ruta[];
  onSeleccionarRuta: (ruta: Ruta) => void;
}

const PanelLateral: React.FC<PanelLateralProps> = ({ rutas, onSeleccionarRuta }) => {
  const [filtroTexto, setFiltroTexto] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<string | null>(null);

  const estados = [
    { label: 'Todos', value: null },
    { label: 'Activos', value: 'activo' },
    { label: 'Inactivos', value: 'inactivo' },
  ];

  const rutasFiltradas = rutas.filter(ruta =>
    ruta.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) &&
    (estadoFiltro === null || ruta.estado === estadoFiltro)
  );

  return (
    <Card title="Rutas disponibles" className="h-full shadow-2" style={{ width: '300px' }}>
      <div className="p-fluid">
        <span className="p-input-icon-left mb-3">
          <i className="pi pi-search" />
          <InputText
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            placeholder="Buscar ruta..."
          />
        </span>

        <Dropdown
          value={estadoFiltro}
          options={estados}
          onChange={(e) => setEstadoFiltro(e.value)}
          placeholder="Filtrar por estado"
          className="mb-3"
        />

        <ListBox
  value={null}
  options={rutasFiltradas}
  onChange={(e) => onSeleccionarRuta(e.value)}
  optionLabel="nombre"
  optionValue="id"
  itemTemplate={(ruta) => (
    <div>
      <div><strong>{ruta.nombre}</strong></div>
      <small>{ruta.origen} → {ruta.destino}</small><br />
      <small>🕒 Tiempo estimado: {ruta.tiempoEstimado}</small>
    </div>
  )}
  style={{ width: '100%' }}
/>

      </div>
    </Card>
  );
};

export default PanelLateral;
