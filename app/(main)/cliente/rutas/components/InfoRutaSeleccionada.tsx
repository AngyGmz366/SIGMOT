import React from "react";
import { Card } from "primereact/card";
import { RutaPublica } from "../Types/rutas.types";

interface Props {
  rutaSeleccionada: RutaPublica | null;
}

const InfoRutaSeleccionada: React.FC<Props> = ({ rutaSeleccionada }) => {
  if (!rutaSeleccionada) {
    return (
      <Card title="Información del Viaje" className="shadow-1 h-full">
        <div className="text-center p-6 flex flex-col items-center justify-center h-full">
          <i className="pi pi-info-circle text-3xl text-blue-400 mb-3"></i>
          <p className="text-gray-500 text-sm">Selecciona una ruta para ver los detalles</p>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title={
        <div className="flex items-center gap-2">
          <i className="pi pi-map text-primary"></i>
          <span>{rutaSeleccionada.origen} → {rutaSeleccionada.destino}</span>
        </div>
      } 
      className="shadow-1 h-full"
    >
      <div className="space-y-4 p-2"> {/* 🔼 AUMENTADO ESPACIADO */}
        {/* Duración */}
        <div className="bg-blue-50 p-3 rounded-lg border-1 border-blue-200">
          <div className="flex items-center space-x-3">
            <i className="pi pi-clock text-blue-600 text-lg"></i>
            <div>
              <div className="font-semibold text-blue-800 text-sm">Duración estimada</div>
              <div className="font-bold text-blue-900 text-base">
                {rutaSeleccionada.tiempoEstimado || "No especificado"}
              </div>
            </div>
          </div>
        </div>

        {/* Precio */}
        <div className="bg-green-50 p-4 rounded-lg border-1 border-green-200 text-center">
          <div className="font-semibold text-green-800 text-sm mb-2">Precio por persona</div>
          <div className="text-xl font-bold text-green-900">
            Lps. {rutaSeleccionada.precio?.toFixed(2)}
          </div>
          <div className="text-xs text-green-600 mt-1">Impuestos incluidos</div>
        </div>

        {/* Horarios */}
        <div className="bg-orange-50 p-3 rounded-lg border-1 border-orange-200">
          <div className="flex items-center space-x-2 mb-3">
            <i className="pi pi-calendar text-orange-600"></i>
            <h4 className="font-semibold text-orange-800 text-sm">Horarios disponibles</h4>
          </div>
          <div className="space-y-2">
            {rutaSeleccionada.horarios && rutaSeleccionada.horarios.length > 0 ? (
              rutaSeleccionada.horarios.slice(0, 5).map((horario, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border">
                  <div className="flex items-center space-x-2">
                    <i className={`pi ${idx === 0 ? 'pi-star-fill text-yellow-500' : 'pi-circle text-gray-400'} text-sm`}></i>
                    <span className="text-sm font-medium">{horario}</span>
                  </div>
                  {idx === 0 && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Recomendado</span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-3">
                <i className="pi pi-exclamation-triangle text-orange-400 text-lg mb-2"></i>
                <p className="text-orange-600 text-sm">No hay horarios disponibles</p>
              </div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        {rutaSeleccionada.distancia && (
          <div className="bg-purple-50 p-3 rounded-lg border-1 border-purple-200">
            <div className="flex items-center space-x-3">
              <i className="pi pi-map-marker text-purple-600 text-lg"></i>
              <div>
                <div className="font-semibold text-purple-800 text-sm">Distancia total</div>
                <div className="font-bold text-purple-900 text-base">
                  {rutaSeleccionada.distancia} km
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default InfoRutaSeleccionada;