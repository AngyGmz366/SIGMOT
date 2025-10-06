'use client';

import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import type { Incidencia } from '../page';

interface Props {
  incidencia: Incidencia | null;
  visible: boolean;
  onHide: () => void;
}

const DetalleIncidencia: React.FC<Props> = ({ incidencia, visible, onHide }) => {
  if (!incidencia) return null;

  return (
    <Dialog
      visible={visible}
      header={`Detalle de incidencia: ${incidencia.titulo}`}
      style={{ width: '500px' }}
      modal
      onHide={onHide}
      footer={<Button label="Cerrar" icon="pi pi-times" onClick={onHide} />}
    >
      <div className="p-3 space-y-2">
        <p><strong>ID:</strong> {incidencia.id}</p>
        <p><strong>Categoría:</strong> {incidencia.categoria}</p>
        <p><strong>Descripción:</strong> {incidencia.descripcion}</p>
        <p><strong>Fecha:</strong> {incidencia.fecha}</p>
        <p><strong>Estado:</strong> {incidencia.estado}</p>
      </div>
    </Dialog>
  );
};

export default DetalleIncidencia;
