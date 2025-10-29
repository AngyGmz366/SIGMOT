// app/(main)/admin/rutas-admin/components/RutasAdminTable.tsx
import React from "react";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { ProgressSpinner } from "primereact/progressspinner";
import { RutaUI } from "./types";

interface Props {
  rutas: RutaUI[];
  loading?: boolean;
  onEditarRuta?: (ruta: RutaUI) => void;
  onCambiarEstado?: (id: number, nuevoEstado: "activo" | "inactivo") => void;
}

const RutasAdminTable: React.FC<Props> = ({
  rutas,
  loading = false,
  onEditarRuta,
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
            <th className="py-3 px-4 text-left font-medium">Distancia (km)</th>
            <th className="py-3 px-4 text-left font-medium">Tiempo Estimado</th>
            <th className="py-3 px-4 text-left font-medium">Precio (Lps)</th>
            <th className="py-3 px-4 text-left font-medium">Estado</th>
            <th className="py-3 px-4 text-left font-medium">Horarios</th>
            <th className="py-3 px-4 text-left font-medium">Unidades</th>
            <th className="py-3 px-4 text-left font-medium">Descripción</th>
            <th className="py-3 px-4 text-center font-medium">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {rutas.map((r, i) => (
            <tr
              key={r.id}
              className={`border-t transition-colors ${
                r.estado === "activo"
                  ? "hover:bg-purple-50"
                  : "hover:bg-gray-50 opacity-80"
              }`}
            >
              <td className="py-2 px-4">{i + 1}</td>
              <td className="py-2 px-4">{r.origen || "-"}</td>
              <td className="py-2 px-4">{r.destino || "-"}</td>
              <td className="py-2 px-4 text-gray-700">
                {r.distancia ? `${r.distancia} km` : "-"}
              </td>
              <td className="py-2 px-4">{r.tiempoEstimado || "-"}</td>

              <td className="py-2 px-4 text-center font-semibold text-gray-800">
                {r.precio ? `L. ${r.precio.toFixed(2)}` : "-"}
              </td>

<td className="py-2 px-4">
  {r.estado === "activo" ? (
    <Tag
      value="ACTIVA"
      severity="success"
      icon="pi pi-check-circle"
      className="px-3 py-1 text-xs cursor-pointer"
      style={{
        backgroundColor: "#d1fae5",
        color: "#065f46",
        borderRadius: "8px",
        fontWeight: "600",
      }}
      onClick={() => onCambiarEstado?.(r.id, "inactivo")}
    />
  ) : (
    <Tag
      value="INACTIVA"
      severity="danger"
      icon="pi pi-times-circle"
      className="px-3 py-1 text-xs cursor-pointer"
      style={{
        backgroundColor: "#fde2e2",
        color: "#b91c1c",
        borderRadius: "8px",
        fontWeight: "600",
      }}
      onClick={() => onCambiarEstado?.(r.id, "activo")}
    />
  )}
</td>
              {/* Horarios */}
              <td className="py-2 px-4 text-xs text-gray-700">
                {Array.isArray(r.horarios) && r.horarios.length > 0 ? (
                  r.horarios.map((h, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-purple-200 text-purple-900 px-2 py-1 rounded-md mr-1 mb-1 text-xs font-medium"
                    >
                      {h}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">Sin horarios</span>
                )}
              </td>

              {/* Unidades */}
              <td className="py-2 px-4 text-xs text-gray-700">
                {Array.isArray(r.unidades) && r.unidades.length > 0 ? (
                  r.unidades.map((u, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-md mr-1 mb-1 text-xs font-medium"
                    >
                      Unidad {u}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">Sin unidades</span>
                )}
              </td>

              <td className="py-2 px-4 text-gray-700 max-w-[200px] truncate">
                {r.descripcion || "-"}
              </td>

              {/* Acciones */}
              <td className="py-2 px-4 text-center flex justify-center gap-2">
                <Button
                  icon="pi pi-pencil"
                  className="p-button-rounded p-button-warning p-button-sm"
                  tooltip="Editar ruta"
                  tooltipOptions={{ position: "top" }}
                  onClick={() => onEditarRuta?.(r)}
                />
              </td>
            </tr>
          ))}

          {rutas.length === 0 && (
            <tr>
              <td
                colSpan={11}
                className="text-center py-5 text-gray-500 italic bg-gray-50"
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
