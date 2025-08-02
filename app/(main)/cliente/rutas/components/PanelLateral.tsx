"use client";
import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { ListBox } from "primereact/listbox";
import { Card } from "primereact/card";
import { Ruta } from "../Types/rutas.types";
import "primeicons/primeicons.css";

interface PanelLateralProps {
  rutas: Ruta[];
  onSeleccionarRuta: (ruta: Ruta) => void;
}

const PanelLateral: React.FC<PanelLateralProps> = ({
  rutas,
  onSeleccionarRuta,
}) => {
  const [filtroTexto, setFiltroTexto] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<string | null>(null);
  const [rutaSeleccionadaId, setRutaSeleccionadaId] = useState<number | null>(
    null
  );

  const estados = [
    { label: "Todos", value: null },
    { label: "Activos", value: "activo" },
    { label: "Inactivos", value: "inactivo" },
  ];

  const rutasFiltradas = rutas.filter(
    (ruta) =>
      ruta.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) &&
      (estadoFiltro === null || ruta.estado === estadoFiltro)
  );

  return (
    <Card
      title="Rutas Disponibles"
      className="h-full shadow-2"
      style={{
        width: "100%",
        maxWidth: "300px",
        borderTop: "4px solid #6f42c1",
      }}
    >
      <div className="p-fluid">
        {/* Campo de búsqueda */}
        <span className="p-input-icon-left mb-3">
          <i className="pi pi-search" />
          <InputText
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            placeholder="Buscar ruta..."
            style={{ borderRadius: "8px" }}
          />
        </span>

        {/* Filtro por estado */}
        <Dropdown
          value={estadoFiltro}
          options={estados}
          onChange={(e) => setEstadoFiltro(e.value)}
          placeholder="Filtrar por estado"
          style={{
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        />

        {/* Lista de rutas con resaltado */}
        <ListBox
          value={rutaSeleccionadaId}
          options={rutasFiltradas}
          onChange={(e) => {
            setRutaSeleccionadaId(e.value);
            const ruta = rutas.find((r) => r.id === e.value);
            if (ruta) onSeleccionarRuta(ruta);
          }}
          optionLabel="nombre"
          optionValue="id"
          itemTemplate={(ruta) => {
            const esSeleccionada = rutaSeleccionadaId === ruta.id;
            return (
              <div
                style={{
                  padding: "8px",
                  borderBottom: "1px solid #eee",
                  borderRadius: "6px",
                  backgroundColor: esSeleccionada ? "#6f42c1" : "transparent",
                  color: esSeleccionada ? "white" : "black",
                  transition: "0.3s",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: "bold" }}>{ruta.nombre}</div>
                <small>
                  {ruta.origen} → {ruta.destino}
                </small>
                <br />
                <small>🕒 {ruta.tiempoEstimado}</small>
              </div>
            );
          }}
          style={{
            width: "100%",
            borderRadius: "8px",
          }}
        />
      </div>
    </Card>
  );
};

export default PanelLateral;
