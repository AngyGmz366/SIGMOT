'use client';

import React from 'react';
import { Ruta } from '@/app/(main)/cliente/rutas/Types/rutas.types';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

interface RutasAdminTableProps {
  rutas: Ruta[];
  onEditarRuta: (ruta: Ruta) => void;
  onEliminarRuta: (rutaId: string) => void;
  onCambiarEstado: (rutaId: string, nuevoEstado: 'activo' | 'inactivo') => void;
}

const RutasAdminTable: React.FC<RutasAdminTableProps> = ({
  rutas,
  onEditarRuta,
  onEliminarRuta,
  onCambiarEstado
}) => {
  const estadoTemplate = (estado: 'activo' | 'inactivo', id: string) => {
    if (estado === 'activo') {
      return (
        <Tag
          value="Activo"
          severity="success"
          icon="pi pi-check-circle"
          className="px-3 py-1 cursor-pointer"
          onClick={() => onCambiarEstado(id, 'inactivo')}
        />
      );
    }
    return (
      <Button
        label="Inactivo"
        icon="pi pi-times-circle"
        className="p-button-warning p-button-sm text-white"
        onClick={() => onCambiarEstado(id, 'activo')}
      />
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-md shadow text-sm">
        <thead>
          <tr className="bg-purple-100 text-left">
            <th className="py-3 px-4 font-medium">Nombre</th>
            <th className="py-3 px-4 font-medium">Origen</th>
            <th className="py-3 px-4 font-medium">Destino</th>
            <th className="py-3 px-4 font-medium">Estado</th>
            <th className="py-3 px-4 font-medium">Tiempo Estimado</th>
            <th className="py-3 px-4 font-medium text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rutas.map((ruta) => (
            <tr key={ruta.id} className="border-t hover:bg-purple-50 transition-colors">
              <td className="py-2 px-4">{ruta.nombre}</td>
              <td className="py-2 px-4">{ruta.origen}</td>
              <td className="py-2 px-4">{ruta.destino}</td>
              <td className="py-2 px-4">{estadoTemplate(ruta.estado, ruta.id)}</td>
              <td className="py-2 px-4">{ruta.tiempoEstimado}</td>
              <td className="py-2 px-4 text-center space-x-2">
                <Button
                  icon="pi pi-pencil"
                  className="p-button-sm p-button-warning"
                  onClick={() => onEditarRuta(ruta)}
                  tooltip="Editar ruta"
                />
                <Button
                  icon="pi pi-trash"
                  className="p-button-sm p-button-danger"
                  onClick={() => onEliminarRuta(ruta.id)}
                  tooltip="Eliminar ruta"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {rutas.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          No hay rutas registradas.
        </div>
      )}
    </div>
  );
};

export default RutasAdminTable;
