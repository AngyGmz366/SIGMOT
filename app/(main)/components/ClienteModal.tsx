////////////////////////cliente modal


'use client';

import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Cliente } from '@/types/persona';
import { Persona } from '@/types/persona';

interface Props {
  visible: boolean;
  onHide: () => void;
  onSave: () => void;
  cliente: Cliente;
  setCliente: (c: Cliente) => void;
  personas: Persona[];
  submitted: boolean;
}

const estados = [
  { label: 'Activo', value: 'activo' },
  { label: 'Inactivo', value: 'inactivo' },
];

export default function ClienteModal({ visible, onHide, onSave, cliente, setCliente, personas, submitted }: Props) {
  return (
<Dialog
  visible={visible}
  header="Datos del Cliente"
  modal
  className="w-4" // un poco más ancho para que respire
  onHide={onHide}
  footer={
    <div className="flex justify-content-end gap-2">
      <Button label="Cancelar" icon="pi pi-times" text onClick={onHide} />
      <Button label="Guardar" icon="pi pi-check" text onClick={onSave} />
    </div>
  }
>
  <div className="formgrid grid p-fluid">
    {/* Persona */}
    <div className="field col-12 md:col-6">
      <label htmlFor="persona">Persona (Cliente)</label>
      <Dropdown
        id="persona"
        value={cliente.idPersona}
        options={personas.map(p => ({
          label: `${p.nombre} ${p.apellido}`,
          value: p.id,
        }))}
        onChange={(e) => setCliente({ ...cliente, idPersona: e.value })}
        placeholder="Seleccione persona"
        className={submitted && !cliente.idPersona ? 'p-invalid' : ''}
      />
      {submitted && !cliente.idPersona && <small className="p-error">Requerido.</small>}
    </div>

    {/* Estado */}
    <div className="field col-12 md:col-6">
      <label htmlFor="estado">Estado</label>
      <Dropdown
        id="estado"
        value={cliente.estado}
        options={estados}
        onChange={(e) => setCliente({ ...cliente, estado: e.value })}
        placeholder="Seleccione estado"
        className={submitted && !cliente.estado ? 'p-invalid' : ''}
      />
      {submitted && !cliente.estado && <small className="p-error">Requerido.</small>}
    </div>
  </div>
</Dialog>

  );
}
