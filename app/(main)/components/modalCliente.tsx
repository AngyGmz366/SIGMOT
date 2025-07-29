'use client';

import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Cliente } from '@/types/persona';

interface Props {
  visible: boolean;
  onHide: () => void;
  onSave: () => void;
  cliente: Cliente;
  setCliente: (c: Cliente) => void;
  personas: { label: string; value: string }[];
  submitted: boolean;
}

export default function ClienteModal({
  visible,
  onHide,
  onSave,
  cliente,
  setCliente,
  personas,
  submitted
}: Props) {
  const estados = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];

  return (
    <Dialog
      header="Cliente"
      visible={visible}
      modal
      style={{ width: '600px' }}
      onHide={onHide}
      className="p-fluid"
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Cancelar" icon="pi pi-times" onClick={onHide} outlined />
          <Button label="Guardar" icon="pi pi-check" onClick={onSave} />
        </div>
      }
    >
      <div className="formgrid grid">
        {/* Persona */}
        <div className="field col-12">
          <label className="font-semibold">Persona*</label>
          <Dropdown
            value={cliente.idPersona}
            options={personas}
            onChange={e => setCliente({ ...cliente, idPersona: e.value })}
            placeholder="Selecciona persona"
            className={submitted && !cliente.idPersona ? 'p-invalid' : ''}
          />
          {submitted && !cliente.idPersona && <small className="p-error">Persona es requerida.</small>}
        </div>

        {/* Estado */}
        <div className="field col-12 md:col-6">
          <label className="font-semibold">Estado*</label>
          <Dropdown
            value={cliente.estado}
            options={estados}
            onChange={e => setCliente({ ...cliente, estado: e.value })}
            placeholder="Selecciona estado"
            className={submitted && cliente.estado === undefined ? 'p-invalid' : ''}
          />
          {submitted && cliente.estado === undefined && <small className="p-error">Requerido.</small>}
        </div>

        {/* Observaciones */}
        <div className="field col-12">
          <label className="font-semibold">Observaciones</label>
          <InputTextarea
            rows={3}
            value={cliente.observaciones}
            onChange={e => setCliente({ ...cliente, observaciones: e.target.value })}
          />
        </div>

        {/* Historial de viajes */}
        <div className="field col-12">
          <label className="font-semibold">Historial de viajes</label>
          <InputTextarea
            rows={3}
            value={cliente.historialViajes?.join('\n')}
            onChange={e =>
              setCliente({ ...cliente, historialViajes: e.target.value.split('\n') })
            }
            placeholder="Ingrese un viaje por línea"
          />
        </div>

        {/* Historial de pagos */}
        <div className="field col-12">
          <label className="font-semibold">Historial de pagos</label>
          <InputTextarea
            rows={3}
            value={cliente.historialPagos?.join('\n')}
            onChange={e =>
              setCliente({ ...cliente, historialPagos: e.target.value.split('\n') })
            }
            placeholder="Ingrese un pago por línea"
          />
        </div>
      </div>
    </Dialog>
  );
}
