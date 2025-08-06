'use client';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { useState } from 'react';
import { Eye } from 'lucide-react';

type TipoReservacion = 'viaje' | 'encomienda';
type EstadoReservacion = 'confirmada' | 'pendiente' | 'cancelada';

interface Reservacion {
  id: string;
  tipo: TipoReservacion;
  ruta: string;
  fecha: Date | string;
  estado: EstadoReservacion;
  // Campos opcionales (ya mostrados en columnas)
  hora?: string;
  asiento?: string;
  peso?: number;
}

interface TablaReservacionesProps {
  reservaciones: Reservacion[];
}

export default function TablaReservaciones({ reservaciones }: TablaReservacionesProps) {
  const [selectedReservation, setSelectedReservation] = useState<Reservacion | null>(null);
  const [visible, setVisible] = useState(false);

  const estadoBodyTemplate = (rowData: Reservacion) => {
    const severityMap: Record<EstadoReservacion, "success" | "warning" | "danger"> = {
      confirmada: "success",
      pendiente: "warning",
      cancelada: "danger"
    };
    return <Tag value={rowData.estado.toUpperCase()} severity={severityMap[rowData.estado]} />;
  };

  const actionBodyTemplate = (rowData: Reservacion) => (
    <button 
      onClick={() => {
        setSelectedReservation(rowData);
        setVisible(true);
      }}
      className="p-button p-button-sm p-button-text text-purple-600 hover:text-purple-800"
      aria-label="Ver detalles"
    >
      <Eye className="w-5 h-5" />
    </button>
  );

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

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
          headerStyle={{ width: '100px' }}
        />
      </DataTable>

      {/* Modal simplificado - Solo muestra datos ya visibles en la tabla */}
      <Dialog 
        header="Detalles de Reservación" 
        visible={visible} 
        style={{ width: '500px' }}
        onHide={() => setVisible(false)}
      >
        {selectedReservation && (
          <div className="space-y-3">
            <p><strong>ID:</strong> {selectedReservation.id}</p>
            <p><strong>Ruta:</strong> {selectedReservation.ruta}</p>
            <p><strong>Fecha:</strong> {formatDate(selectedReservation.fecha)}</p>
            <p><strong>Tipo:</strong> {selectedReservation.tipo}</p>
            <p><strong>Estado:</strong> 
              <Tag 
                value={selectedReservation.estado.toUpperCase()} 
                severity={
                  ({
                    confirmada: "success",
                    pendiente: "warning",
                    cancelada: "danger"
                  } as Record<EstadoReservacion, "success" | "warning" | "danger">)[selectedReservation.estado]
                }
                className="ml-2"
              />
            </p>
            {/* Muestra campos adicionales solo si existen */}
            {selectedReservation.hora && <p><strong>Hora:</strong> {selectedReservation.hora}</p>}
            {selectedReservation.asiento && <p><strong>Asiento:</strong> {selectedReservation.asiento}</p>}
            {selectedReservation.peso && <p><strong>Peso:</strong> {selectedReservation.peso} kg</p>}
          </div>
        )}
      </Dialog>
    </>
  );
}