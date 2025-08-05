"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import MapaInteractivo from "./components/MapaInteractivo";
import PanelLateral from "./components/PanelLateral";
import HorariosTabla from "./components/HorariosTable";
import AsientosBus from "./components/Asientos/AsientosBus";
import { obtenerRutasMock } from "./acciones/rutas.acciones";
import { Ruta } from "./Types/rutas.types";

const PageRutas: React.FC = () => {
  const rutasDisponibles = obtenerRutasMock();
  const [rutaSeleccionada, setRutaSeleccionada] = useState<Ruta>(rutasDisponibles[0]);
  const router = useRouter();

  // Simulación de asientos disponibles (21 asientos)
  const asientosSimulados = Array.from({ length: 21 }, (_, i) => ({
    numero: i + 1,
    ocupado: [2, 5, 12].includes(i + 1) // Algunos ocupados para ejemplo
  }));

  // Manejar selección de ruta → redirigir a reservaciones
  const manejarSeleccionRuta = (ruta: Ruta) => {
    setRutaSeleccionada(ruta);
    router.push(`/cliente/reservacion
`);
  };

  return (
    <div className="flex h-screen">
      {/* Panel lateral de rutas */}
      <div className="border-right-1 surface-border" style={{ width: "300px" }}>
        <PanelLateral
          rutas={rutasDisponibles}
          onSeleccionarRuta={manejarSeleccionRuta}
        />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 p-4 overflow-auto">
        {/* Mapa */}
        <div className="mb-4">
          <MapaInteractivo ruta={rutaSeleccionada} />
        </div>

        {/* Horarios y asientos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Tabla de horarios */}
          <div>
            <HorariosTabla ruta={rutaSeleccionada} />
          </div>

          {/* Layout de asientos del bus */}
          <div>
            <AsientosBus asientos={asientosSimulados} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default PageRutas;
