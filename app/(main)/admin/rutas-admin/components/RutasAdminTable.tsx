'use client';

import React from 'react';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

type EstadoUI = 'activo' | 'inactivo';

export type RutaUI = {
  id: number;
  origen: string;
  destino: string;
  estado: EstadoUI;
  tiempoEstimado?: string | null;
  distancia?: number | null;
  descripcion?: string | null;
};

interface RutasAdminTableProps {
  rutas: RutaUI[];
  loading?: boolean;
  onEditarRuta: (ruta: RutaUI) => void;
  onEliminarRuta: (id: number) => void;                           // inactivar
  onCambiarEstado: (id: number, nuevoEstado: EstadoUI) => void;   // toggle
}

const RutasAdminTable: React.FC<RutasAdminTableProps> = ({
  rutas,
  loading,
  onEditarRuta,
  onEliminarRuta,
  onCambiarEstado
}) => {

  const estadoTemplate = (estado: EstadoUI, id: number) => {
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
      <Tag
        value="Inactivo"
        severity="warning"
        icon="pi pi-times-circle"
        className="px-3 py-1 cursor-pointer text-white"
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
          {!loading && rutas.map((ruta) => (
            <tr key={ruta.id} className="border-t hover:bg-purple-50 transition-colors">
              <td className="py-2 px-4">{`${ruta.origen} → ${ruta.destino}`}</td>
              <td className="py-2 px-4">{ruta.origen}</td>
              <td className="py-2 px-4">{ruta.destino}</td>
              <td className="py-2 px-4">{estadoTemplate(ruta.estado, ruta.id)}</td>
              <td className="py-2 px-4">{ruta.tiempoEstimado || '-'}</td>
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
                  onClick={() => onEliminarRuta(ruta.id)}   // inactivar
                  tooltip="Inactivar ruta"
                />
              </td>
            </tr>
          ))}

          {loading && (
            <tr><td className="py-4 px-4 text-gray-500" colSpan={6}>Cargando...</td></tr>
          )}

          {!loading && rutas.length === 0 && (
            <tr><td className="py-4 px-4 text-gray-500" colSpan={6}>No hay rutas registradas.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RutasAdminTable;
