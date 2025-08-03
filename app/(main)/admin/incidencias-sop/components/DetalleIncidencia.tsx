'use client';

import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Incidencia } from '../types';

interface Props {
  incidencia: Incidencia | null;
  visible: boolean;
  onHide: () => void;
}

const DetalleIncidencia: React.FC<Props> = ({ incidencia, visible, onHide }) => {
  if (!incidencia) return null;

  return (
    <Dialog header="Detalle de Incidencia" visible={visible} style={{ width: '30rem' }} onHide={onHide}>
      <p><strong>Título:</strong> {incidencia.titulo}</p>
      <p><strong>Categoría:</strong> {incidencia.categoria}</p>
      <p><strong>Fecha:</strong> {incidencia.fecha}</p>
      <p><strong>Estado:</strong> {incidencia.estado}</p>
      <p><strong>Descripción:</strong></p>
      <p>{incidencia.descripcion}</p>

      <div className="flex justify-end mt-3">
        <Button label="Cerrar" icon="pi pi-times" onClick={onHide} />
      </div>
    </Dialog>
  );
};

export default DetalleIncidencia;
