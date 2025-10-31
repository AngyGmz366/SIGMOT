'use client';

import { useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';

import { Pago, Cliente } from '@/types/persona'; // Ajusta la ruta según tu estructura

interface Props {
  visible: boolean;
  onHide: () => void;
  onSave: () => void;
  pago: Pago;
  setPago: (p: Pago) => void;
  clientes: Cliente[];
  submitted: boolean;
}

const metodoPagoOptions = [
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'Tarjeta', value: 'tarjeta' },
  { label: 'Transferencia', value: 'transferencia' },
];

export default function PagoModal({
  visible,
  onHide,
  onSave,
  pago,
  setPago,
  clientes,
  submitted
}: Props) {
  // Establece la fecha del viaje como fecha de pago si está vacía
  useEffect(() => {
    if (visible && !pago.fechaPago && (pago as any).fechaViaje) {
      setPago({ ...pago, fechaPago: (pago as any).fechaViaje });
    }
  }, [visible]);

  return (
    <Dialog
      visible={visible}
      header="Registro de Pago"
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
        {/* Cliente */}
        {!pago.idCliente && (
          <div className="field col-12 md:col-6">
            <label htmlFor="cliente">Cliente</label>
            <Dropdown
              id="cliente"
              value={pago.idCliente}
              options={clientes.map((c) => ({
                label: `${c.persona?. Nombres} ${c.persona?.Apellidos}`,
                value: c.id,
              }))}
              onChange={(e) => setPago({ ...pago, idCliente: e.value })}
              placeholder="Seleccione cliente"
              className={submitted && !pago.idCliente ? 'p-invalid' : ''}
            />
            {submitted && !pago.idCliente && <small className="p-error">Requerido.</small>}
          </div>
        )}

        {/* Fecha de Pago */}
        <div className="field col-12 md:col-6">
          <label htmlFor="fechaPago">Fecha de Pago</label>
          <Calendar
            id="fechaPago"
            value={pago.fechaPago ? new Date(pago.fechaPago) : undefined}
            onChange={(e) =>
              setPago({ ...pago, fechaPago: e.value?.toISOString().split('T')[0] ?? '' })
            }
            dateFormat="yy-mm-dd"
            className={submitted && !pago.fechaPago ? 'p-invalid' : ''}
          />
          {submitted && !pago.fechaPago && <small className="p-error">Requerido.</small>}
        </div>

        {/* Monto */}
        <div className="field col-12 md:col-6">
          <label htmlFor="monto">Monto</label>
          <InputNumber
            id="monto"
            value={pago.monto}
            onValueChange={(e) => setPago({ ...pago, monto: e.value ?? 0 })}
            mode="currency"
            currency="HNL"
            locale="es-HN"
            className={submitted && pago.monto <= 0 ? 'p-invalid' : ''}
          />
          {submitted && pago.monto <= 0 && <small className="p-error">Monto debe ser mayor que 0.</small>}
        </div>

        {/* Método de Pago */}
        <div className="field col-12 md:col-6">
          <label htmlFor="metodoPago">Método de Pago</label>
          <Dropdown
            id="metodoPago"
            value={pago.metodoPago}
            options={metodoPagoOptions}
            onChange={(e) => setPago({ ...pago, metodoPago: e.value })}
            placeholder="Seleccione método"
            className={submitted && !pago.metodoPago ? 'p-invalid' : ''}
          />
          {submitted && !pago.metodoPago && <small className="p-error">Requerido.</small>}
        </div>
      </div>
    </Dialog>
  );
}
