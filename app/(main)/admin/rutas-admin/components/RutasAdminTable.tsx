"use client";

import React from "react";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { ProgressSpinner } from "primereact/progressspinner";

export interface RutaUI {
  id: number;
  origen: string;
  destino: string;
  estado: "activo" | "inactivo";
  tiempoEstimado?: string | null;
  distancia?: number | null;
  descripcion?: string | null;
  precio?: number | null;
  horarios?: string[] | null;
  coordenadas?: { lat: number; lng: number }[] | null;
}

interface Props {
  rutas: RutaUI[];
  loading?: boolean;
  onEditarRuta?: (ruta: RutaUI) => void;
  onEliminarRuta?: (id: number) => void;
  onCambiarEstado?: (id: number, nuevoEstado: "activo" | "inactivo") => void;
}

const RutasAdminTable: React.FC<Props> = ({
  rutas,
  loading = false,
  onEditarRuta,
  onEliminarRuta,
  onCambiarEstado,
}) => {
  if (loading)
    return (
      <div className="flex justify-center items-center p-6">
        <ProgressSpinner />
      </div>
    );

  return (
    <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-purple-100 text-gray-700">
          <tr>
            <th className="py-3 px-4 text-left font-medium">#</th>
            <th className="py-3 px-4 text-left font-medium">Origen</th>
            <th className="py-3 px-4 text-left font-medium">Destino</th>
            <th className="py-3 px-4 text-left font-medium">Estado</th>
            <th className="py-3 px-4 text-left font-medium">Tiempo Estimado</th>
            <th className="py-3 px-4 text-left font-medium">Distancia</th>
            <th className="py-3 px-4 text-left font-medium">Precio (Lps)</th>
            <th className="py-3 px-4 text-left font-medium">Horarios</th>
            <th className="py-3 px-4 text-left font-medium">Descripción</th>
            <th className="py-3 px-4 text-center font-medium">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {rutas.map((r, i) => (
            <tr
              key={r.id}
              className="border-t hover:bg-purple-50 transition-colors"
            >
              <td className="py-2 px-4">{i + 1}</td>
              <td className="py-2 px-4">{r.origen}</td>
              <td className="py-2 px-4">{r.destino}</td>
              <td className="py-2 px-4">
                {r.estado === "activo" ? (
                  <Tag
                    value="Activo"
                    severity="success"
                    icon="pi pi-check-circle"
                    className="px-3 py-1 text-xs"
                    style={{ cursor: "pointer" }}
                    onClick={() => onCambiarEstado?.(r.id, "inactivo")}
                  />
                ) : (
                  <Tag
                    value="Inactivo"
                    severity="danger"
                    icon="pi pi-times-circle"
                    className="px-3 py-1 text-xs"
                    style={{ cursor: "pointer" }}
                    onClick={() => onCambiarEstado?.(r.id, "activo")}
                  />
                )}
              </td>

              <td className="py-2 px-4">
                {r.tiempoEstimado || <span className="text-gray-400">-</span>}
              </td>

              <td className="py-2 px-4 text-center">
                {r.distancia ? `${r.distancia} km` : "-"}
              </td>

              <td className="py-2 px-4 text-center">
                {r.precio ? r.precio.toFixed(2) : "-"}
              </td>

              <td className="py-2 px-4 text-xs text-gray-700">
                {r.horarios && r.horarios.length > 0 ? (
                  r.horarios.map((h, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-purple-200 text-purple-800 px-2 py-1 rounded-md mr-1 mb-1 text-xs"
                    >
                      {h.replace(/^0/, "")}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">Sin horarios</span>
                )}
              </td>

              <td className="py-2 px-4 text-gray-700 max-w-[200px] truncate">
                {r.descripcion || "-"}
              </td>

              <td className="py-2 px-4 text-center space-x-2">
                <Button
                  icon="pi pi-pencil"
                  className="p-button-sm p-button-warning"
                  tooltip="Editar"
                  onClick={() => onEditarRuta?.(r)}
                />
                <Button
                  icon="pi pi-trash"
                  className="p-button-sm p-button-danger"
                  tooltip="Inactivar"
                  onClick={() => onEliminarRuta?.(r.id)}
                />
              </td>
            </tr>
          ))}

          {rutas.length === 0 && (
            <tr>
              <td
                colSpan={10}
                className="text-center py-4 text-gray-500 italic"
              >
                No hay rutas registradas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RutasAdminTable;
