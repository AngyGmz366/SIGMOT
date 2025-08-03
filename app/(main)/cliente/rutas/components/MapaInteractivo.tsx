import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Ruta } from '../Types/rutas.types';
import L from 'leaflet';
import { Card } from 'primereact/card';
import 'leaflet/dist/leaflet.css';

const busIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/8390/8390779.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
});

interface MapaInteractivoProps {
    ruta?: Ruta;
}

const MapaInteractivo: React.FC<MapaInteractivoProps> = ({ ruta }) => {
    const posicionInicial = ruta?.coordenadas?.[0] ?? [14.072275, -87.192136];

    return (
        <Card title="Mapa de Ruta" className="shadow-2 mb-4">
            {ruta?.tiempoEstimado && (
                <div className="px-3 pt-2 pb-0 text-sm text-primary font-medium">
                    ⏱ Tiempo estimado: <span className="text-color">{ruta.tiempoEstimado}</span>
                </div>
            )}

            <div style={{ height: '50vh', minHeight: '300px', width: '100%' }}>
                <MapContainer
                    key={JSON.stringify(ruta?.coordenadas)} // fuerza el reinicio del mapa al cambiar ruta
                    center={posicionInicial}
                    zoom={7}
                    minZoom={6}
                    maxZoom={10}
                    scrollWheelZoom
                    style={{ height: '100%', width: '100%' }}
                    maxBounds={[
                        [12.9800, -89.3500],
                        [16.0200, -83.1300],
                    ]}
                    maxBoundsViscosity={1.0}
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {ruta?.coordenadas && (
                        <Polyline
                            positions={ruta.coordenadas}
                            color={ruta.estado === 'activo' ? 'blue' : 'gray'}
                            weight={5}
                            dashArray={ruta.estado === 'inactivo' ? '5, 10' : undefined}
                        />
                    )}

                    {ruta?.paradas?.map((parada, index) => (
                        <Marker key={index} position={parada.posicion} icon={busIcon}>
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
