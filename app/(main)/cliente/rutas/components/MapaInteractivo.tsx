"use client";
import React, { useEffect, useRef } from "react";
import L from "leaflet";
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
  const mapRef = useRef<L.Map | null>(null);

  // 🔹 Función para obtener ruta real usando OSRM (Open Source Routing Machine)
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

  // 🔹 Función para decodificar polyline (backup si OSRM falla)
  const decodificarPolyline = (encoded: string) => {
    const points = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;
    
    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      
      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      
      points.push([lat * 1e-5, lng * 1e-5]);
    }
    
    return points;
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

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

      // 🗺️ Capa base de OpenStreetMap
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);

      // 🏞️ Capa de satélite (opcional)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19,
      }).addTo(mapRef.current);
      
      // Solo mostrar una capa a la vez
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer && (layer as any).options?.attribution?.includes('Esri')) {
          mapRef.current!.removeLayer(layer);
        }
      });
    }

    const map = mapRef.current;
    
    // Limpiar rutas anteriores
    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const colores = ["#007bff", "#e91e63", "#ff9800", "#28a745", "#9c27b0"];
    const allCoords: [number, number][] = [];

    // 🚗 Procesar cada ruta para obtener trazado real
    rutas.forEach(async (r, idx) => {
      if (!r.coordenadas || r.coordenadas.length < 2) return;

      const coords = r.coordenadas.map((p) => [p.lat, p.lng]) as [number, number][];
      const inicio = coords[0];
      const fin = coords[coords.length - 1];
      
      allCoords.push(inicio, fin);
      const color = colores[idx % colores.length];

      try {
        // 🛣️ Intentar obtener ruta real de OSRM
        const geometry = await obtenerRutaReal(inicio, fin);
        
        let rutaCoords: [number, number][] = [];
        
        if (geometry) {
          // Usar ruta real de OSRM
          rutaCoords = geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
        } else {
          // Fallback a línea recta suavizada
          rutaCoords = coords;
        }

        // 🛣️ Dibujar la ruta
        const polyline = L.polyline(rutaCoords, {
          color: color,
          weight: 5,
          opacity: 0.8,
          lineJoin: "round",
          lineCap: "round",
        }).addTo(map);

        // 📍 Marcador INICIO
        const inicioIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background: ${color};
              color: white;
              padding: 6px 10px;
              border-radius: 16px;
              font-weight: 600;
              font-size: 11px;
              border: 2px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            ">
              ▲ ${r.origen}
            </div>
          `,
          iconSize: [100, 30],
          iconAnchor: [50, 15]
        });

        L.marker(inicio, { icon: inicioIcon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 180px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <div style="width: 12px; height: 12px; background: ${color}; border-radius: 50%;"></div>
                <strong>Inicio: ${r.origen}</strong>
              </div>
              <p style="margin: 4px 0; font-size: 13px; color: #666;">Ruta hacia: ${r.destino}</p>
            </div>
          `);

        // 📍 Marcador DESTINO
        const destinoIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background: #28a745;
              color: white;
              padding: 6px 10px;
              border-radius: 16px;
              font-weight: 600;
              font-size: 11px;
              border: 2px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            ">
              ● ${r.destino}
            </div>
          `,
          iconSize: [100, 30],
          iconAnchor: [50, 15]
        });

        L.marker(fin, { icon: destinoIcon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 180px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <div style="width: 12px; height: 12px; background: #28a745; border-radius: 50%;"></div>
                <strong>Destino: ${r.destino}</strong>
              </div>
              <p style="margin: 4px 0; font-size: 13px; color: #666;">Ruta desde: ${r.origen}</p>
            </div>
          `);

        // 📋 Popup informativo de la ruta
        polyline.bindPopup(`
          <div style="min-width: 220px;">
            <div style="border-left: 4px solid ${color}; padding-left: 12px; margin-bottom: 8px;">
              <h4 style="margin: 0 0 6px 0; color: #333; font-size: 14px; font-weight: 600;">
                🚌 ${r.origen} → ${r.destino}
              </h4>
            </div>
            <div style="font-size: 12px; color: #666; line-height: 1.4;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span>⏱ Duración:</span>
                <span style="font-weight: 500;">${r.tiempoEstimado || "No especificado"}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span>💰 Precio:</span>
                <span style="font-weight: 500;">Lps. ${r.precio?.toFixed(2)}</span>
              </div>
              ${r.distancia ? `
                <div style="display: flex; justify-content: space-between;">
                  <span>📏 Distancia:</span>
                  <span style="font-weight: 500;">${r.distancia} km</span>
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
        console.warn(`Error procesando ruta ${r.origen} → ${r.destino}:`, error);
      }
    });

    // 🔄 Ajustar vista del mapa
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

  // Crear el header personalizado
  const header = (
    <div className="pb-3">
      <h2 className="text-xl font-bold">🗺️ Mapa de Rutas Terrestres</h2>
      <div className="mt-2">
        <small className="text-gray-600">
          🛣️ Rutas calculadas por <strong>OSRM</strong> - 
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
          height: "60vh",
          minHeight: "400px",
          width: "100%",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
        }}
      />
    </Card>
  );
};

export default MapaInteractivo;