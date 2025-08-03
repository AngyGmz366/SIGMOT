'use client';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import Link from 'next/link';

type TipoReservacion = 'viaje' | 'encomienda';
type EstadoReservacion = 'confirmada' | 'pendiente' | 'cancelada';

interface Reservacion {
  id: string;
  tipo: TipoReservacion;
  ruta: string;
  fecha: Date | string;
  hora?: string;
  asiento?: string;
  peso?: number;
  estado: EstadoReservacion;
}

interface TablaReservacionesProps {
  reservaciones: Reservacion[];
}

export default function TablaReservaciones({ reservaciones }: TablaReservacionesProps) {
  const estadoBodyTemplate = (rowData: Reservacion) => {
    const severityMap: Record<EstadoReservacion, "success" | "warning" | "danger"> = {
      confirmada: "success",
      pendiente: "warning",
      cancelada: "danger"
    };

    return <Tag value={rowData.estado.toUpperCase()} severity={severityMap[rowData.estado]} />;
  };

  const actionBodyTemplate = (rowData: Reservacion) => {
    return (
      <Link 
        href={`/main/cliente/reservacion/mis-reservaciones/${rowData.id}`}
        className="p-button p-button-sm p-button-text"
        passHref
      >
        Ver detalle
      </Link>
    );
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
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
        headerStyle={{ width: '120px' }}
      />
    </DataTable>
  );
}