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
}

const PanelLateral: React.FC<PanelLateralProps> = ({
  rutas,
  onSeleccionarRuta,
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

  // 🎯 Selección de ruta
  const handleSeleccion = (id: number) => {
    setSeleccion(id);
    const ruta = filtradas.find((r) => r.id === id);
    if (ruta) onSeleccionarRuta(ruta);
  };

  return (
    <Card
      title="Rutas Disponibles"
      className="h-full shadow-2"
      style={{ width: "100%", maxWidth: 300, borderTop: "4px solid #6f42c1" }}
    >
      <div className="p-fluid">
        {/* 🔍 Buscador */}
        <span className="p-input-icon-left mb-3">
          <i className="pi pi-search" />
          <InputText
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar origen o destino..."
            style={{ borderRadius: 8 }}
          />
        </span>

        {/* 🧭 Lista de rutas */}
        <ListBox
          value={seleccion}
          options={filtradas}
          optionValue="id"
          optionLabel="__lbl"
          onChange={(e) => handleSeleccion(e.value)}
          itemTemplate={(r: RutaPublica) => {
            const sel = seleccion === r.id;
            return (
              <div
                style={{
                  padding: 10,
                  borderBottom: "1px solid #eee",
                  borderRadius: 6,
                  background: sel ? "#6f42c1" : "transparent",
                  color: sel ? "white" : "black",
                  transition: "all 0.25s ease",
                }}
              >
                <div style={{ fontWeight: 700 }}>
                  {r.origen} → {r.destino}
                </div>
                <div style={{ fontSize: 13 }}>🕒 {r.tiempoEstimado ?? "-"}</div>
                <div style={{ fontSize: 13 }}>
                  💵 Lps. {r.precio?.toFixed(2) ?? "0.00"}
                </div>

                {/* 🎟️ Botón para reservar */}
                <Button
                  label="Reservar"
                  icon="pi pi-ticket"
                  className="p-button-sm mt-2 w-full"
                  onClick={() => onSeleccionarRuta(r)}
                />
              </div>
            );
          }}
          style={{ width: "100%", borderRadius: 8 }}
        />
      </div>
    </Card>
  );
};

export default PanelLateral;
