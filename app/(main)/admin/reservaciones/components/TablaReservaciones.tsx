import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import ActionsColumn from './ActionsColumn';
import { ReservacionBase } from './types';
import { useState } from 'react';

export default function TablaReservaciones({ 
  reservaciones, 
  onEdit, 
  onDelete, 
  onAdd 
}: {
  reservaciones: ReservacionBase[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}) {
  const [selectedReservation, setSelectedReservation] = useState<ReservacionBase | null>(null);
  const [globalFilter, setGlobalFilter] = useState<string | null>(null);

  return (
    <div className="card">
      <ConfirmDialog />
      <div className="flex justify-content-between align-items-center mb-4">
        <h2>Reservaciones</h2>
        <div className="flex gap-2">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText 
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar por nombre"
            />
          </span>
          <Button 
            label="Nueva Reservación" 
            icon="pi pi-plus" 
            className="p-button-success"
            onClick={onAdd}
          />
        </div>
      </div>

      <DataTable
        value={reservaciones}
  selection={selectedReservation}
  onSelectionChange={(e) => setSelectedReservation(e.value as ReservacionBase)}
  selectionMode="single"
  dataKey="id"
  globalFilter={globalFilter}
  sortField="fecha"
  sortOrder={-1}
  paginator
  rows={10}
  emptyMessage="No hay reservaciones registradas"
      >
        <Column selectionMode="single" headerStyle={{ width: '3rem' }}></Column>
        <Column field="id" header="ID" sortable></Column>
        <Column field="cliente" header="Cliente" sortable></Column>
        <Column 
          field="tipo" 
          header="Tipo" 
          body={(row) => (
            <span className={`tipo-${row.tipo}`}>
              {row.tipo === 'viaje' ? '🚌 Viaje' : '📦 Encomienda'}
            </span>
          )}
        ></Column>
        <Column field="ruta" header="Ruta" sortable></Column>
        <Column field="unidad" header="Unidad" sortable></Column>
        <Column 
          field="estado" 
          header="Estado" 
          body={(row) => (
            <span className={`estado-${row.estado.toLowerCase()}`}>
              {row.estado}
            </span>
          )}
          sortable
        ></Column>
        <Column 
          header="Acciones" 
          body={(row) => (
            <ActionsColumn 
              row={row} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          )}
        ></Column>
      </DataTable>
    </div>
  );
}
