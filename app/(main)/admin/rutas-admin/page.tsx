'use client';

import React, { useState } from 'react';

import { Ruta } from '@/app/(main)/cliente/rutas/Types/rutas.types';

import RutasAdminTable from './components/RutasAdminTable';
import FormularioRuta from './components/FormularioRuta';
import MapaInteractivo from '@/app/(main)/cliente/rutas/components/MapaInteractivo';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { obtenerRutasMock } from '@/app/(main)/cliente/rutas/acciones/rutas.acciones';


const PageAdminRutas: React.FC = () => {
  const [rutas, setRutas] = useState<Ruta[]>(obtenerRutasMock());
  const [rutaSeleccionada, setRutaSeleccionada] = useState<Ruta | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Guardar nueva o editada
  const guardarRuta = (nuevaRuta: Ruta) => {
    if (rutaSeleccionada) {
      setRutas(prev =>
        prev.map(r => (r.id === nuevaRuta.id ? nuevaRuta : r))
      );
    } else {
      setRutas(prev => [...prev, nuevaRuta]);
    }
    cerrarFormulario();
  };

  // Eliminar
  const eliminarRuta = (id: string) => {
    if (confirm('¿Seguro que deseas eliminar esta ruta?')) {
      setRutas(prev => prev.filter(r => r.id !== id));
    }
  };

  // Cerrar formulario
  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setRutaSeleccionada(null);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Título y botón */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <h2 className="text-3xl font-bold text-gray-800">Gestión de Rutas</h2>
        <Button
          label="Nueva Ruta"
          icon="pi pi-plus"
          className="p-button-sm p-button-primary"
          onClick={() => {
            setRutaSeleccionada(null);
            setMostrarFormulario(true);
          }}
        />
      </div>

      {/* Tabla */}
      <Card>
        <RutasAdminTable
          rutas={rutas}
          onEditarRuta={(ruta) => {
            setRutaSeleccionada(ruta);
            setMostrarFormulario(true);
          } }
          onEliminarRuta={eliminarRuta} onCambiarEstado={function (rutaId: string, nuevoEstado: 'activo' | 'inactivo'): void {
            throw new Error('Function not implemented.');
          } }        />
      </Card>

      {/* Formulario y vista previa */}
      {mostrarFormulario && (
        <>
          <FormularioRuta
            ruta={rutaSeleccionada}
            onCerrar={cerrarFormulario}
            onGuardar={guardarRuta}
          />

          {rutaSeleccionada && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Vista previa en el mapa</h3>
              <MapaInteractivo ruta={rutaSeleccionada} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PageAdminRutas;
