'use client';

import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { ReservacionBase } from './types';

export default function ActionsColumn({
  row,
  onEdit,
  onDelete,
  disabled = false,
}: {
  row: ReservacionBase;
  onEdit: (reserva: ReservacionBase) => void;
  onDelete: (id: string) => void;
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

  return (
    <div
      className="
        flex flex-wrap gap-2 justify-content-center
        md:justify-content-start
        align-items-center
      "
      style={{ zIndex: 5 }} // evita que se oculte tras overlays
    >
      {/* Tooltip embebido para no perder referencia al hacer re-render */}
      <Button
        icon="pi pi-pencil"
        rounded
        text
        severity="secondary"
        size="small"
        tooltip="Editar reservación"
        tooltipOptions={{ position: 'top' }}
        onClick={() => onEdit(row)}
        disabled={disabled}
        className="action-btn"
      />

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
    </div>
  );
}
