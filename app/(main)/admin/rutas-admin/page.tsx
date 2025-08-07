'use client';

import React, { useState, useRef } from 'react';
import { Ruta } from '@/app/(main)/cliente/rutas/Types/rutas.types';

import RutasAdminTable from './components/RutasAdminTable';
import FormularioRuta from './components/FormularioRuta';
import MapaInteractivo from '@/app/(main)/cliente/rutas/components/MapaInteractivo';

import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import { obtenerRutasMock } from '@/app/(main)/cliente/rutas/acciones/rutas.acciones';

const PageAdminRutas: React.FC = () => {
  const [rutas, setRutas] = useState<Ruta[]>(obtenerRutasMock());
  const [rutaSeleccionada, setRutaSeleccionada] = useState<Ruta | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const toast = useRef<Toast>(null);

  const mostrarMensaje = (detalle: string) => {
    toast.current?.show({
      severity: 'success',
      summary: 'Éxito',
      detail: detalle,
      life: 3000
    });
  };

  const guardarRuta = (nuevaRuta: Ruta) => {
    if (rutaSeleccionada) {
      setRutas(prev =>
        prev.map(r => (r.id === nuevaRuta.id ? nuevaRuta : r))
      );
      mostrarMensaje('Ruta actualizada correctamente');
    } else {
      setRutas(prev => [...prev, nuevaRuta]);
      mostrarMensaje('Ruta creada correctamente');
    }
    cerrarFormulario();
  };

  const eliminarRuta = (id: string) => {
    confirmDialog({
      message: '¿Seguro que deseas eliminar esta ruta?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        setRutas(prev => prev.filter(r => r.id !== id));
        mostrarMensaje('Ruta eliminada correctamente');
      }
    });
  };

  const cambiarEstadoRuta = (rutaId: string, nuevoEstado: 'activo' | 'inactivo') => {
    setRutas(prev =>
      prev.map(r =>
        r.id === rutaId ? { ...r, estado: nuevoEstado } : r
      )
    );
  };

  const cerrarFormulario = () => {
    setMostrarModal(false);
    setRutaSeleccionada(null);
  };

  return (
    <div className="p-4 space-y-6">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Título y botón */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <h2 className="text-3xl font-bold text-gray-800">Gestión de Rutas</h2>
        <Button
          label="Nueva Ruta"
          icon="pi pi-plus"
          className="btn-verde"
          onClick={() => {
            setRutaSeleccionada(null);
            setMostrarModal(true);
          }}
        />
      </div>

      {/* Tabla */}
      <Card>
        <RutasAdminTable
          rutas={rutas}
          onEditarRuta={(ruta) => {
            setRutaSeleccionada(ruta);
            setMostrarModal(true);
          }}
          onEliminarRuta={eliminarRuta}
          onCambiarEstado={cambiarEstadoRuta}
        />
      </Card>

      {/* Modal con Formulario */}
      <Dialog
        header={rutaSeleccionada ? 'Editar Ruta' : 'Nueva Ruta'}
        visible={mostrarModal}
        onHide={cerrarFormulario}
        style={{ width: '50vw' }}
        breakpoints={{ '960px': '75vw', '640px': '100vw' }}
        modal
      >
        <FormularioRuta
          ruta={rutaSeleccionada}
          onCerrar={cerrarFormulario}
          onGuardar={guardarRuta}
        />

        {/* Mapa solo si se edita */}
        {rutaSeleccionada && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Vista previa en el mapa</h3>
            <MapaInteractivo key={`map-${rutaSeleccionada.id}`} ruta={rutaSeleccionada} />
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default PageAdminRutas;
