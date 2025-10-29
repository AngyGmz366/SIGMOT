'use client';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { useState } from 'react';
import { Eye, CreditCard } from 'lucide-react';
import './TablaReservaciones.css';

type TipoReservacion = 'viaje' | 'encomienda';
type EstadoReservacion = 'confirmada' | 'pendiente' | 'cancelada';

interface Reservacion {
  id: string;
  tipo: TipoReservacion;
  ruta: string;
  unidad?: string;
  asiento?: string;
  fecha: Date | string;
  estado: EstadoReservacion;
  hora?: string;
  peso?: number;
}

interface TablaReservacionesProps {
  reservaciones: Reservacion[];
}

export default function TablaReservaciones({ reservaciones }: TablaReservacionesProps) {
  const [selectedReservation, setSelectedReservation] = useState<Reservacion | null>(null);
  const [visibleDetails, setVisibleDetails] = useState(false);
  const [visiblePago, setVisiblePago] = useState(false);
  const [modoPago, setModoPago] = useState<'confirmar' | 'cancelar' | null>(null);
  const [comentario, setComentario] = useState('');
  const [metodoPago, setMetodoPago] = useState<number | null>(null);

  const metodosPago = [
    { label: 'Efectivo', value: 1 },
    { label: 'Tarjeta', value: 2 },
    { label: 'Transferencia', value: 3 },
  ];

  const estadoBodyTemplate = (rowData: Reservacion) => {
    const severityMap: Record<EstadoReservacion, 'success' | 'warning' | 'danger'> = {
      confirmada: 'success',
      pendiente: 'warning',
      cancelada: 'danger',
    };
    return <Tag value={rowData.estado.toUpperCase()} severity={severityMap[rowData.estado]} />;
  };

  const actionBodyTemplate = (rowData: Reservacion) => (
    <div className="flex gap-2 justify-content-center">
      {/* Ver detalles */}
      <Button
        icon={<Eye className="w-4 h-4" />}
        text
        className="text-indigo-500 hover:text-indigo-700"
        onClick={() => {
          setSelectedReservation(rowData);
          setVisibleDetails(true);
        }}
        tooltip="Ver detalles"
      />

      {/* Botón de pago - solo si pendiente */}
      {rowData.estado === 'pendiente' && (
        <Button
          icon={<CreditCard className="w-4 h-4" />}
          text
          className="text-green-600 hover:text-green-800"
          tooltip="Confirmar / Pagar"
          onClick={() => {
            setSelectedReservation(rowData);
            setVisiblePago(true);
            setModoPago(null);
            setComentario('');
            setMetodoPago(null);
          }}
        />
      )}
    </div>
  );

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  return (
    <>
      <DataTable
        value={reservaciones}
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 20]}
        emptyMessage="No se encontraron reservaciones"
        className="shadow-sm"
      >
        <Column field="id" header="ID" sortable />
        <Column field="ruta" header="Ruta" sortable />
        <Column field="unidad" header="Unidad" sortable />
        <Column
          field="asiento"
          header="Asiento"
          body={(row) => (row.tipo === 'viaje' ? row.asiento ?? '-' : '-')}
        />
        <Column
          field="fecha"
          header="Fecha"
          body={(row) => formatDate(row.fecha)}
          sortable
        />
        <Column field="tipo" header="Tipo" sortable />
        <Column
          field="estado"
          header="Estado"
          body={estadoBodyTemplate}
          sortable
        />
        <Column
          header="Acciones"
          body={actionBodyTemplate}
          headerStyle={{ width: '140px', textAlign: 'center' }}
        />
      </DataTable>

      {/* 🟣 Modal de detalles */}
      <Dialog
        header="Detalles de Reservación"
        visible={visibleDetails}
        style={{ width: '450px', height: '500px', maxHeight: '80vh' }}
        onHide={() => setVisibleDetails(false)}
      >
        {selectedReservation && (
          <div className="space-y-3">
            <p><strong>ID:</strong> {selectedReservation.id}</p>
            <p><strong>Ruta:</strong> {selectedReservation.ruta}</p>
            <p><strong>Unidad:</strong> {selectedReservation.unidad ?? '-'}</p>
            {selectedReservation.tipo === 'viaje' && (
              <p><strong>Asiento:</strong> {selectedReservation.asiento ?? '-'}</p>
            )}
            <p><strong>Fecha:</strong> {formatDate(selectedReservation.fecha)}</p>
            <p><strong>Tipo:</strong> {selectedReservation.tipo}</p>
            <p>
              <strong>Estado:</strong>
              <Tag
                value={selectedReservation.estado.toUpperCase()}
                severity={
                  ({
                    confirmada: 'success',
                    pendiente: 'warning',
                    cancelada: 'danger',
                  } as Record<EstadoReservacion, 'success' | 'warning' | 'danger'>)[
                    selectedReservation.estado
                  ]
                }
                className="ml-2"
              />
            </p>
            {selectedReservation.peso && (
              <p><strong>Peso:</strong> {selectedReservation.peso} kg</p>
            )}
          </div>
        )}
      </Dialog>

      {/* 💳 Modal de confirmación / cancelación */}
<Dialog

  header="Confirmar o Cancelar Reservación"
  visible={visiblePago}
  style={{ width: '600px', maxWidth: '90vw' }}
  modal
  onHide={() => setVisiblePago(false)}
>

  {!modoPago && (
    <div className="flex flex-col gap-3">
      <p className="text-gray-700 text-sm mb-3">
        ¿Qué desea hacer con la reservación{' '}
        <b>{selectedReservation?.id}</b>?
      </p>
      <div className="flex justify-end gap-2">
        {/* Botón Atrás */}
        <Button
          label="Atrás"
          icon="pi pi-arrow-left"
          text
          className="p-button-sm text-gray-600 hover:text-gray-800"
          onClick={() => setVisiblePago(false)}
        />

        {/* Botón Cancelar */}
        <Button
          label="Cancelar"
          icon="pi pi-times"
          className="p-button-danger p-button-sm font-medium"
          onClick={() => setModoPago('cancelar')}
        />

        {/* Botón Confirmar / Pagar */}
        <Button
          label="Confirmar / Pagar"
          icon="pi pi-credit-card"
          className="p-button-success p-button-sm font-medium"
          onClick={() => setModoPago('confirmar')}
        />
      </div>
    </div>
  )}

  {/* 🟥 Modo cancelar */}
{modoPago === 'cancelar' && (
  <div className="cancel-form-container flex flex-col gap-4">
    <p className="text-gray-700 text-sm">
      Indique el motivo de la cancelación:
    </p>


    <div className="flex flex-col items-center">
      <InputTextarea
        value={comentario}
        onChange={(e) => {
          if (e.target.value.length <= 200) {
            setComentario(e.target.value);
          }
        }}
        placeholder="Escriba su motivo aquí (máximo 200 caracteres)..."
        rows={8}
        autoResize={false}
        className="w-full md:w-10/12 text-sm p-3 border border-gray-300 rounded-lg focus:border-indigo-400 resize-none"
      />
      <div className="flex justify-end w-full md:w-10/12 mt-1 text-xs text-gray-500">
        <span>{comentario.length}/200 caracteres</span>
      </div>
    </div>


    <div className="flex justify-center gap-3 mt-4">
      <Button
        label="Atrás"
        icon="pi pi-arrow-left"
        text
        className="btn-sm text-gray-600 hover:text-gray-800"
        onClick={() => setModoPago(null)}
      />
      <Button
        label="Enviar cancelación"
        icon="pi pi-times"
        className="p-button-danger btn-sm font-medium"
        disabled={!comentario.trim()}
        onClick={() => {
          alert(`Cancelada con comentario: ${comentario}`);
          setVisiblePago(false);
        }}
      />
    </div>
  </div>
)}


  {/* 🟩 Modo confirmar / pago */}
  {modoPago === 'confirmar' && (
    <div className="flex flex-col gap-3">
      <p className="text-gray-700 text-sm mb-2">
        Seleccione el método de pago para confirmar su reservación:
      </p>
      <Dropdown
        value={metodoPago}
        options={metodosPago}
        onChange={(e) => setMetodoPago(e.value)}
        placeholder="Método de pago"
        className="w-full"
      />
      <div className="flex justify-end gap-2">
        <Button
          label="Atrás"
          icon="pi pi-arrow-left"
          text
          className="p-button-sm text-gray-600 hover:text-gray-800"
          onClick={() => setModoPago(null)}
        />
        <Button
          label="Confirmar pago"
          icon="pi pi-check"
          className="p-button-success p-button-sm font-medium"
          disabled={!metodoPago}
          onClick={() => {
            alert(`Reservación confirmada con método #${metodoPago}`);
            setVisiblePago(false);
          }}
        />
      </div>
    </div>
  )}
  </Dialog>
    </>
  );
}