'use client';

import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Cliente, Persona } from '@/types/persona';

interface Props {
  visible: boolean;
  onHide: () => void;
  onSave: () => void;
  cliente: Cliente;
  setCliente: React.Dispatch<React.SetStateAction<Cliente>>;
  personas: Persona[];
  submitted: boolean;
}

export default function ClienteModal({
  visible,
  onHide,
  onSave,
  cliente,
  setCliente,
  personas,
  submitted,
}: Props) {
  const estados = [
    { label: 'Activo', value: 'Activo' },
    { label: 'Inactivo', value: 'Inactivo' },
  ];

  return (
    <Dialog
      visible={visible}
      header={cliente.id ? 'Editar Cliente' : 'Nuevo Cliente'}
      modal
      className="w-4"
      onHide={onHide}
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Cancelar" icon="pi pi-times" outlined onClick={onHide} />
          <Button label="Guardar" icon="pi pi-check" onClick={onSave} />
        </div>
      }
    >
      <div className="formgrid grid p-fluid">
        {/* 🔹 Persona asociada */}
        <div className="field col-12 md:col-6">
          <label htmlFor="persona">Persona (Cliente)</label>
          <Dropdown
            id="persona"
            value={cliente.idPersona}
            options={personas.map((p) => ({
              label: `${p.Nombres} ${p.Apellidos}`,
              value: p.Id_Persona,
            }))}
            onChange={(e) => setCliente({ ...cliente, idPersona: e.value })}
            placeholder="Seleccione una persona"
            className={submitted && !cliente.idPersona ? 'p-invalid' : ''}
            showClear
          />
          {submitted && !cliente.idPersona && (
            <small className="p-error">Debe seleccionar una persona.</small>
          )}
        </div>

        {/* 🔹 Estado */}
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
          {submitted && !cliente.estado && (
            <small className="p-error">Debe seleccionar un estado.</small>
          )}
        </div>
      </div>
    </Dialog>
  );
}
