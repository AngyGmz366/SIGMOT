'use client';

import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';

import {  Cliente } from '@/types/persona';
import { Viaje } from '@/types/ventas';

interface Props {
  visible: boolean;
  onHide: () => void;
  onSave: () => void;
  viaje: Viaje;
  setViaje: (v: Viaje) => void;
  clientes: Cliente[];
  submitted: boolean;
}

export default function ViajeModal({
  visible,
  onHide,
  onSave,
  viaje,
  setViaje,
  clientes,
  submitted
}: Props) {
  return (
    <Dialog
      visible={visible}
      header="Registro de Viaje"
      modal
      className="w-4"
      onHide={onHide}
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Cancelar" icon="pi pi-times" text onClick={onHide} />
          <Button label="Guardar" icon="pi pi-check" text onClick={onSave} />
        </div>
      }
    >
      <div className="formgrid grid p-fluid">
        {/* Mostrar Dropdown solo si NO hay cliente seleccionado */}
        {!viaje.idCliente && (
          <div className="field col-12 md:col-6">
            <label htmlFor="cliente">Cliente</label>
            <Dropdown
              id="cliente"
              value={viaje.idCliente}
              options={clientes.map((c) => ({
                label: c.persona ? `${c.persona.Nombres} ${c.persona.Apellidos}` : c.id,
                value: c.id
              }))}
              onChange={(e) => setViaje({ ...viaje, idCliente: e.value })}
              placeholder="Seleccione cliente"
              className={submitted && !viaje.idCliente ? 'p-invalid' : ''}
            />
            {submitted && !viaje.idCliente && <small className="p-error">Requerido.</small>}
          </div>
        )}

        {/* Fecha Viaje */}
        <div className="field col-12 md:col-6">
          <label htmlFor="fechaViaje">Fecha de Viaje</label>
          <Calendar
            id="fechaViaje"
            value={viaje.fecha ? new Date(viaje.fecha) : undefined}
            onChange={(e) =>
              setViaje({
                ...viaje,
                fecha: e.value ? (e.value as Date).toISOString().split('T')[0] : ''
              })
            }
            dateFormat="yy-mm-dd"
            className={submitted && !viaje.fecha ? 'p-invalid' : ''}
          />
          {submitted && !viaje.fecha && <small className="p-error">Requerido.</small>}
        </div>

        {/* Origen */}
        <div className="field col-12 md:col-6">
          <label htmlFor="origen">Origen</label>
          <InputText
            id="origen"
            value={viaje.origen}
            onChange={(e) => setViaje({ ...viaje, origen: e.target.value })}
            className={submitted && !viaje.origen ? 'p-invalid' : ''}
          />
          {submitted && !viaje.origen && <small className="p-error">Requerido.</small>}
        </div>

        {/* Destino */}
        <div className="field col-12 md:col-6">
          <label htmlFor="destino">Destino</label>
          <InputText
            id="destino"
            value={viaje.destino}
            onChange={(e) => setViaje({ ...viaje, destino: e.target.value })}
            className={submitted && !viaje.destino ? 'p-invalid' : ''}
          />
          {submitted && !viaje.destino && <small className="p-error">Requerido.</small>}
        </div>

        {/* Costo */}
        <div className="field col-12 md:col-6">
          <label htmlFor="costo">Costo</label>
          <InputNumber
            id="costo"
            value={viaje.costo}
            onValueChange={(e) => setViaje({ ...viaje, costo: e.value ?? 0 })}
            mode="currency"
            currency="HNL"
            locale="es-HN"
            className={submitted && (!viaje.costo || viaje.costo <= 0) ? 'p-invalid' : ''}
          />
          {submitted && (!viaje.costo || viaje.costo <= 0) && <small className="p-error">Requerido.</small>}
        </div>
      </div>
    </Dialog>
  );
}
