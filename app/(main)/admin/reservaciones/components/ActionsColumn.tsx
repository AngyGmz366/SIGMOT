'use client';

import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { ReservacionBase } from './types';

export default function ActionsColumn({
  row,
  onEdit,
  onDelete,
  onStatusChange,
  disabled = false,
}: {
  row: ReservacionBase;
  onEdit: (reserva: ReservacionBase) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (reserva: ReservacionBase) => void;
  disabled?: boolean;
}) {
  const confirmDelete = () => {
    confirmDialog({
      message: `¿Desea eliminar la ${row.tipo === 'viaje' ? 'reservación de viaje' : 'encomienda'} de ${row.cliente}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      accept: () => row.id && onDelete(row.id),
    });
  };
  
  const showStatusButton = row.tipo === 'encomienda' && onStatusChange;
  const isEncomienda = row.tipo === 'encomienda';
  const isViaje = row.tipo === 'viaje';

  return (
    <div className="flex flex-wrap gap-2 justify-content-center md:justify-content-start align-items-center" style={{ zIndex: 5 }}>
      <Button
        icon="pi pi-pencil"
        rounded text
        severity="secondary"
        size="small"
        tooltip="Editar reservación"
        tooltipOptions={{ position: 'top' }}
        onClick={() => onEdit(row)}
        disabled={disabled}
        className="action-btn"
      />

      {isEncomienda && onStatusChange && (
        <Button
          icon="pi pi-sync"
          rounded
          text
          severity="info"
          size="small"
          tooltip="Cambiar estado de encomienda"
          tooltipOptions={{ position: 'top' }}
          onClick={() => onStatusChange(row)}
          disabled={disabled}
          className="action-btn"
        />
      )}

      {isViaje && (
        <Button
          icon="pi pi-trash"
          rounded
          text
          severity="danger"
          size="small"
          tooltip="Eliminar reservación"
          tooltipOptions={{ position: 'top' }}
          onClick={confirmDelete}
          disabled={disabled}
          className="action-btn"
        />
      )}
    </div>
  );
}