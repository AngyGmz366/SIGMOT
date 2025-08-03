import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { ReservacionBase } from './types';

export default function ActionsColumn({ row, onEdit, onDelete, disabled }: {
  row: ReservacionBase;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}) {
  const confirmDelete = () => {
    confirmDialog({
      message: `¿Eliminar ${row.tipo === 'viaje' ? 'viaje' : 'encomienda'} de ${row.cliente}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => onDelete(row.id),
    });
  };

  return (
    <div className="flex gap-2">
      <Button 
        icon="pi pi-pencil" 
        rounded 
        text 
        severity="secondary"
        onClick={() => onEdit(row.id)}
      />
      <Button 
        icon="pi pi-trash" 
        rounded 
        text 
        severity="danger"
        onClick={confirmDelete}
      />
    </div>
  );
}