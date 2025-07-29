import React from 'react';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { Tooltip } from 'primereact/tooltip';
import './AsientosBus.css'; // Estilos personalizados

interface Asiento {
  numero: number;
  ocupado: boolean;
}

interface AsientosBusProps {
  asientos: Asiento[];
}

const AsientosBus: React.FC<AsientosBusProps> = ({ asientos }) => {
  return (
    <Card title="Asientos Disponibles" className="shadow-2">
      <div className="bus-grid">
        {asientos.map((asiento) => (
          <div
            key={asiento.numero}
            className={`asiento ${asiento.ocupado ? 'ocupado' : 'disponible'}`}
            data-pr-tooltip={`Asiento ${asiento.numero} - ${asiento.ocupado ? 'Ocupado' : 'Disponible'}`}
            data-pr-position="top"
          >
            {asiento.numero}
          </div>
        ))}
      </div>
      <Tooltip target=".asiento" />
      <div className="mt-3 text-sm">
        <Badge severity="success" value="Disponible" className="mr-2" />
        <Badge severity="danger" value="Ocupado" />
      </div>
    </Card>
  );
};

export default AsientosBus;
