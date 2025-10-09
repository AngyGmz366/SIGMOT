"use client";
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { Card } from "primereact/card";
import "leaflet/dist/leaflet.css";
import { RutaPublica } from "../Types/rutas.types";

interface Props {
  rutas: RutaPublica[];
}

const MapaInteractivo: React.FC<Props> = ({ rutas }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [14.5, -86.5],
        zoom: 7,
        minZoom: 6,
        maxZoom: 12,
        maxBounds: [
          [12.98, -89.35],
          [16.02, -83.13],
        ],
        maxBoundsViscosity: 1.0,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }

    const map = mapRef.current!;
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) map.removeLayer(layer);
    });

    const colores = ["#007bff", "#e91e63", "#ff9800", "#28a745", "#9c27b0"];
    const allCoords: [number, number][] = [];

    rutas.forEach((r, idx) => {
      if (!r.coordenadas || r.coordenadas.length < 2) return;

      const coords = r.coordenadas.map((p) => [p.lat, p.lng]) as [
        number,
        number
      ][];
      allCoords.push(...coords);
      const color = colores[idx % colores.length];

      // 🔹 Polyline con color diferente y ligera variación de ruta
      const polyline = L.polyline(coords, {
        color,
        weight: 5,
        opacity: 0.8,
        lineJoin: "round",
        dashArray: idx % 2 === 0 ? undefined : "8, 8", // una sólida, otra punteada
      }).addTo(map);

      // 📍 Marcadores
      const inicio = coords[0];
      const fin = coords[coords.length - 1];

      L.circleMarker(inicio, {
        radius: 6,
        color,
        fillColor: "#fff",
        fillOpacity: 1,
      })
        .addTo(map)
        .bindPopup(`<b>Inicio:</b> ${r.origen}`);

      L.circleMarker(fin, {
        radius: 6,
        color,
        fillColor: "#fff",
        fillOpacity: 1,
      })
        .addTo(map)
        .bindPopup(`<b>Destino:</b> ${r.destino}`);

      polyline.bindPopup(
        `<b>${r.origen} → ${r.destino}</b><br/>⏱ ${r.tiempoEstimado}<br/>💰 Lps. ${r.precio}`
      );
    });

    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      setTimeout(() => map.fitBounds(bounds, { padding: [60, 60] }), 200);
    }
  }, [rutas]);

  return (
    <Card title="🗺️ Mapa de Rutas Activas" className="shadow-2 mb-4">
      <div
        ref={mapContainerRef}
        style={{
          height: "60vh",
          minHeight: "350px",
          width: "100%",
          borderRadius: "12px",
        }}
      />
    </Card>
  );
};

export default MapaInteractivo;
