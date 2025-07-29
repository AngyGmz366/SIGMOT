import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Ruta } from '../Types/rutas.types';
import L from 'leaflet';
import { Card } from 'primereact/card';

import 'leaflet/dist/leaflet.css';

// Fix para íconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface MapaInteractivoProps {
  ruta?: Ruta;
}

const MapaInteractivo: React.FC<MapaInteractivoProps> = ({ ruta }) => {
  const posicionInicial = ruta?.coordenadas?.[0] ?? [14.072275, -87.192136];

  return (
    <Card title="Mapa de Ruta" className="shadow-2 mb-4">
      {/* Mostrar tiempo estimado si existe */}
      {ruta?.tiempoEstimado && (
        <div className="px-3 pt-2 pb-0 text-sm text-primary font-medium">
          ⏱ Tiempo estimado: <span className="text-color">{ruta.tiempoEstimado}</span>
        </div>
      )}

      <div style={{ height: '500px', width: '100%' }}>
        <MapContainer
          center={posicionInicial}
          zoom={7}
          minZoom={6}
          maxZoom={10}
          scrollWheelZoom
          style={{ height: '100%', width: '100%' }}
          maxBounds={[
            [12.9800, -89.3500], // suroeste (frontera con El Salvador)
            [16.0200, -83.1300], // noreste (cerca de La Mosquitia)
          ]}
          maxBoundsViscosity={1.0}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Dibuja la línea de la ruta */}
          {ruta?.coordenadas && (
            <Polyline
              positions={ruta.coordenadas}
              color={ruta.estado === 'activo' ? 'blue' : 'gray'}
              weight={5}
              dashArray={ruta.estado === 'inactivo' ? '5, 10' : undefined}
            />
          )}

          {/* Coloca marcadores en cada parada */}
          {ruta?.paradas?.map((parada, index) => (
            <Marker key={index} position={parada.posicion}>
              <Popup>
                <strong>{parada.nombre}</strong><br />
                Horarios: {parada.horario.join(', ')}<br />
                Tarifa: L. {parada.tarifa}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </Card>
  );
};

export default MapaInteractivo;
