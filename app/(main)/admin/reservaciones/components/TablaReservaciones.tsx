'use client';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import { useState } from 'react';
import { ReservacionBase } from './types';

export default function TablaReservaciones({ 
  reservaciones, 
  onDelete, 
  onAdd 
}: {
  reservaciones: ReservacionBase[];
  onDelete: (id: string) => void;
  onAdd: () => void;
}) {
  const [selectedReservation, setSelectedReservation] = useState<ReservacionBase | null>(null);
  const [globalFilter, setGlobalFilter] = useState<string>('');

  // Activar / desactivar botones según la selección
  const isRowSelected = !!selectedReservation;

  return (
    <div className="card">
      <ConfirmDialog />
      <div className="flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Reservaciones</h2>
        <div className="flex gap-2 align-items-center">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar por cliente o ruta"
            />
          </span>
          <Button
            label="Nueva Reservación"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={onAdd}
          />
          {/* Quitar el botón de editar */}
          {/* <Button
            label="Editar"
            icon="pi pi-pencil"
            className="p-button-warning"
            onClick={() => selectedReservation?.id && onEdit(selectedReservation.id)}
            disabled={!isRowSelected}
          /> */}
          <Button
            label="Eliminar"
            icon="pi pi-trash"
            className="p-button-danger"
            onClick={() => selectedReservation?.id && onDelete(selectedReservation.id)}
            disabled={!isRowSelected}
          />
        </div>
      </div>

      <DataTable
        value={reservaciones}
        selection={selectedReservation}
        onSelectionChange={(e) => setSelectedReservation(e.value as ReservacionBase)}
        selectionMode="single" // si prefieres checkbox múltiple, cámbialo por "checkbox"
        dataKey="id"
        globalFilter={globalFilter}
        paginator
        rows={10}
        sortField="fecha"
        sortOrder={-1}
        emptyMessage="No hay reservaciones registradas"
        responsiveLayout="scroll"
        showGridlines
        stripedRows
      >
        {/* ✅ Checkbox de selección */}
        <Column
          selectionMode="single"
          headerStyle={{ width: '3rem' }}
          bodyStyle={{ textAlign: 'center' }}
        ></Column>

        <Column field="id" header="ID" sortable style={{ width: '5rem' }}></Column>
        <Column field="cliente" header="Cliente" sortable></Column>

        <Column
          field="tipo"
          header="Tipo"
          body={(row) => (
            <span className={`font-semibold ${row.tipo === 'viaje' ? 'text-blue-500' : 'text-orange-500'}`}>
              {row.tipo === 'viaje' ? '🚌 Viaje' : '📦 Encomienda'}
            </span>
          )}
          sortable
          style={{ width: '10rem' }}
        ></Column>

        <Column field="ruta" header="Ruta" sortable></Column>
        <Column field="unidad" header="Unidad" sortable></Column>

        {/* 🆕 Nueva columna Asiento / Costo */}
        <Column
          field="asiento_peso"
          header="Asiento / Costo"
          body={(row) => (
            <span className="text-gray-700">
              {row.asiento_peso ?? '-'}
            </span>
          )}
          sortable
          style={{ width: '10rem' }}
        ></Column>

        <Column
          field="estado"
          header="Estado"
          body={(row) => (
            <span
              className={`estado-${row.estado.toLowerCase()} font-semibold $ {
                row.estado === 'confirmada'
                  ? 'text-green-600'
                  : row.estado === 'pendiente'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {row.estado.charAt(0).toUpperCase() + row.estado.slice(1)}
            </span>
          )}
          sortable
          style={{ width: '9rem', textAlign: 'center' }}
        ></Column>

        {/* 🔧 Columna Acciones (opcional si mantienes los botones arriba) */}
        <Column
          header="Acciones"
          body={(row) => (
            <span> {/* Columna de acciones se puede dejar vacía si ya se tienen los botones arriba */}
              {/* No se requiere edición ya que ya está eliminado */}
            </span>
          )}
          exportable={false}
          style={{ width: '8rem', textAlign: 'center' }}
        ></Column>
      </DataTable>
    </div>
  );
}
