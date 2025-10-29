'use client';

import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

type Props = {
  incidencias: any[];
  onResponder: (rowData: any) => void;
};

export default function ListaIncidenciasAdmin({ incidencias, onResponder }: Props) {
  // 🔹 Etiqueta de estado con colores
  const estadoTemplate = (rowData: any) => {
    const estado = rowData.Estado_Actual?.toUpperCase() || '';
    const color =
      estado === 'ABIERTO'
        ? 'info'
        : estado === 'EN_PROCESO'
        ? 'warning'
        : estado === 'CANCELADO'
        ? 'secondary'
        : 'success';
    return <Tag value={estado} severity={color as any} />;
  };

  // 🔹 Botón de acciones por fila
  const accionesTemplate = (rowData: any) => (
    <Button
      label="Responder"
      icon="pi pi-reply"
      className="p-button-rounded p-button-primary"
      onClick={() => {
        console.log('📦 Incidencia seleccionada:', rowData);
        onResponder(rowData); // ✅ Enviamos toda la fila al modal
      }}
    />
  );

  return (
    <DataTable
      value={incidencias}
      paginator
      rows={8}
      className="datatable-responsive table-incidencias"
      emptyMessage="No hay incidencias registradas."
      responsiveLayout="scroll"
    >
      <Column field="Id_Incidencia" header="#" style={{ width: '60px' }} />
      <Column field="Usuario" header="Usuario" sortable />
      <Column field="Tipo_Incidencia" header="Tipo" sortable />
      <Column field="Asunto" header="Asunto" sortable />
      <Column field="Descripcion" header="Descripción" />
      <Column field="Estado_Actual" header="Estado" body={estadoTemplate} sortable />
      <Column header="Acciones" body={accionesTemplate} style={{ width: '160px', textAlign: 'center' }} />
    </DataTable>
  );
}
