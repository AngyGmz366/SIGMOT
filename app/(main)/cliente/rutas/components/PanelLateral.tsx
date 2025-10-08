"use client";
import React, { useMemo, useState } from "react";
import { InputText } from "primereact/inputtext";
import { ListBox } from "primereact/listbox";
import { Card } from "primereact/card";
import { RutaPublica } from "../Types/rutas.types";

interface PanelLateralProps {
  rutas: RutaPublica[];
  onSeleccionarRuta: (ruta: RutaPublica) => void;
}

const PanelLateral: React.FC<PanelLateralProps> = ({ rutas, onSeleccionarRuta }) => {
  const [filtro, setFiltro] = useState("");
  const [seleccion, setSeleccion] = useState<number | null>(null);

  const filtradas = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    if (!q) return rutas;
    return rutas.filter(r =>
      r.origen.toLowerCase().includes(q) ||
      r.destino.toLowerCase().includes(q)
    );
  }, [rutas, filtro]);

  return (
    <Card title="Rutas Disponibles" className="h-full shadow-2"
      style={{ width: "100%", maxWidth: 300, borderTop: "4px solid #6f42c1" }}>
      <div className="p-fluid">
        <span className="p-input-icon-left mb-3">
          <i className="pi pi-search" />
          <InputText
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar origen o destino..."
            style={{ borderRadius: 8 }}
          />
        </span>

        <ListBox
          value={seleccion}
          options={filtradas}
          optionValue="id"
          optionLabel="__lbl" // no lo usamos, pintamos custom
          onChange={(e) => {
            setSeleccion(e.value);
            const ruta = rutas.find((r) => r.id === e.value);
            if (ruta) onSeleccionarRuta(ruta);
          }}
          itemTemplate={(r: RutaPublica) => {
            const sel = seleccion === r.id;
            return (
              <div
                style={{
                  padding: 8, borderBottom: "1px solid #eee", borderRadius: 6,
                  background: sel ? "#6f42c1" : "transparent",
                  color: sel ? "white" : "black", transition: "0.2s",
                }}
              >
                <div style={{ fontWeight: 700 }}>
                  {r.origen} → {r.destino}
                </div>
                <small>🕒 {r.tiempoEstimado ?? "-"}</small>
                <br />
                <small>💵 Lps. {r.precio.toFixed(2)}</small>
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
