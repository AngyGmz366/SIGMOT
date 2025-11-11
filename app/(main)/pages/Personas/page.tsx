'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode } from 'primereact/api';
import PersonaModal from '@/app/(main)/components/PersonaModal';
import { Tag } from 'primereact/tag';
import { Persona } from '@/types/persona';
import { cargarPersonas, guardarPersona, eliminarPersona } from '@/modulos/personas/controlador/personas.controlador';

export default function PersonasPage() {
  const toast = useRef<Toast>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<Persona[] | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [filters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    Nombres: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    Apellidos: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });

  const [personaDialogVisible, setPersonaDialogVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
 const [persona, setPersona] = useState<Persona>({
  Id_Persona: 0,
  Nombres: '',
  Apellidos: '',
  DNI: '',
  Telefono: '',
  Fecha_Nacimiento: '',
  Genero: '',           
  TipoPersona: '',
  EstadoPersona: 1,     
  Correo: '',
  Departamento: '',
  Municipio: '',
});


  /* ============================
     🔹 Cargar personas
  ============================ */
  const cargarLista = async () => {
    try {
      const data = await cargarPersonas();
      setPersonas(data);
    } catch (err) {
      console.error('❌ Error cargando personas:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar las personas',
        life: 4000,
      });
    }
  };

  useEffect(() => {
    cargarLista();
  }, []);

  /* ============================
     🔹 Guardar / Actualizar
  ============================ */
  const savePersona = async () => {
    setSubmitted(true);

    if (!persona.Nombres?.trim() || !persona.Apellidos?.trim()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Campos requeridos',
        detail: 'Nombre y apellido son obligatorios.',
        life: 3000,
      });
      return;
    }

    try {
      console.log('Persona a guardar:', persona);
      await guardarPersona(persona); // Verifica si aquí estás enviando `EstadoPersona`

      toast.current?.show({
        severity: 'success',
        summary: persona.Id_Persona ? 'Actualizada' : 'Creada',
        detail: persona.Id_Persona
          ? 'Persona actualizada correctamente'
          : 'Persona registrada correctamente',
        life: 3000,
      });

      setPersonaDialogVisible(false);
      cargarLista();
    } catch (e: any) {
      console.error('❌ Error guardando persona:', e);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: e?.message || 'No se pudo guardar la persona',
        life: 4000,
      });
    }
  };

  /* ============================
     🔹 Eliminar seleccionadas
  ============================ */
 const eliminarSeleccionadas = async () => {
  if (!selectedPersonas || selectedPersonas.length === 0) return;

  try {
    const idUsuarioAdmin = 8;

    for (const p of selectedPersonas) {
      await eliminarPersona(p.Id_Persona, idUsuarioAdmin);
    }

    toast.current?.show({
      severity: 'success',
      summary: 'Eliminadas',
      detail: 'Personas eliminadas correctamente',
      life: 3000,
    });

    // ✅ Recargar inmediatamente la lista desde el backend
    await cargarLista();

    // ✅ Limpiar selección
    setSelectedPersonas(null);
  } catch (err: any) {
    console.error('❌ Error al eliminar:', err);
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'No se pudieron eliminar algunas personas',
      life: 4000,
    });
  }
};


  /* ============================
     🔹 Body Templates
  ============================ */
const correoBodyTemplate = (rowData: Persona) => {
  return <span>{rowData.Correo || '—'}</span>;
};



const estadoPersonaTemplate = (rowData: Persona) => {
  const estado = (rowData.Estado_Usuario || '').toUpperCase();

  if (estado === 'ACTIVA') {
    return <Tag value="Activa" severity="success" icon="pi pi-check-circle" />;
  } else if (estado === 'ELIMINADA' || estado === 'INACTIVA') {
    return <Tag value="Eliminada" severity="danger" icon="pi pi-times-circle" />;
  }

  // En caso de no tener estado definido
  return <Tag value="N/A" severity="warning" icon="pi pi-exclamation-triangle" />;
};


  const actionBodyTemplate = (rowData: Persona) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        severity="warning"
      onClick={() => {
  const tipoPersonaMap: Record<string, number> = { Cliente: 1, Empleado: 2 };
  const generoMap: Record<string, number> = { Masculino: 1, Femenino: 2 };
  const estadoMap: Record<string, number> = { ACTIVA: 1, ELIMINADA: 2 };

  setPersona({
    ...rowData,
    Genero: generoMap[rowData.Genero as keyof typeof generoMap] ?? '',
    TipoPersona: tipoPersonaMap[rowData.TipoPersona as keyof typeof tipoPersonaMap] ?? '',
    EstadoPersona: estadoMap[rowData.Estado_Usuario?.toUpperCase() || 'ACTIVA'] ?? 1,
  });

  setSubmitted(false);
  setPersonaDialogVisible(true);
}}

        tooltip="Editar"
        tooltipOptions={{ position: 'top' }}
        aria-label="Editar persona"
      />
    </div>
  );

  const header = (
    <div className="flex flex-wrap align-items-center justify-content-between gap-2">
      <h4 className="m-0">Gestión de Personas</h4>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          type="search"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar persona..."
        />
      </span>
    </div>
  );

  const leftToolbar = (
    <div className="flex flex-wrap gap-2">
      <Button
        label="Nueva Persona"
        icon="pi pi-plus"
        severity="success"
        onClick={() => {
          setPersona({
            Id_Persona: 0,
            Nombres: '',
            Apellidos: '',
            DNI: '',
            Telefono: '',
            Correo: '',
            Genero: '',
            TipoPersona: '',
            Departamento: '',
            Municipio: '',
            Fecha_Nacimiento: '',
          });
          setSubmitted(false);
          setPersonaDialogVisible(true);
        }}
      />
    </div>
  );

  const rightToolbar = (
    <div className="flex flex-wrap gap-2">
      <Button
        label="Eliminar Seleccionadas"
        icon="pi pi-trash"
        severity="danger"
        onClick={eliminarSeleccionadas}
        disabled={!selectedPersonas || !selectedPersonas.length}
      />
    </div>
  );

  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <Toast ref={toast} />
          <Toolbar className="mb-4" left={leftToolbar} right={rightToolbar} />

          <DataTable
            value={personas}
            selection={selectedPersonas || []}
            onSelectionChange={(e: { value: Persona[] }) => setSelectedPersonas(e.value)}
            dataKey="Id_Persona"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            header={header}
            globalFilter={globalFilter}
            filters={filters}
            responsiveLayout="scroll"
            emptyMessage="No se encontraron personas."
            selectionMode="multiple"
          >
         <Column
             selectionMode="multiple"
             headerStyle={{ width: '3rem' }}
             style={{ textAlign: 'center' }}
           />
            <Column field="Nombres" header="Nombres" sortable />
            <Column field="Apellidos" header="Apellidos" sortable />
            <Column field="DNI" header="DNI" sortable />
            <Column field="Telefono" header="Teléfono" sortable />
            <Column
  field="TipoPersona"
  header="Tipo de Persona"
  sortable
  body={(rowData) => (
    <span>
      {rowData.TipoPersona === 1
        ? 'Cliente'
        : rowData.TipoPersona === 2
        ? 'Empleado'
        : rowData.TipoPersona || '—'}
    </span>
  )}
/>
            <Column field="Correo" header="Correo Electrónico" body={correoBodyTemplate} sortable />
            <Column body={estadoPersonaTemplate} header="Estado" />
            <Column body={actionBodyTemplate} header="Acciones" exportable={false} style={{ minWidth: '8rem' }} />
          </DataTable>

          <PersonaModal
            visible={personaDialogVisible}
            onHide={() => setPersonaDialogVisible(false)}
            onSave={savePersona}
            persona={persona}
            setPersona={setPersona}
            submitted={submitted}
          />
        </div>
      </div>
    </div>
  );
}
