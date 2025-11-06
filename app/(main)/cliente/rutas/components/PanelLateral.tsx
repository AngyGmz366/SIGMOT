"use client";
import React, { useMemo, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { RutaPublica } from "../Types/rutas.types";

interface PanelLateralProps {
  rutas: RutaPublica[];
  onSeleccionarRuta: (ruta: RutaPublica) => void;
  onReservar: (ruta: RutaPublica) => void;
}

const PanelLateral: React.FC<PanelLateralProps> = ({
  rutas,
  onSeleccionarRuta,
  onReservar,
}) => {
  const [filtro, setFiltro] = useState("");
  const [seleccion, setSeleccion] = useState<number | null>(null);

  const filtradas = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    if (!q) return rutas;
    return rutas.filter(
      (r) =>
        r.origen.toLowerCase().includes(q) ||
        r.destino.toLowerCase().includes(q)
    );
  }, [rutas, filtro]);

  const handleSeleccion = (id: number) => {
    setSeleccion(id);
    const ruta = filtradas.find((r) => r.id === id);
    if (ruta) onSeleccionarRuta(ruta);
  };

  const handleReservar = (ruta: RutaPublica, event: React.MouseEvent) => {
    event.stopPropagation();
    onReservar(ruta);
  };

  return (
    <Card className="rounded-xl shadow-lg overflow-hidden border-0">
      {/* Header con título y buscador */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-4">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 m-0">
            <i className="pi pi-bus text-primary"></i>
            Rutas Disponibles
          </h2>

          {/* 🔍 Buscador */}
          <div className="flex flex-col gap-1">
            <span className="p-input-icon-left w-full">
              <i className="pi pi-search text-gray-400" />
              <InputText
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Buscar origen o destino..."
                className="w-full rounded-lg pl-10 pr-3 py-2"
              />
            </span>
          </div>
        </div>
      </div>

      {/* 🧭 Lista de rutas con desplazamiento */}
      <div className="bg-gray-50 px-4 py-4 sm:px-6 max-h-[500px] overflow-y-auto">
        {filtradas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtradas.map((ruta) => {
              const sel = seleccion === ruta.id;
              return (
                <div
                  key={ruta.id}
                  className={`card-ruta p-6 cursor-pointer transition-all duration-300 ease-in-out flex flex-col gap-4 ${
                    sel
                      ? "selected"
                      : "border-gray-200 hover:border-blue-500 hover:bg-blue-100 hover:shadow-lg"
                  }`}
                  onClick={() => handleSeleccion(ruta.id)}
                  style={{ cursor: "pointer" }} // Estilo de cursor azul similar a YouTube
                >
                  <div className="flex justify-between items-start">
                    <div
                      className={`font-bold text-lg leading-tight ${sel ? "text-white" : "text-blue-600"}`}
                    >
                      {ruta.origen} → {ruta.destino}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <i className="pi pi-clock text-sm"></i>
                        <span className="text-sm">{ruta.tiempoEstimado || "N/A"}</span>
                      </div>
                      {ruta.distancia && (
                        <div className="flex items-center gap-1">
                          <i className="pi pi-map-marker text-sm"></i>
                          <span className="text-sm">{ruta.distancia} km</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <i className="pi pi-tag text-sm"></i>
                      <span
                        className={`font-bold text-lg ${sel ? "text-white" : "text-gray-900"}`}
                      >
                        Lps. {ruta.precio?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  </div>

                  {ruta.horarios && ruta.horarios.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <div className={`text-sm font-semibold ${sel ? "text-blue-100" : "text-gray-500"}`}>
                        Horarios:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ruta.horarios.slice(0, 2).map((horario, idx) => (
                          <span
                            key={idx}
                            className={`text-sm px-4 py-2 rounded ${sel ? "bg-white text-blue-600" : "bg-gray-100 text-gray-700"}`}
                          >
                            {horario}
                          </span>
                        ))}
                        {ruta.horarios.length > 2 && (
                          <span
                            className={`text-sm px-4 py-2 rounded ${sel ? "bg-white text-blue-600" : "bg-gray-100 text-gray-700"}`}
                          >
                            +{ruta.horarios.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 🎟️ Botón para reservar */}
                  <Button
                    label="Reservar"
                    icon="pi pi-ticket"
                    className={`w-full text-sm py-2 ${sel ? "bg-white text-blue-300 border-white hover:bg-gray-100 hover:text-blue-400" : "p-button-primary"}`}
                    size="small"
                    onClick={(e) => handleReservar(ruta, e)}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 px-4 text-gray-500 flex flex-col items-center justify-center">
            <i className="pi pi-search text-3xl mb-3 opacity-50"></i>
            <p className="text-sm mb-4">No se encontraron rutas</p>
            {filtro && (
              <Button
                label="Limpiar búsqueda"
                className="p-button-text p-button-sm"
                onClick={() => setFiltro("")}
              />
            )}
          </div>
        )}
      </div>

      <div className="bg-gray-100 px-4 py-3 border-t border-gray-200 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
          <i className="pi pi-info-circle"></i>
          <span>{rutas.length} rutas totales • {filtradas.length} filtradas</span>
        </div>
      </div>
    </Card>
  );
};

export default PanelLateral;
