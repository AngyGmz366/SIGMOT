'use client';

import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Incidencia } from '../types';

interface Props {
  incidencia: Incidencia | null;
  visible: boolean;
  onHide: () => void;
}

const DetalleIncidencia: React.FC<Props> = ({ incidencia, visible, onHide }) => {
  if (!incidencia) return null;

  const estadoSeverity =
    incidencia.estado === 'Resuelto'
      ? 'success'
      : incidencia.estado === 'En Progreso'
      ? 'info'
      : 'warning';

  return (
    <Dialog
      header="Detalle de Incidencia"
      visible={visible}
      style={{ width: '100%', maxWidth: '30rem' }}
      onHide={onHide}
      className="p-fluid"
    >
      {/* Información */}
      <div className="space-y-3 text-gray-800">
        <p>
          <strong>Título:</strong> {incidencia.titulo}
        </p>
        <p>
          <strong>Categoría:</strong> {incidencia.categoria}
        </p>
        <p>
          <strong>Fecha:</strong> {incidencia.fecha}
        </p>
        <p>
          <strong>Estado:</strong>{' '}
          <Tag
            value={incidencia.estado}
            severity={estadoSeverity}
            style={{ padding: '4px 8px', borderRadius: '8px', fontWeight: 'bold' }}
          />
        </p>
        <div>
          <strong>Descripción:</strong>
          <p className="mt-1 p-2 bg-gray-50 rounded-md border border-gray-200">
            {incidencia.descripcion}
          </p>
        </div>
      </div>

      {/* Botón de cierre */}
      <div className="flex justify-end mt-4">
        <Button
          label="Cerrar"
          icon="pi pi-times"
          className="p-button-raised p-button-rounded"
          style={{ backgroundColor: '#6a1b9a', borderColor: '#6a1b9a', color: '#fff' }}
          onClick={onHide}
        />
      </div>
    </Dialog>
  );
};

export default DetalleIncidencia;
