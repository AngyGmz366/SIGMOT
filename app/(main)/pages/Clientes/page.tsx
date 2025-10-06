'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef } from 'react';
import { Cliente, Persona, Viaje, Pago } from '@/types/persona';
import ClienteModal from '../../components/ClienteModal';
import ViajeModal from '../../components/ViajeModal';
import PagoModal from '../../components/PagoModal';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { FilterMatchMode } from 'primereact/api';
import { Tag } from 'primereact/tag';
import { v4 as uuidv4 } from 'uuid';
import { FileUpload } from 'primereact/fileupload';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';

/* -------------------------------------------------------------------------- */
/*                    COMPONENTE PRINCIPAL - CLIENTES PAGE                    */
/* -------------------------------------------------------------------------- */

export default function ClientesPage() {
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<any>>(null);

  // ---------------------- Estados principales ----------------------
  const [clienteDialog, setClienteDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cliente, setCliente] = useState<Cliente>({ id: '', idPersona: '', estado: '' });
  const [selectedClientes, setSelectedClientes] = useState<Cliente[]>([]);
  const [deleteClienteDialog, setDeleteClienteDialog] = useState(false);
  const [deleteClientesDialog, setDeleteClientesDialog] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

  const [viajeDialog, setViajeDialog] = useState(false);
  const [viaje, setViaje] = useState<Viaje>(crearViajeVacio());
  const [viajeSubmitted, setViajeSubmitted] = useState(false);

  const [pagoDialog, setPagoDialog] = useState(false);
  const [pago, setPago] = useState<Pago>(crearPagoVacio());
  const [pagoSubmitted, setPagoSubmitted] = useState(false);

  // ---------------------- Datos almacenados ----------------------
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);

  // ---------------------- Carga segura desde localStorage ----------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const p = localStorage.getItem('personas');
      const c = localStorage.getItem('clientes');
      const v = localStorage.getItem('viajes');
      const pa = localStorage.getItem('pagos');
      setPersonas(p ? JSON.parse(p) : []);
      setClientes(c ? JSON.parse(c) : []);
      setViajes(v ? JSON.parse(v) : []);
      setPagos(pa ? JSON.parse(pa) : []);
    } catch (err) {
      console.error('Error cargando datos del localStorage:', err);
    }
  }, []);

  // Guardar cambios
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('clientes', JSON.stringify(clientes));
  }, [clientes]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('viajes', JSON.stringify(viajes));
  }, [viajes]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('pagos', JSON.stringify(pagos));
  }, [pagos]);

  /* --------------------------- Helpers para vacíos --------------------------- */
  function crearClienteVacio(): Cliente {
    return { id: '', idPersona: '', estado: 'activo' };
  }
  function crearViajeVacio(): Viaje {
    return { id: '', idCliente: '', fecha: '', origen: '', destino: '', costo: 0 };
  }
  function crearPagoVacio(): Pago {
    return { id: '', idCliente: '', fechaPago: '', monto: 0, metodoPago: '' };
  }

  /* --------------------------- CRUD de Clientes --------------------------- */
  const openNewCliente = () => {
    setCliente(crearClienteVacio());
    setSubmitted(false);
    setClienteDialog(true);
  };
  const hideDialog = () => setClienteDialog(false);

  const saveCliente = () => {
    setSubmitted(true);
    if (cliente.idPersona && cliente.estado) {
      const _clientes = [...clientes];
      if (cliente.id) {
        const idx = _clientes.findIndex((c) => c.id === cliente.id);
        _clientes[idx] = cliente;
        toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Cliente actualizado', life: 3000 });
      } else {
        cliente.id = uuidv4();
        _clientes.push(cliente);
        toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Cliente creado', life: 3000 });
      }
      setClientes(_clientes);
      setClienteDialog(false);
      setCliente(crearClienteVacio());
      setSubmitted(false);
    }
  };

  const editCliente = (c: Cliente) => {
    setCliente({ ...c });
    setClienteDialog(true);
  };
  const confirmDeleteCliente = (c: Cliente) => {
    setCliente(c);
    setDeleteClienteDialog(true);
  };
  const deleteCliente = () => {
    const _clientes = clientes.filter((c) => c.id !== cliente.id);
    setClientes(_clientes);
    setDeleteClienteDialog(false);
    toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Cliente eliminado', life: 3000 });
  };
  const confirmDeleteSelected = () => setDeleteClientesDialog(true);
  const deleteSelectedClientes = () => {
    const selectedIds = selectedClientes.map((c) => c.id);
    const _clientes = clientes.filter((c) => !selectedIds.includes(c.id));
    setClientes(_clientes);
    setDeleteClientesDialog(false);
    setSelectedClientes([]);
    toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Clientes eliminados', life: 3000 });
  };

  /* --------------------------- CRUD de Viajes --------------------------- */
  const openNewViaje = () => {
    if (!clienteSeleccionado) return;
    setViaje({ ...crearViajeVacio(), idCliente: clienteSeleccionado.id });
    setViajeSubmitted(false);
    setViajeDialog(true);
  };
  const saveViaje = () => {
    setViajeSubmitted(true);
    if (viaje.fecha && viaje.origen && viaje.destino && viaje.costo > 0) {
      const _viajes = [...viajes];
      if (viaje.id) {
        const idx = _viajes.findIndex((v) => v.id === viaje.id);
        _viajes[idx] = viaje;
        toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Viaje actualizado', life: 3000 });
      } else {
        viaje.id = uuidv4();
        _viajes.push(viaje);
        toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Viaje creado', life: 3000 });
      }
      setViajes(_viajes);
      setViajeDialog(false);
    }
  };
  const deleteViaje = (v: Viaje) => {
    setViajes(viajes.filter((vi) => vi.id !== v.id));
    toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Viaje eliminado', life: 3000 });
  };

  /* --------------------------- CRUD de Pagos --------------------------- */
  const openNewPago = () => {
    if (!clienteSeleccionado) return;
    setPago({ ...crearPagoVacio(), idCliente: clienteSeleccionado.id });
    setPagoSubmitted(false);
    setPagoDialog(true);
  };
  const savePago = () => {
    setPagoSubmitted(true);
    if (pago.fechaPago && pago.monto > 0 && pago.metodoPago) {
      const _pagos = [...pagos];
      if (pago.id) {
        const idx = _pagos.findIndex((p) => p.id === pago.id);
        _pagos[idx] = pago;
      } else {
        pago.id = uuidv4();
        _pagos.push(pago);
      }
      setPagos(_pagos);
      setPagoDialog(false);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Pago guardado', life: 3000 });
    }
  };
  const deletePago = (p: Pago) => {
    setPagos(pagos.filter((pa) => pa.id !== p.id));
    toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Pago eliminado', life: 3000 });
  };

  /* --------------------------- Render templates --------------------------- */
  const personaNombreTemplate = (rowData: Cliente) => {
    const p = personas.find((per) => per.id === rowData.idPersona);
    return p ? `${p.nombre} ${p.apellido}` : 'No asignado';
  };
  const estadoTemplate = (rowData: Cliente) => (
    <Tag value={rowData.estado === 'activo' ? 'Activo' : 'Inactivo'} severity={rowData.estado === 'activo' ? 'success' : 'danger'} />
  );
  const actionTemplate = (rowData: Cliente) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" rounded text onClick={() => editCliente(rowData)} />
      <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => confirmDeleteCliente(rowData)} />
      <Button icon="pi pi-eye" rounded text onClick={() => setClienteSeleccionado(rowData)} title="Ver Historial" />
    </div>
  );

  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h5 className="m-0">Gestión de Clientes</h5>
      <span className="block mt-2 md:mt-0 p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          type="search"
          placeholder="Buscar..."
          onChange={(e) => dt.current?.filter(e.target.value, 'global', 'contains')}
          className="w-full"
        />
      </span>
    </div>
  );

  const deleteClienteDialogFooter = (
    <>
      <Button label="No" icon="pi pi-times" text onClick={() => setDeleteClienteDialog(false)} />
      <Button label="Sí" icon="pi pi-check" text onClick={deleteCliente} />
    </>
  );

  const deleteClientesDialogFooter = (
    <>
      <Button label="No" icon="pi pi-times" text onClick={() => setDeleteClientesDialog(false)} />
      <Button label="Sí" icon="pi pi-check" text onClick={deleteSelectedClientes} />
    </>
  );

  /* --------------------------- Render principal --------------------------- */
  const clientesConNombre = clientes.map((cliente) => {
    const persona = personas.find((p) => p.id === cliente.idPersona);
    return {
      ...cliente,
      nombreCompleto: persona ? `${persona.nombre} ${persona.apellido}`.toLowerCase() : ''
    };
  });

  const viajesCliente = clienteSeleccionado ? viajes.filter((v) => v.idCliente === clienteSeleccionado.id) : [];
  const pagosCliente = clienteSeleccionado ? pagos.filter((p) => p.idCliente === clienteSeleccionado.id) : [];

  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <Toast ref={toast} />
          <Toolbar className="mb-4" left={() => <Button label="Nuevo Cliente" icon="pi pi-plus" severity="success" onClick={openNewCliente} />} right={() => (
            <>
              <FileUpload mode="basic" accept=".csv" chooseLabel="Importar" className="mr-2 inline-block" />
              <Button label="Exportar" icon="pi pi-upload" severity="help" onClick={() => dt.current?.exportCSV()} />
            </>
          )} />

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
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
            <Column header="Nombre" body={personaNombreTemplate} sortable />
            <Column field="estado" header="Estado" body={estadoTemplate} sortable />
            <Column body={actionTemplate} headerStyle={{ minWidth: '10rem' }} />
          </DataTable>

          <ClienteModal visible={clienteDialog} onHide={hideDialog} onSave={saveCliente} cliente={cliente} setCliente={setCliente} personas={personas} submitted={submitted} />

          <Dialog visible={deleteClienteDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteClienteDialogFooter} onHide={() => setDeleteClienteDialog(false)}>
            <div className="flex align-items-center justify-content-center">
              <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
              {cliente && <span>¿Está seguro de eliminar al cliente <b>{personaNombreTemplate(cliente)}</b>?</span>}
            </div>
          </Dialog>

          <Dialog visible={deleteClientesDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteClientesDialogFooter} onHide={() => setDeleteClientesDialog(false)}>
            <div className="flex align-items-center justify-content-center">
              <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
              {cliente && <span>¿Está seguro de eliminar los clientes seleccionados?</span>}
            </div>
          </Dialog>

          {clienteSeleccionado && (
            <div className="mt-5">
              <div className="flex justify-content-between align-items-center mb-4">
                <h3>Historial de {personaNombreTemplate(clienteSeleccionado)}</h3>
                <Button label="Cerrar Historial" icon="pi pi-times" onClick={() => setClienteSeleccionado(null)} severity="secondary" />
              </div>

              <div className="grid">
                <div className="col-12 md:col-6">
                  <div className="flex justify-content-between align-items-center mb-3">
                    <h4>Viajes</h4>
                    <Button label="Nuevo Viaje" icon="pi pi-plus" onClick={openNewViaje} size="small" />
                  </div>
                  <DataTable value={viajesCliente} paginator rows={5} stripedRows responsiveLayout="scroll" emptyMessage="No hay viajes registrados">
                    <Column field="fecha" header="Fecha" />
                    <Column field="origen" header="Origen" />
                    <Column field="destino" header="Destino" />
                    <Column field="costo" header="Costo" />
                    <Column body={(rowData) => <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteViaje(rowData)} />} />
                  </DataTable>

                  <ViajeModal visible={viajeDialog} onHide={() => setViajeDialog(false)} onSave={saveViaje} viaje={viaje} setViaje={setViaje} submitted={viajeSubmitted} clientes={clientes} />
                </div>

                <div className="col-12 md:col-6">
                  <div className="flex justify-content-between align-items-center mb-3">
                    <h4>Pagos</h4>
                    <Button label="Nuevo Pago" icon="pi pi-plus" onClick={openNewPago} size="small" />
                  </div>
                  <DataTable value={pagosCliente} paginator rows={5} stripedRows responsiveLayout="scroll" emptyMessage="No hay pagos registrados">
                    <Column field="fechaPago" header="Fecha" />
                    <Column field="monto" header="Monto" />
                    <Column field="metodoPago" header="Método" />
                    <Column body={(rowData) => <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deletePago(rowData)} />} />
                  </DataTable>

                  <PagoModal visible={pagoDialog} onHide={() => setPagoDialog(false)} onSave={savePago} pago={pago} setPago={setPago} submitted={pagoSubmitted} clientes={clientes} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
