import React from "react";
import { Card } from "primereact/card";
import { Badge } from "primereact/badge";
import { Tooltip } from "primereact/tooltip";
import "./AsientosBus.css";

interface Asiento {
  numero: number;
  ocupado: boolean;
}

interface AsientosBusProps {
  asientos: Asiento[];
}

const AsientosBus: React.FC<AsientosBusProps> = ({ asientos }) => {
  // Reorganizamos los asientos en filas con pasillo
  const filas = [
    [1, 2, null, 3, 4],   // null es el pasillo
    [5, 6, null, 7, 8],
    [9, 10, null, 11, 12],
    [13, 14, null, 15, 16],
    [17, 18, null, 19, 20],
    [21, null, null, null, null] // última fila con un asiento
  ];

  return (
    <Card title="Asientos Disponibles" className="shadow-2">
      <div className="bus-layout">
        {/* Conductor */}
        <div className="conductor-area">
          <span className="emoji-bus">🚌</span>
          <span className="texto-conductor">Conductor</span>
        </div>

        {/* Filas de asientos */}
        <div className="asientos-container">
          {filas.map((fila, i) =>
            fila.map((num, j) => {
              if (num === null) {
                return <div key={`p-${i}-${j}`} className="pasillo"></div>;
              }

              const asiento = asientos.find((a) => a.numero === num);
              const ocupado = asiento?.ocupado ?? false;

              return (
                <div
                  key={num}
                  className={`asiento ${ocupado ? "ocupado" : "disponible"}`}
                  data-pr-tooltip={`Asiento ${num} - ${
                    ocupado ? "Ocupado" : "Disponible"
                  }`}
                  data-pr-position="top"
                >
                  {num}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Tooltip PrimeReact */}
      <Tooltip target=".asiento" />

      {/* Leyenda */}
      <div className="leyenda">
        <Badge severity="success" value="Disponible" className="mr-2" />
        <Badge severity="danger" value="Ocupado" />
      </div>
    </Card>
  );
};

export default AsientosBus;
