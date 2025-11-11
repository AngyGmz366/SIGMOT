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
  const [isOpen, setIsOpen] = useState(true);  // Estado para controlar la visibilidad del panel

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

  const togglePanel = () => {
    setIsOpen(!isOpen);  // Alterna la visibilidad del panel lateral
  };

  return (
    <div className={`panel-lateral ${isOpen ? 'open' : 'closed'}`}>
      <Card className="rounded-xl shadow-lg overflow-hidden border-0">
        {/* Botón para abrir/cerrar el panel lateral */}
        <Button
          icon={isOpen ? "pi pi-chevron-left" : "pi pi-chevron-right"}
          className="p-button-rounded p-button-outlined p-button-sm"
          onClick={togglePanel}
        />

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

        {/*  Lista de rutas con desplazamiento */}
        <div className="bg-gray-50 px-4 py-4 sm:px-6 max-h-[500px] overflow-y-auto">
          {filtradas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtradas.map((ruta) => {
                const sel = seleccion === ruta.id;
                return (
                  <div
                    key={ruta.id}
                    className={`card-ruta ${sel ? "selected" : ""}`}
                    onClick={() => handleSeleccion(ruta.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="card-ruta-content">
                      {/* Encabezado de la ruta */}
                      <div className="ruta-header">
                        <h3 className="ruta-title">
                          {ruta.origen} → {ruta.destino}
                        </h3>
                        <span className="ruta-badge">Disponible</span>
                      </div>
                      
                      {/* Información de la ruta */}
                      <div className="ruta-info">
                        <div className="ruta-detail">
                          <i className="icon-time"></i>
                          <span>{ruta.tiempoEstimado || "N/A"}</span>
                        </div>
                        
                        {ruta.distancia && (
                          <div className="ruta-detail">
                            <i className="icon-distance"></i>
                            <span>{ruta.distancia} km</span>
                          </div>
                        )}
                        
                        {/* Horarios */}
                        {ruta.horarios && ruta.horarios.length > 0 && (
                          <div className="ruta-horarios">
                            <div className="horarios-title">Horarios:</div>
                            <div className="horarios-list">
                              {ruta.horarios.slice(0, 3).map((horario, idx) => (
                                <span key={idx} className="horario-item">
                                  {horario}
                                </span>
                              ))}
                              {ruta.horarios.length > 3 && (
                                <span className="horario-item">
                                  +{ruta.horarios.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Precio y botón */}
                      <div className="ruta-footer">
                        <div className="ruta-precio">
                          L. {ruta.precio?.toFixed(2) || "0.00"}
                        </div>
                        <button 
                          className="p-button"
                          onClick={(e) => handleReservar(ruta, e)}
                        >
                          Reservar
                        </button>
                      </div>
                    </div>
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
    </div>
  );
};

export default PanelLateral;