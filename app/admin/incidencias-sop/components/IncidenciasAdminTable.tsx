'use client';

import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';

interface Incidencia {
  id: number;
  titulo: string;
  categoria: string;
  descripcion: string;
  fecha: string;
  estado: string;
}

interface Props {
  incidencias: Incidencia[];
  onVerDetalle: (incidencia: Incidencia) => void;
  onCambiarEstado: (id: number, nuevoEstado: string) => void;
}

const IncidenciasAdminTable: React.FC<Props> = ({ incidencias, onVerDetalle, onCambiarEstado }) => {
  const estadoTemplate = (rowData: Incidencia) => {
    const severity =
      rowData.estado === 'Resuelto'
        ? 'success'
        : rowData.estado === 'En Progreso'
        ? 'info'
        : 'warning';
    return <Tag value={rowData.estado} severity={severity} />;
  };

  const accionesTemplate = (rowData: Incidencia) => (
    <div className="flex gap-2">
      <Button icon="pi pi-eye" rounded outlined onClick={() => onVerDetalle(rowData)} tooltip="Ver Detalle" />
      <Button
        icon="pi pi-check"
        rounded
        outlined
        severity="success"
        onClick={() => onCambiarEstado(rowData.id, 'Resuelto')}
        tooltip="Marcar como Resuelto"
      />
    </div>
  );

  return (
    <DataTable value={incidencias} paginator rows={5} responsiveLayout="scroll">
      <Column field="titulo" header="Título" sortable />
      <Column field="categoria" header="Categoría" sortable />
      <Column field="fecha" header="Fecha" sortable />
      <Column header="Estado" body={estadoTemplate} sortable />
      <Column header="Acciones" body={accionesTemplate} />
    </DataTable>
  );
};

export default IncidenciasAdminTable;
