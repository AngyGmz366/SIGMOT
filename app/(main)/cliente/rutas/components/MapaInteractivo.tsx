import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { Ruta } from "../Types/rutas.types";
import { Card } from "primereact/card";
import "leaflet/dist/leaflet.css";

const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/8390/8390779.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

interface MapaInteractivoProps {
  ruta?: Ruta;
}

const MapaInteractivo: React.FC<MapaInteractivoProps> = ({ ruta }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Si ya hay un mapa anterior, lo destruimos
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Posición inicial
    const posicionInicial = ruta?.coordenadas?.[0] ?? [14.072275, -87.192136];

    // Crear mapa
    const map = L.map(mapContainerRef.current, {
      center: posicionInicial,
      zoom: 7,
      minZoom: 6,
      maxZoom: 10,
      maxBounds: [
        [12.98, -89.35],
        [16.02, -83.13],
      ],
      maxBoundsViscosity: 1.0,
    });

    // Guardar referencia
    mapInstanceRef.current = map;

    // Capa base
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Dibujar línea de ruta
    if (ruta?.coordenadas) {
      L.polyline(ruta.coordenadas, {
        color: ruta.estado === "activo" ? "blue" : "gray",
        weight: 5,
        dashArray: ruta.estado === "inactivo" ? "5, 10" : undefined,
      }).addTo(map);
    }

    // Marcar paradas
    ruta?.paradas?.forEach((parada) => {
      L.marker(parada.posicion, { icon: busIcon })
        .addTo(map)
        .bindPopup(
          `<strong>${parada.nombre}</strong><br>
           Horarios: ${parada.horario.join(", ")}<br>
           Tarifa: L. ${parada.tarifa}`
        );
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [ruta]);

  return (
    <Card title="Mapa de Ruta" className="shadow-2 mb-4">
      {ruta?.tiempoEstimado && (
        <div className="px-3 pt-2 pb-0 text-sm text-primary font-medium">
          ⏱ Tiempo estimado: <span className="text-color">{ruta.tiempoEstimado}</span>
        </div>
      )}

      <div
        ref={mapContainerRef}
        style={{ height: "50vh", minHeight: "300px", width: "100%" }}
      />
    </Card>
  );
};

export default MapaInteractivo;
