"use client";
import React, { useEffect, useRef } from "react";
import * as L from "leaflet";
import { Card } from "primereact/card";
import "leaflet/dist/leaflet.css";
import { RutaPublica } from "../Types/rutas.types";

// Fix para iconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Props {
  rutas: RutaPublica[];
}

const MapaInteractivo: React.FC<Props> = ({ rutas }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null); // Usar any para el mapa
  const layersRef = useRef<any[]>([]); // Usar any para las capas

  // Función para obtener ruta real usando OSRM
  const obtenerRutaReal = async (origen: [number, number], destino: [number, number]) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${origen[1]},${origen[0]};${destino[1]},${destino[0]}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        return data.routes[0].geometry;
      }
    } catch (error) {
      console.warn('Error obteniendo ruta OSRM:', error);
    }
    return null;
  };

  // Limpiar capas anteriores
  const limpiarCapas = () => {
    if (!mapRef.current) return;

    layersRef.current.forEach((layer: any) => {
      mapRef.current?.removeLayer(layer);
    });
    layersRef.current = [];
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Inicializar mapa si no existe
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [14.5, -86.5],
        zoom: 7,
        minZoom: 6,
        maxZoom: 15,
        maxBounds: [
          [12.98, -89.35],
          [16.02, -83.13],
        ],
        maxBoundsViscosity: 1.0,
      });

      // Capa base de OpenStreetMap
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Limpiar rutas anteriores
    limpiarCapas();

    const colores = ["#007bff", "#e91e63", "#ff9800", "#28a745", "#9c27b0"];
    const allCoords: any[] = [];

    // Procesar cada ruta
    rutas.forEach(async (ruta, idx) => {
      if (!ruta.coordenadas || ruta.coordenadas.length < 2) return;

      const coords = ruta.coordenadas.map((p) => [p.lat, p.lng] as [number, number]);
      const inicio = coords[0];
      const fin = coords[coords.length - 1];

      // Agregar coordenadas para ajustar bounds
      allCoords.push(L.latLng(inicio[0], inicio[1]));
      allCoords.push(L.latLng(fin[0], fin[1]));

      const color = colores[idx % colores.length];

      try {
        // Intentar obtener ruta real de OSRM
        const geometry = await obtenerRutaReal(inicio, fin);

        let rutaCoords: [number, number][] = [];

        if (geometry) {
          rutaCoords = geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
        } else {
          rutaCoords = coords;
        }

        // Dibujar la ruta
        const polyline = L.polyline(rutaCoords, {
          color: color,
          weight: 5,
          opacity: 0.8,
          lineJoin: "round",
          lineCap: "round",
        }).addTo(map);

        layersRef.current.push(polyline);

        // Marcador INICIO
        const inicioIcon = L.divIcon({
          className: 'custom-marker',
          html: ` 
            <div style="background: ${color}; color: white; padding: 6px 10px; border-radius: 16px; font-weight: 600; font-size: 11px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
              ▲ ${ruta.origen}
            </div>
          `,
          iconSize: [100, 30],
          iconAnchor: [50, 15],
        });

        const inicioMarker = L.marker([inicio[0], inicio[1]], { icon: inicioIcon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 180px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <div style="width: 12px; height: 12px; background: ${color}; border-radius: 50%;"></div>
                <strong>Inicio: ${ruta.origen}</strong>
              </div>
              <p style="margin: 4px 0; font-size: 13px; color: #666;">Ruta hacia: ${ruta.destino}</p>
            </div>
          `);

        layersRef.current.push(inicioMarker);

        // Marcador DESTINO
        const destinoIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="background: #28a745; color: white; padding: 6px 10px; border-radius: 16px; font-weight: 600; font-size: 11px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
              ● ${ruta.destino}
            </div>
          `,
          iconSize: [100, 30],
          iconAnchor: [50, 15],
        });

        const destinoMarker = L.marker([fin[0], fin[1]], { icon: destinoIcon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 180px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <div style="width: 12px; height: 12px; background: #28a745; border-radius: 50%;"></div>
                <strong>Destino: ${ruta.destino}</strong>
              </div>
              <p style="margin: 4px 0; font-size: 13px; color: #666;">Ruta desde: ${ruta.origen}</p>
            </div>
          `);

        layersRef.current.push(destinoMarker);

        // Popup informativo de la ruta
        polyline.bindPopup(`
          <div style="min-width: 220px;">
            <div style="border-left: 4px solid ${color}; padding-left: 12px; margin-bottom: 8px;">
              <h4 style="margin: 0 0 6px 0; color: #333; font-size: 14px; font-weight: 600;">
                🚌 ${ruta.origen} → ${ruta.destino}
              </h4>
            </div>
            <div style="font-size: 12px; color: #666; line-height: 1.4;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span>⏱ Duración:</span>
                <span style="font-weight: 500;">${ruta.tiempoEstimado || "No especificado"}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span>💰 Precio:</span>
                <span style="font-weight: 500;">Lps. ${ruta.precio?.toFixed(2)}</span>
              </div>
              ${ruta.distancia ? `
                <div style="display: flex; justify-content: space-between;">
                  <span>📏 Distancia:</span>
                  <span style="font-weight: 500;">${ruta.distancia} km</span>
                </div>
              ` : ''}
            </div>
            ${geometry ? `
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
                <small style="color: #888;">🗺️ Ruta terrestre calculada</small>
              </div>
            ` : ''}
          </div>
        `);

      } catch (error) {
        console.warn(`Error procesando ruta ${ruta.origen} → ${ruta.destino}:`, error);
      }
    });

    // Ajustar vista del mapa
    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      setTimeout(() => {
        map.fitBounds(bounds, { 
          padding: [40, 40],
          maxZoom: 10
        });
      }, 1000);
    }
  }, [rutas]);

  // Header personalizado
  const header = (
    <div className="pb-3">
      <h2 className="text-xl font-bold">🗺️ Mapa </h2>
      <div className="mt-2">
        <small className="text-gray-600">
          RUTAS <strong>SAENZ</strong> - 
          <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer" className="text-primary ml-1">
            OpenStreetMap
          </a>
        </small>
      </div>
    </div>
  );

  return (
    <Card 
      header={header}
      className="shadow-2"
    >
      <div
        ref={mapContainerRef}
        style={{
          height: "60vh", // Usa el 60% de la altura de la pantalla
          minHeight: "400px", // Altura mínima en pantallas pequeñas
          width: "100%",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
        }}
      />
    </Card>
  );
};

export default MapaInteractivo;
