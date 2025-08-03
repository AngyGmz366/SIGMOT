'use client';

import { useEffect, useState } from 'react';
import { Persona } from '@/types/persona';
import PersonaModal from '../../components/PersonaModal';

import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { v4 as uuidv4 } from 'uuid';

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [personaDialog, setPersonaDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [persona, setPersona] = useState<Persona>(crearVacio());
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar personas desde localStorage
  useEffect(() => {
    const storedPersonas = localStorage.getItem('personas');
    if (storedPersonas) {
      setPersonas(JSON.parse(storedPersonas));
    }
    setIsLoaded(true);
  }, []);

  // Guardar en localStorage cuando personas cambian
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('personas', JSON.stringify(personas));
    }
  }, [personas, isLoaded]);

  function crearVacio(): Persona {
    return {
      id: '',
      nombre: '',
      apellido: '',
      dni: '',
      fechaNacimiento: '',
      correo: '',
      telefono: '',
      idGenero: '',
      idTipoPersona: '1', // ← Esto asegura que sea Cliente por defecto
      idDireccion: '',
      idUsuario: ''
    };
  }

  const openNew = () => {
    setPersona(crearVacio());
    setSubmitted(false);
    setPersonaDialog(true);
  };

  const hideDialog = () => {
    setPersonaDialog(false);
  };

  const savePersona = () => {
    setSubmitted(true);
    if (
      persona.nombre &&
      persona.apellido &&
      persona.dni &&
      persona.correo &&
      persona.telefono &&
      persona.idGenero &&
      persona.idTipoPersona &&
      persona.idDireccion
    ) {
      const personasActualizadas = [...personas];

      if (persona.id) {
        const index = personasActualizadas.findIndex(p => p.id === persona.id);
        if (index !== -1) {
          personasActualizadas[index] = persona;
        }
      } else {
        const personaConId = { ...persona, id: uuidv4() };
        personasActualizadas.push(personaConId);
      }

      setPersonas(personasActualizadas);
      setPersonaDialog(false);
      setPersona(crearVacio());
      setSubmitted(false);
    }
  };

  const editPersona = (p: Persona) => {
    setPersona({ ...p });
    setPersonaDialog(true);
  };

  const deletePersona = (p: Persona) => {
    setPersonas(personas.filter(per => per.id !== p.id));
  };

  const actionTemplate = (rowData: Persona) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" rounded text onClick={() => editPersona(rowData)} />
      <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deletePersona(rowData)} />
    </div>
  );

  return (
    <div className="card">
      <h2 className="mb-4">Personas</h2>
      <Button label="Nueva Persona" icon="pi pi-plus" className="mb-3" onClick={openNew} />

      <DataTable value={personas} dataKey="id" tableStyle={{ minWidth: '60rem' }}>
        <Column field="nombre" header="Nombre" />
        <Column field="apellido" header="Apellido" />
        <Column field="dni" header="DNI" />
        <Column field="fechaNacimiento" header="Fecha Nac." />
        <Column field="correo" header="Correo" />
        <Column field="telefono" header="Teléfono" />
        <Column field="idGenero" header="Género" />
        <Column field="idTipoPersona" header="Tipo Persona" />
        <Column field="idDireccion" header="Dirección" />
        <Column field="idUsuario" header="Usuario" />
        <Column body={actionTemplate} header="Acciones" />
      </DataTable>

      <PersonaModal
        visible={personaDialog}
        onHide={hideDialog}
        onSave={savePersona}
        persona={persona}
        setPersona={setPersona}
        submitted={submitted}
      />
    </div>
  );
}
