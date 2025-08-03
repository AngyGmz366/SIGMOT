'use client';

import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Incidencia } from '../types';

interface Props {
  incidencias: Incidencia[];
  onVerDetalle: (incidencia: Incidencia) => void;
  onCambiarEstado: (id: number, nuevoEstado: Incidencia['estado']) => void;
}

const IncidenciasAdminTable: React.FC<Props> = ({ incidencias, onVerDetalle, onCambiarEstado }) => {
  
  const estadoTemplate = (rowData: Incidencia) => {
    const severity =
      rowData.estado === 'Resuelto'
        ? 'success'
        : rowData.estado === 'En Progreso'
        ? 'info'
        : 'warning';
    return (
      <Tag
        value={rowData.estado}
        severity={severity}
        style={{
          fontWeight: 'bold',
          padding: '4px 8px',
          borderRadius: '8px',
          fontSize: '0.85rem'
        }}
      />
    );
  };

  const accionesTemplate = (rowData: Incidencia) => (
    <div className="flex gap-2 justify-center">
      <Button
        icon="pi pi-eye"
        className="p-button-rounded p-button-text"
        style={{ color: '#6a1b9a' }}
        onClick={() => onVerDetalle(rowData)}
        tooltip="Ver Detalle"
      />
      <Button
        icon="pi pi-check"
        className="p-button-rounded p-button-text"
        style={{ color: 'green' }}
        onClick={() => onCambiarEstado(rowData.id, 'Resuelto')}
        tooltip="Marcar como Resuelto"
      />
    </div>
  );

  return (
    <div className="card shadow-2 border-round-xl p-3">
      <DataTable
        value={incidencias}
        paginator
        rows={5}
        responsiveLayout="scroll"
        stripedRows
        emptyMessage="No hay incidencias registradas"
      >
        <Column field="titulo" header="Título" sortable style={{ minWidth: '200px' }} />
        <Column field="categoria" header="Categoría" sortable style={{ minWidth: '150px' }} />
        <Column field="fecha" header="Fecha" sortable style={{ minWidth: '120px' }} />
        <Column header="Estado" body={estadoTemplate} sortable style={{ textAlign: 'center', minWidth: '120px' }} />
        <Column header="Acciones" body={accionesTemplate} style={{ textAlign: 'center', minWidth: '150px' }} />
      </DataTable>
    </div>
  );
};

export default IncidenciasAdminTable;
