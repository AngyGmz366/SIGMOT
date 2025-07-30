import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import ActionsColumn from './ActionsColumn';
import { ReservacionBase } from './types';

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
  // Datos de ejemplo para unidades (pueden venir de una API)
  const unidades = [
    { codigo: 'BUS-001', modelo: 'Mercedes Benz' },
    { codigo: 'BUS-002', modelo: 'Volvo' },
    { codigo: 'BUS-003', modelo: 'Scania' }
  ];

  return (
    <div className="card">
      <ConfirmDialog />
      <div className="flex justify-content-between mb-4">
        <h2>Reservaciones</h2>
        <Button 
          label="Nueva Reservación" 
          icon="pi pi-plus" 
          className="p-button-primary"
          onClick={onAdd}
        />
      </div>

      <DataTable
        value={reservaciones}
        sortField="fecha"
        sortOrder={-1}
        paginator
        rows={10}
        emptyMessage="No hay reservaciones registradas"
      >
        <Column field="id" header="ID" sortable></Column>
        <Column field="cliente" header="Cliente" sortable></Column>
        <Column field="tipo" header="Tipo" body={(row) => (
          <span className={`tipo-${row.tipo}`}>
            {row.tipo === 'viaje' ? '🚌 Viaje' : '📦 Encomienda'}
          </span>
        )}></Column>
        <Column field="ruta" header="Ruta" sortable></Column>
        <Column field="unidad" header="Unidad" body={(row) => (
          <span>
            {row.unidad} {/* Puedes mostrar más detalles si lo necesitas */}
          </span>
        )} sortable></Column>
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