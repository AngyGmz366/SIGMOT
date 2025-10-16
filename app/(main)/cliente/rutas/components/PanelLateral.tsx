"use client";
import React, { useMemo, useState } from "react";
import { InputText } from "primereact/inputtext";
import { ListBox } from "primereact/listbox";
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

  // 🔎 Filtra rutas por origen o destino
  const filtradas = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    if (!q) return rutas;
    return rutas.filter(
      (r) =>
        r.origen.toLowerCase().includes(q) ||
        r.destino.toLowerCase().includes(q)
    );
  }, [rutas, filtro]);

  // 🎯 Selección de ruta (para mostrar información)
  const handleSeleccion = (id: number) => {
    setSeleccion(id);
    const ruta = filtradas.find((r) => r.id === id);
    if (ruta) onSeleccionarRuta(ruta);
  };

  // 🎫 Reservar ruta (navegación a reservación)
  const handleReservar = (ruta: RutaPublica, event: React.MouseEvent) => {
    event.stopPropagation(); // Evita que se active la selección
    onReservar(ruta);
  };

  return (
    <Card
      title="🚌 Rutas Disponibles"
      className="h-full shadow-2 border-1 surface-border"
      style={{ 
        width: "100%", 
        maxWidth: 320, 
        borderTop: "4px solid #6f42c1",
        borderRadius: "12px"
      }}
    >
      <div className="p-fluid">
        {/* 🔍 Buscador */}
        <div className="mb-4">
          <span className="p-input-icon-left w-full">
            <i className="pi pi-search text-gray-400" />
            <InputText
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar origen o destino..."
              className="w-full"
              style={{ 
                borderRadius: "8px",
                padding: "0.75rem 0.75rem 0.75rem 2.5rem"
              }}
            />
          </span>
          {filtro && (
            <small className="text-gray-500 block mt-2">
              {filtradas.length} ruta{filtradas.length !== 1 ? 's' : ''} encontrada{filtradas.length !== 1 ? 's' : ''}
            </small>
          )}
        </div>

        {/* 🧭 Lista de rutas */}
        <div style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
          <ListBox
            value={seleccion}
            options={filtradas}
            optionValue="id"
            optionLabel="origen"
            onChange={(e) => handleSeleccion(e.value)}
            itemTemplate={(r: RutaPublica) => {
              const sel = seleccion === r.id;
              return (
                <div
                  className={`p-3 border-round mb-2 cursor-pointer transition-all transition-duration-200 ${
                    sel 
                      ? "bg-primary border-1 border-primary" 
                      : "bg-surface border-1 surface-border hover:bg-gray-50"
                  }`}
                  style={{
                    borderLeft: sel ? "4px solid #6f42c1" : "4px solid transparent",
                  }}
                >
                  {/* Encabezado de la ruta */}
                  <div className={`font-bold text-sm mb-2 ${sel ? "text-white" : "text-gray-900"}`}>
                    {r.origen} → {r.destino}
                  </div>

                  {/* Información de la ruta */}
                  <div className={`text-xs mb-2 ${sel ? "text-blue-100" : "text-gray-600"}`}>
                    <div className="flex align-items-center mb-1">
                      <i className="pi pi-clock mr-2" style={{ fontSize: '0.8rem' }}></i>
                      <span>{r.tiempoEstimado || "Tiempo no especificado"}</span>
                    </div>
                    {r.distancia && (
                      <div className="flex align-items-center mb-1">
                        <i className="pi pi-map-marker mr-2" style={{ fontSize: '0.8rem' }}></i>
                        <span>{r.distancia} km</span>
                      </div>
                    )}
                    <div className="flex align-items-center">
                      <i className="pi pi-tag mr-2" style={{ fontSize: '0.8rem' }}></i>
                      <span className="font-bold">Lps. {r.precio?.toFixed(2) || "0.00"}</span>
                    </div>
                  </div>

                  {/* Horarios disponibles */}
                  {r.horarios && r.horarios.length > 0 && (
                    <div className="mb-3">
                      <div className={`text-xs font-semibold mb-1 ${sel ? "text-blue-100" : "text-gray-500"}`}>
                        Horarios:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {r.horarios.slice(0, 3).map((horario, idx) => (
                          <span
                            key={idx}
                            className={`text-xs px-2 py-1 border-round ${
                              sel 
                                ? "bg-white text-primary" 
                                : "bg-gray-100 text-gray-700"
                            }`}
                            style={{ fontSize: '0.7rem' }}
                          >
                            {horario}
                          </span>
                        ))}
                        {r.horarios.length > 3 && (
                          <span 
                            className={`text-xs px-2 py-1 border-round ${
                              sel 
                                ? "bg-white text-primary" 
                                : "bg-gray-100 text-gray-700"
                            }`}
                            style={{ fontSize: '0.7rem' }}
                          >
                            +{r.horarios.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 🎟️ Botón para reservar */}
                  <Button
                    label="Reservar"
                    icon="pi pi-ticket"
                    className={`w-full mt-2 text-sm ${
                      sel 
                        ? "p-button-outlined p-button-secondary" 
                        : "p-button-primary"
                    }`}
                    size="small"
                    onClick={(e) => handleReservar(r, e)}
                  />
                </div>
              );
            }}
            listStyle={{ 
              height: '100%', 
              border: 'none', 
              background: 'transparent' 
            }}
            style={{ 
              width: "100%", 
              border: 'none',
              background: 'transparent'
            }}
          />
        </div>

        {/* Información adicional */}
        {filtradas.length === 0 && (
          <div className="text-center p-4 text-gray-500">
            <i className="pi pi-info-circle mb-2" style={{ fontSize: '1.5rem' }}></i>
            <p>No se encontraron rutas</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PanelLateral;