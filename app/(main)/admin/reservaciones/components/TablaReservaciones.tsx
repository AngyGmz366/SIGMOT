'use client';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import { useState, useRef } from 'react';
import { ReservacionBase } from './types';
import ActionsColumn from './ActionsColumn';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import FormEstadoEncomienda from './FormEstadoEncomienda';

export default function TablaReservaciones({
  reservaciones,
  onDelete,
  onAdd,
}: {
  reservaciones: ReservacionBase[];
  onDelete: (id: string) => void;
  onAdd: (reserva?: ReservacionBase) => void;
}) {
  const [selectedReservation, setSelectedReservation] = useState<ReservacionBase | null>(null);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [mostrarFormEstado, setMostrarFormEstado] = useState(false);
  const [encomiendaSeleccionada, setEncomiendaSeleccionada] = useState<ReservacionBase | null>(null);
  const toast = useRef<Toast>(null);

  const isRowSelected = !!selectedReservation;

  const abrirFormEstado = (reserva: ReservacionBase) => {
  setEncomiendaSeleccionada(reserva);
  setMostrarFormEstado(true);
};

  const manejarGuardarEstado = async (idReserva: string, nuevoEstado: number) => {
    try {
      const res = await axios.put(`/api/reservas/${idReserva}/estado`, {
        estado_id: nuevoEstado,
      });

      if (res.data.ok) {
        toast.current?.show({
          severity: 'success',
          summary: 'Estado actualizado',
          detail: 'La encomienda fue actualizada correctamente.',
          life: 3000,
        });
        setMostrarFormEstado(false);
        setEncomiendaSeleccionada(null);
        // 🔁 refrescar la lista
        window.location.reload(); // o llama aquí tu función cargarReservas()
      } else {
        throw new Error(res.data.error || 'No se pudo actualizar.');
      }
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail:
          error.response?.data?.error || 'No se pudo cambiar el estado.',
        life: 4000,
      });
    }
  };

  return (
    <div className="card">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* 🔹 Encabezado adaptativo */}
      <div className="flex flex-column md:flex-row justify-content-between align-items-center gap-3 mb-4">
        <h2 className="text-center md:text-left text-xl md:text-2xl font-semibold">
          Gestión de Reservaciones
        </h2>

        <div className="flex flex-column sm:flex-row gap-2 align-items-center w-full md:w-auto">
          <span className="p-input-icon-left w-full sm:w-auto">
            <i className="pi pi-search" />
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar por cliente o ruta"
              className="w-full sm:w-14rem"
            />
          </span>

          {/* 🔸 Botón más pequeño sin cambiar color */}
          <Button
            label="Nueva Reservación"
            icon="pi pi-plus"
            className="p-button-success p-button-sm"
            onClick={() => onAdd()}
          />

          <Button
            label="Eliminar"
            icon="pi pi-trash"
            className="p-button-danger p-button-sm"
            onClick={() => selectedReservation?.id && onDelete(selectedReservation.id)}
            disabled={!isRowSelected}
          />
        </div>
      </div>

      {/* 🔹 Tabla responsive */}
      <DataTable
        value={reservaciones}
        selection={selectedReservation}
        onSelectionChange={(e) => setSelectedReservation(e.value as ReservacionBase)}
        selectionMode="single"
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
            <span
              className={`font-semibold ${
                row.tipo === 'viaje' ? 'text-blue-500' : 'text-orange-500'
              }`}
            >
              {row.tipo === 'viaje' ? '🚌 Viaje' : '📦 Encomienda'}
            </span>
          )}
          sortable
          style={{ width: '10rem' }}
        ></Column>

        <Column field="ruta" header="Ruta" sortable></Column>
        <Column field="unidad" header="Unidad" sortable></Column>

        <Column
          field="asiento_peso"
          header="Asiento / Costo"
          body={(row) => <span className="text-gray-700">{row.asiento_peso ?? '-'}</span>}
          sortable
          style={{ width: '10rem' }}
        ></Column>

        <Column
          field="estado"
          header="Estado"
          body={(row) => (
            <span
              className={`estado-${row.estado?.toLowerCase()} font-semibold ${
                row.estado === 'confirmada'
                  ? 'text-green-600'
                  : row.estado === 'pendiente'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {row.estado?.charAt(0).toUpperCase() + row.estado?.slice(1)}
            </span>
          )}
          sortable
          style={{ width: '9rem', textAlign: 'center' }}
        ></Column>

        {/* 🔹 Columna de acciones funcional */}
        <Column
          header="Acciones"
          body={(row) => (
            <ActionsColumn
              row={{
                ...row,
                tipo: row.tipo?.toLowerCase(), // 👈 normaliza VIAJE / ENCOMIENDA
              }}
              onEdit={(reserva) => onAdd(reserva)}
              onDelete={(id) => onDelete(id)}
              onStatusChange={abrirFormEstado}
              />
            )}
          exportable={false}
          style={{ width: '8rem', textAlign: 'center' }}
        ></Column>
      </DataTable>
      <FormEstadoEncomienda
        visible={mostrarFormEstado}
        encomienda={encomiendaSeleccionada as any}
        onSave={manejarGuardarEstado}
        onCancel={() => setMostrarFormEstado(false)}
      />
    </div>
  );
}
