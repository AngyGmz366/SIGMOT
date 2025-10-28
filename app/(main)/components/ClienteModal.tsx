'use client';

import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Cliente, Persona } from '@/types/persona';

interface EstadoOption {
  label: string;
  value: number;
}

interface Props {
  visible: boolean;
  onHide: () => void;
  onSave: () => void;
  cliente: Cliente;
  setCliente: React.Dispatch<React.SetStateAction<Cliente>>;
  personas: Persona[]; // 👈 ya viene filtrado desde el backend (clientes activos)
  estadosCliente: EstadoOption[];
  submitted: boolean;
}

export default function ClienteModal({
  visible,
  onHide,
  onSave,
  cliente,
  setCliente,
  personas,
  estadosCliente,
  submitted,
}: Props) {
  // 🔹 Colores según estado
  const getEstadoColor = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'ACTIVO':
        return 'success'; // verde
      case 'INACTIVO':
        return 'danger'; // rojo
      default:
        return 'info'; // azul/gris
    }
  };

  return (
    <Dialog
      visible={visible}
      header={cliente.id ? 'Editar Cliente' : 'Nuevo Cliente'}
      modal
      className="w-4"
      onHide={onHide}
      footer={
        <div className="flex justify-content-end gap-2">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            outlined
            onClick={onHide}
            className="p-button-text"
          />
          <Button
            label="Guardar"
            icon="pi pi-check"
            onClick={onSave}
            outlined
          />
        </div>
      }
    >
      <div className="formgrid grid p-fluid">
        {/* 🔹 Persona asociada (solo clientes activos) */}
        <div className="field col-12 md:col-6">
          <label htmlFor="persona" className="font-bold">
            Persona (Cliente Activo)
          </label>
          <Dropdown
            id="persona"
            value={cliente.idPersona ?? null}
            options={personas.map((p) => ({
              label: `${p.Nombres} ${p.Apellidos}`,
              value: p.Id_Persona,
            }))}
            onChange={(e) => setCliente({ ...cliente, idPersona: e.value })}
            placeholder={
              personas.length
                ? 'Seleccione una persona activa'
                : 'No hay clientes activos disponibles'
            }
            className={submitted && !cliente.idPersona ? 'p-invalid' : ''}
            showClear
            filter
          />
          {submitted && !cliente.idPersona && (
            <small className="p-error">Debe seleccionar una persona.</small>
          )}
        </div>

        {/* 🔹 Estado del Cliente */}
        <div className="field col-12 md:col-6">
          <label htmlFor="estado" className="font-bold">
            Estado del Cliente
          </label>
          <Dropdown
            id="estado"
            value={cliente.idEstadoCliente ?? null}
            options={estadosCliente}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => {
              const estadoLabel =
                estadosCliente.find((opt) => opt.value === e.value)?.label || '';
              setCliente({
                ...cliente,
                idEstadoCliente: e.value,
                estado: estadoLabel,
              });
            }}
            placeholder="Seleccione estado"
            className={submitted && !cliente.idEstadoCliente ? 'p-invalid' : ''}
          />

          {/* 🔹 Indicador visual del estado */}
          {cliente.estado && (
            <div className="mt-2">
              <Tag
                value={cliente.estado.toUpperCase()}
                severity={getEstadoColor(cliente.estado)}
                icon={
                  cliente.estado.toUpperCase() === 'ACTIVO'
                    ? 'pi pi-check-circle'
                    : 'pi pi-times-circle'
                }
              />
            </div>
          )}

          {submitted && !cliente.idEstadoCliente && (
            <small className="p-error">Debe seleccionar un estado.</small>
          )}
        </div>
      </div>
    </Dialog>
  );
}
