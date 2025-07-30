'use client';

import React, { useState } from 'react';
import { obtenerRutasMock } from '@/app/rutas/acciones/rutas.acciones';
import { Ruta } from '@/app/rutas/Types/rutas.types';
import RutasAdminTable from './components/RutasAdminTable';
import FormularioRuta from './components/FormularioRuta';
import MapaInteractivo from '@/app/rutas/components/MapaInteractivo';

const PageAdminRutas: React.FC = () => {
  const rutasDisponibles = obtenerRutasMock();
  const [rutaSeleccionada, setRutaSeleccionada] = useState<Ruta | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Gestión de Rutas</h2>

      <div className="flex justify-end">
        <button
          className="p-button p-button-success"
          onClick={() => {
            setRutaSeleccionada(null);
            setMostrarFormulario(true);
          }}
        >
          + Nueva Ruta
        </button>
      </div>

      <RutasAdminTable
        rutas={rutasDisponibles}
        onEditarRuta={(ruta) => {
          setRutaSeleccionada(ruta);
          setMostrarFormulario(true);
        }}
        onEliminarRuta={(rutaId) => {
          alert(`(Simulado) Eliminar ruta con ID: ${rutaId}`);
        }}
      />

      {mostrarFormulario && (
        <>
          <FormularioRuta
            ruta={rutaSeleccionada}
            onCerrar={() => setMostrarFormulario(false)}
            onGuardar={(rutaEditada) => {
              console.log('(Simulado) Guardar ruta', rutaEditada);
              setMostrarFormulario(false);
            }}
          />

          {rutaSeleccionada && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Vista previa de la ruta en el mapa</h3>
              <MapaInteractivo ruta={rutaSeleccionada} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PageAdminRutas;
