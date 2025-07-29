'use client';

import { useEffect, useState } from 'react';
import { Cliente } from '@/types/persona'; // Asegúrate que esté actualizado
import ClienteModal from '../../components/modalCliente';

import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { v4 as uuidv4 } from 'uuid';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteDialog, setClienteDialog] = useState(false);
  const [cliente, setCliente] = useState<Cliente>(crearVacio());
  const [submitted, setSubmitted] = useState(false);

  // Ejemplo de datos para persona (esto debería venir de una API)
  const personas = [
    { label: 'Juan Pérez', value: 'p1' },
    { label: 'Ana Gómez', value: 'p2' }
  ];

  function crearVacio(): Cliente {
    return {
      id: '',
      idPersona: '',
      estado: true,
      fechaRegistro: '',
      fechaUltimaActualizacion: '',
      observaciones: '',
      historialViajes: [],
      historialPagos: []
    };
  }

  useEffect(() => {
    const stored = localStorage.getItem('clientes');
    if (stored) setClientes(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('clientes', JSON.stringify(clientes));
  }, [clientes]);

  const openNew = () => {
    setCliente(crearVacio());
    setSubmitted(false);
    setClienteDialog(true);
  };

  const saveCliente = () => {
    setSubmitted(true);
    if (cliente.idPersona && cliente.estado !== undefined) {
      const now = new Date().toISOString();
      let _clientes = [...clientes];

      if (cliente.id) {
        cliente.fechaUltimaActualizacion = now;
        const index = _clientes.findIndex(c => c.id === cliente.id);
        _clientes[index] = cliente;
      } else {
        cliente.id = uuidv4();
        cliente.fechaRegistro = now;
        cliente.fechaUltimaActualizacion = now;
        _clientes.push(cliente);
      }

      setClientes(_clientes);
      setClienteDialog(false);
      setCliente(crearVacio());
      setSubmitted(false);
    }
  };

  const editCliente = (c: Cliente) => {
    setCliente({ ...c });
    setClienteDialog(true);
  };

  const deleteCliente = (c: Cliente) => {
    setClientes(clientes.filter(cli => cli.id !== c.id));
  };

  const actionTemplate = (rowData: Cliente) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" rounded text onClick={() => editCliente(rowData)} />
      <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteCliente(rowData)} />
    </div>
  );

  return (
    <div className="card">
      <h2 className="mb-4">Clientes</h2>
      <Button label="Nuevo Cliente" icon="pi pi-plus" className="mb-3" onClick={openNew} />
      <DataTable value={clientes} dataKey="id" tableStyle={{ minWidth: '60rem' }}>
        <Column field="idPersona" header="Persona" />
        <Column field="estado" header="Estado" body={(row) => (row.estado ? 'Activo' : 'Inactivo')} />
        <Column field="fechaRegistro" header="Fecha Registro" />
        <Column field="fechaUltimaActualizacion" header="Última Actualización" />
        <Column field="observaciones" header="Observaciones" />
        <Column
          field="historialViajes"
          header="Viajes"
          body={(row) => `${row.historialViajes?.length || 0} viaje(s)`}
        />
        <Column
          field="historialPagos"
          header="Pagos"
          body={(row) => `${row.historialPagos?.length || 0} pago(s)`}
        />
        <Column body={actionTemplate} header="Acciones" />
      </DataTable>

      <ClienteModal
        visible={clienteDialog}
        onHide={() => setClienteDialog(false)}
        onSave={saveCliente}
        cliente={cliente}
        setCliente={setCliente}
        personas={personas}
        submitted={submitted}
      />
    </div>
  );
}
