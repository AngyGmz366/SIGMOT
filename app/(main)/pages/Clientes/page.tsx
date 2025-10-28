'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';

import ClienteModal from '@/app/(main)/components/ClienteModal';
import { Cliente, Persona } from '@/types/persona';
import { cargarPersonas } from '@/modulos/personas/controlador/personas.controlador';
import {
  cargarClientes,
  guardarCliente,
  borrarCliente,
} from '@/modulos/clientes/controlador/clientes.controlador';

function ClientesPage() {
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<any>>(null);

  // Estados principales
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [clienteDialog, setClienteDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cliente, setCliente] = useState<Cliente>({
    id: 0,
    idPersona: 0,
    idEstadoCliente: 1,
    estado: 'ACTIVO',
  });
  const [selectedClientes, setSelectedClientes] = useState<Cliente[]>([]);
  const [deleteClienteDialog, setDeleteClienteDialog] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

  // Catálogo de estados
  const estadosCliente = [
    { label: 'ACTIVO', value: 1 },
    { label: 'INACTIVO', value: 2 },
  ];

  /* ===============================
     🔹 CARGAR CLIENTES Y PERSONAS
  =============================== */
  useEffect(() => {
    async function fetchData() {
      try {
        const [clientesData, personasData] = await Promise.all([
          cargarClientes(),
          cargarPersonas(1), // 1 = Tipo Persona Cliente
        ]);
        setClientes(clientesData);
        setPersonas(personasData);
      } catch (err: any) {
        console.error('❌ Error cargando datos:', err);
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'No se pudieron cargar los datos',
          life: 4000,
        });
      }
    }
    fetchData();
  }, []);

  /* ===============================
     🔹 CRUD CLIENTE
  =============================== */
  const openNew = () => {
    setCliente({ id: 0, idPersona: 0, idEstadoCliente: 1, estado: 'ACTIVO' });
    setSubmitted(false);
    setClienteDialog(true);
  };

  const hideDialog = () => {
    setClienteDialog(false);
    setSubmitted(false);
  };

  const saveCliente = async () => {
    setSubmitted(true);

    if (!cliente.idPersona || !cliente.idEstadoCliente) return;

    try {
      await guardarCliente(cliente);

      toast.current?.show({
        severity: 'success',
        summary: cliente.id ? 'Actualizado' : 'Creado',
        detail: cliente.id
          ? 'Cliente actualizado correctamente'
          : 'Cliente creado correctamente',
        life: 3000,
      });

      const nuevos = await cargarClientes();
      setClientes(nuevos);

      setClienteDialog(false);
      setCliente({ id: 0, idPersona: 0, idEstadoCliente: 1, estado: 'ACTIVO' });
      setSubmitted(false);
    } catch (err: any) {
      console.error('❌ Error guardando cliente:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail:
          err.response?.data?.error ||
          err.message ||
          'No se pudo guardar el cliente',
        life: 4000,
      });
    }
  };

  const editCliente = (c: Cliente) => {
    setCliente({ ...c });
    setSubmitted(false);
    setClienteDialog(true);
  };

  const confirmDeleteCliente = (c: Cliente) => {
    setCliente(c);
    setDeleteClienteDialog(true);
  };

  const deleteCliente = async () => {
    if (!cliente.id || cliente.id <= 0) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'ID de cliente inválido',
        life: 4000,
      });
      return;
    }

    try {
      await borrarCliente(cliente.id);

      toast.current?.show({
        severity: 'success',
        summary: 'Desactivado',
        detail: 'Cliente desactivado correctamente',
        life: 3000,
      });

      const nuevos = await cargarClientes();
      setClientes(nuevos);

      setDeleteClienteDialog(false);
      setCliente({ id: 0, idPersona: 0, idEstadoCliente: 1, estado: 'ACTIVO' });
      setSubmitted(false);
    } catch (err: any) {
      console.error('❌ Error desactivando cliente:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.message || 'No se pudo desactivar el cliente',
        life: 4000,
      });
    }
  };

  /* ===============================
     🔹 Templates de la tabla
  =============================== */
  const personaTemplate = (rowData: Cliente) => {
    const p = personas.find((x) => x.Id_Persona === rowData.idPersona);
    return p ? `${p.Nombres} ${p.Apellidos}` : '—';
  };

  const estadoTemplate = (rowData: Cliente) => (
    <Tag
      value={rowData.estado}
      severity={
        rowData.estado?.toUpperCase() === 'ACTIVO' ? 'success' : 'danger'
      }
      icon={
        rowData.estado?.toUpperCase() === 'ACTIVO'
          ? 'pi pi-check-circle'
          : 'pi pi-times-circle'
      }
    />
  );

  const actionTemplate = (rowData: Cliente) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        severity="warning"
        onClick={() => editCliente(rowData)}
      />
      <Button
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        onClick={() => confirmDeleteCliente(rowData)}
      />
      <Button
        icon="pi pi-eye"
        rounded
        text
        severity="info"
        title="Ver historial"
        onClick={() => setClienteSeleccionado(rowData)}
      />
    </div>
  );

  /* ===============================
     🔹 Header y Diálogos
  =============================== */
  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h5 className="m-0">Gestión de Clientes</h5>
      <span className="block mt-2 md:mt-0 p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          type="search"
          placeholder="Buscar..."
          onChange={(e) =>
            dt.current?.filter(e.target.value, 'global', 'contains')
          }
          className="w-full"
        />
      </span>
    </div>
  );

  const deleteClienteDialogFooter = (
    <>
      <Button
        label="No"
        icon="pi pi-times"
        text
        onClick={() => setDeleteClienteDialog(false)}
      />
      <Button label="Sí" icon="pi pi-check" text onClick={deleteCliente} />
    </>
  );

  /* ===============================
     🔹 Render principal
  =============================== */
  const clientesConNombre = clientes.map((cliente, index) => {
    const persona = personas.find((p) => p.Id_Persona === cliente.idPersona);
    return {
      ...cliente,
      id: cliente.id || cliente.idPersona || index + 1,
      nombreCompleto: persona
        ? `${persona.Nombres} ${persona.Apellidos}`
        : '—',
    };
  });

  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <Toast ref={toast} />
          <Toolbar
            className="mb-4"
            left={() => (
                <Button
                label="Nuevo Cliente"
                icon="pi pi-plus"
                severity="success"
                onClick={openNew}
              />
            )}
          />

          <DataTable
            ref={dt}
            value={clientesConNombre}
            selection={selectedClientes}
            onSelectionChange={(e) => setSelectedClientes(e.value)}
            dataKey="id"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            className="datatable-responsive"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} clientes"
            emptyMessage="No se encontraron clientes."
            header={header}
            responsiveLayout="scroll"
          >
      <Column
          selectionMode="multiple"
          headerStyle={{ width: '3rem' }}
          style={{ textAlign: 'center' }}
        /> 
            <Column header="Nombre" body={personaTemplate} sortable />
            <Column
              field="estado"
              header="Estado"
              body={estadoTemplate}
              sortable
            />
            <Column
              body={actionTemplate}
              headerStyle={{ minWidth: '10rem' }}
            />
          </DataTable>

          {/* Modal Crear/Editar */}
          <ClienteModal
            visible={clienteDialog}
            onHide={hideDialog}
            onSave={saveCliente}
            cliente={cliente}
            setCliente={setCliente}
            personas={personas}
            estadosCliente={estadosCliente}
            submitted={submitted}
          />

          {/* Confirmar eliminación */}
          <Dialog
            visible={deleteClienteDialog}
            style={{ width: '450px' }}
            header="Confirmar"
            modal
            footer={deleteClienteDialogFooter}
            onHide={() => setDeleteClienteDialog(false)}
          >
            <div className="flex align-items-center justify-content-center">
              <i className="pi pi-exclamation-triangle icon-warning" />
              {cliente && (
                <span>
                  ¿Está seguro de eliminar al cliente{' '}
                  <b>{personaTemplate(cliente)}</b>?
                </span>
              )}
            </div>
          </Dialog>

          {/* Historial (placeholder futuro) */}
          {clienteSeleccionado && (
            <div className="mt-5">
              <div className="flex justify-content-between align-items-center mb-4">
                <h3>Historial de {personaTemplate(clienteSeleccionado)}</h3>
                <Button
                  label="Cerrar Historial"
                  icon="pi pi-times"
                  className="btn-cancelar"
                  onClick={() => setClienteSeleccionado(null)}
                />
              </div>
              <p>Aquí se mostrará el historial de viajes y pagos del cliente seleccionado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default ClientesPage;
