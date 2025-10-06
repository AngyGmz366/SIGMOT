'use client';

import React from 'react';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import type { Incidencia } from '../page';

interface Props {
  incidencias: Incidencia[];
  onVerDetalle: (i: Incidencia) => void;
  onCambiarEstado: (id: number, estado: Incidencia['estado']) => void;
}

const IncidenciasAdminTable: React.FC<Props> = ({
  incidencias,
  onVerDetalle,
  onCambiarEstado,
}) => {
  const estadoTemplate = (row: Incidencia) => {
    const color =
      row.estado === 'Pendiente'
        ? 'warning'
        : row.estado === 'En Progreso'
        ? 'info'
        : 'success';
    return <Tag value={row.estado} severity={color as any} />;
  };

  const accionesTemplate = (row: Incidencia) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-eye"
        rounded
        text
        severity="info"
        aria-label="Ver detalle"
        onClick={() => onVerDetalle(row)}
      />
      {row.estado !== 'Resuelto' && (
        <Button
          icon="pi pi-check"
          rounded
          text
          severity="success"
          aria-label="Marcar Resuelto"
          onClick={() => onCambiarEstado(row.id, 'Resuelto')}
        />
      )}
    </div>
  );

  return (
    <DataTable value={incidencias} paginator rows={10} responsiveLayout="scroll">
      <Column field="id" header="ID" sortable />
      <Column field="titulo" header="Título" sortable />
      <Column field="categoria" header="Categoría" />
      <Column field="descripcion" header="Descripción" />
      <Column field="fecha" header="Fecha" />
      <Column field="estado" header="Estado" body={estadoTemplate} />
      <Column header="Acciones" body={accionesTemplate} />
    </DataTable>
  );
};

export default IncidenciasAdminTable;
