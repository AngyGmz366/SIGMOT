import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { ReservacionBase } from './types';
import { Tooltip } from 'primereact/tooltip';

export default function ActionsColumn({
  row,
  onEdit,
  onDelete,
  disabled = false,
}: {
  row: ReservacionBase;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}) {
  const confirmDelete = () => {
    confirmDialog({
      message: `¿Desea eliminar la ${row.tipo === 'viaje' ? 'reservación de viaje' : 'encomienda'} de ${row.cliente}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      accept: () => row.id && onDelete(row.id),
    });
  };

  return (
    <div className="flex gap-2 justify-content-center">
      <Tooltip target=".btn-edit" content="Editar reservación" position="top" />
      <Tooltip target=".btn-delete" content="Eliminar reservación" position="top" />

      <Button
        icon="pi pi-pencil"
        className="btn-edit"
        rounded
        text
        severity="secondary"
        onClick={() => row.id && onEdit(row.id)}
        disabled={disabled}
      />
      <Button
        icon="pi pi-trash"
        className="btn-delete"
        rounded
        text
        severity="danger"
        onClick={confirmDelete}
        disabled={disabled}
      />
    </div>
  );
}
