'use client';

import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { confirmDialog } from 'primereact/confirmdialog';
import { ReservacionEncomienda } from './types';
import { useState, useEffect } from 'react';

type FormEstadoProps = {
  visible: boolean;
  encomienda: ReservacionEncomienda | null;
  onSave: (idReserva: string, nuevoEstado: number) => void;
  onCancel: () => void;
};

const estadosEncomienda = [
  { label: 'EN CAMINO', value: 1 },
  { label: 'ENTREGADA', value: 3 },
  { label: 'CANCELADA', value: 4 }
];

export default function FormEstadoEncomienda({ 
  visible, 
  encomienda, 
  onSave, 
  onCancel 
}: FormEstadoProps) {
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && encomienda) {
      setEstadoSeleccionado(encomienda.idEstadoEncomienda || 1);
    } else {
      setEstadoSeleccionado(null);
    }
    setLoading(false);
  }, [visible, encomienda]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!encomienda?.id || !estadoSeleccionado) return;

    if (estadoSeleccionado === 3) {
      confirmDialog({
        message: '¿Confirma que el paquete fue entregado a la persona responsable?',
        header: 'Confirmar Entrega',
        icon: 'pi pi-check-circle',
        acceptLabel: 'Sí, confirmar entrega',
        rejectLabel: 'Cancelar',
        accept: () => executeSave(),
      });
    } else if (estadoSeleccionado === 4) {
      confirmDialog({
        message: '¿Está seguro de cancelar esta encomienda? Esta acción afectará la reservación y se marcará como cancelada por motivos administrativos.',
        header: 'Confirmar Cancelación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí, cancelar',
        rejectLabel: 'Volver',
        acceptClassName: 'p-button-danger',
        accept: () => executeSave(),
      });
    } else {
      executeSave();
    }
  };

  const executeSave = async () => {
    setLoading(true);
    try {
      await onSave(encomienda!.id!, estadoSeleccionado!);
      onCancel();
    } finally {
      setLoading(false);
    }
  };

  const getEstadoActual = () => {
    if (!encomienda?.estadoEncomienda) return 'No especificado';
    return estadosEncomienda.find(e => e.value === encomienda.idEstadoEncomienda)?.label || encomienda.estadoEncomienda;
  };

  return (
    <Dialog
      header="Cambiar Estado de Encomienda"
      visible={visible}
      onHide={onCancel}
      className="w-11 md:w-6 lg:w-4"
      modal
    >
      <form onSubmit={handleSubmit} className="p-fluid grid gap-3">
        <div className="col-12">
          <div className="field">
            <label className="font-semibold block mb-1">Cliente:</label>
            <p className="text-color-secondary">{encomienda?.cliente || 'No disponible'}</p>
          </div>
        </div>

        <div className="col-12">
          <div className="field">
            <label className="font-semibold block mb-1">Estado actual:</label>
            <p className="text-color-secondary">{getEstadoActual()}</p>
          </div>
        </div>

        <div className="col-12">
          <div className="field">
            <label htmlFor="nuevoEstado" className="font-semibold block mb-2">
              Nuevo estado: *
            </label>
            <Dropdown
              id="nuevoEstado"
              value={estadoSeleccionado}
              options={estadosEncomienda}
              onChange={(e) => setEstadoSeleccionado(e.value)}
              placeholder="Seleccionar estado"
              className="w-full"
              required
            />
          </div>
        </div>

        <div className="col-12 flex justify-content-end gap-2 mt-3">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            onClick={onCancel}
            type="button"
            className="p-button-text p-button-sm w-full md:w-auto"
            disabled={loading}
          />
          <Button
            label={loading ? "Guardando..." : "Cambiar Estado"}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
            type="submit"
            className="p-button-sm w-full md:w-auto"
            disabled={loading || !estadoSeleccionado}
          />
        </div>
      </form>
    </Dialog>
  );
}