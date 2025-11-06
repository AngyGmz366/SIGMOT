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
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Message } from 'primereact/message';

interface Empleado {
  Id_Empleado_PK: number;
  Nombre_Persona: string;
  Apellido_Persona: string;
  DNI: string;
  Telefono: string;
  Id_Cargo_FK: number;
  Id_Estado_Empleado_FK: number;
  EstadoEmpleado: string;
  fechacontratacion: string;
  horaentrada: string;
  horasalida: string;
  Cargo?: string;
  Id_Persona_FK?: number;
}

interface Cargo {
  Id_Cargo_PK: number;
  Cargo: string;
}

interface EstadoEmpleado {
  Id_Estado_Empleado_PK: number;
  EstadoEmpleado: string;
}

interface Persona {
  Id_Persona: number;
  Nombres: string;
  Apellidos: string;
  DNI: string;
  Telefono: string;
  TipoPersona: string;
}

// Funciones API
const fetchEmpleados = async (): Promise<Empleado[]> => {
  try {
    const response = await fetch('/api/Empleados');
    if (!response.ok) throw new Error('Error al obtener empleados');
    const data = await response.json();
    console.log('📊 Datos recibidos:', data);
    return Array.isArray(data[0]) ? data[0] : data;
  } catch (error) {
    console.error('❌ Error en fetchEmpleados:', error);
    throw error;
  }
};

const fetchCargos = async (): Promise<Cargo[]> => {
  try {
    const response = await fetch('/api/Cargos');
    if (!response.ok) throw new Error('Error al obtener cargos');
    const data = await response.json();
    return Array.isArray(data[0]) ? data[0] : data;
  } catch (error) {
    console.error('❌ Error en fetchCargos:', error);
    return [];
  }
};

const fetchEstados = async (): Promise<EstadoEmpleado[]> => {
  try {
    const response = await fetch('/api/EstadosEmpleado');
    if (!response.ok) throw new Error('Error al obtener estados');
    const data = await response.json();
    return Array.isArray(data[0]) ? data[0] : data;
  } catch (error) {
    console.error('❌ Error en fetchEstados:', error);
    return [];
  }
};

// función para obtener personas con TipoPersona = 2 (Empleado)
const fetchPersonasEmpleados = async (): Promise<Persona[]> => {
  try {
    const response = await fetch('/api/Personas');
    if (!response.ok) throw new Error('Error al obtener personas');
    const data = await response.json();
    const personas = Array.isArray(data[0]) ? data[0] : data;

    // Filtrar solo personas con TipoPersona = "Empleado" o 2
    return personas.filter((p: any) =>
      p.TipoPersona === 'Empleado' || p.TipoPersona === 2 || p.TipoPersona === '2'
    );
  } catch (error) {
    console.error('❌ Error en fetchPersonasEmpleados:', error);
    return [];
  }
};


const createEmpleado = async (empleado: Empleado) => {
  const payload = {
    Id_Cargo_FK: empleado.Id_Cargo_FK,
    Id_Estado_Empleado_FK: empleado.Id_Estado_Empleado_FK,
    fechacontratacion: empleado.fechacontratacion,
    horaentrada: empleado.horaentrada,
    horasalida: empleado.horasalida,
    Id_Persona_FK: empleado.Id_Persona_FK
  };

  const response = await fetch('/api/Empleados', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error('Error al crear empleado');
  return response.json();
};

const updateEmpleado = async (id: number, empleado: Empleado) => {
  const payload = {
    Id_Cargo_FK: empleado.Id_Cargo_FK,
    Id_Estado_Empleado_FK: empleado.Id_Estado_Empleado_FK,
    fechacontratacion: empleado.fechacontratacion,
    horaentrada: empleado.horaentrada,
    horasalida: empleado.horasalida,
    Id_Persona_FK: empleado.Id_Persona_FK
  };

  const response = await fetch(`/api/Empleados/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error('Error al actualizar empleado');
  return response.json();
};

const deleteEmpleado = async (id: number) => {
  const response = await fetch(`/api/Empleados/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error('Error al eliminar empleado');
  return response.json();
};

function EmpleadosPage() {
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<any>>(null);

  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [estados, setEstados] = useState<EstadoEmpleado[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]); // 🆕 Estado para personas
  const [loading, setLoading] = useState(true);
  const [empleadoDialog, setEmpleadoDialog] = useState(false);
  const [deleteEmpleadoDialog, setDeleteEmpleadoDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [empleado, setEmpleado] = useState<Empleado>({
    Id_Empleado_PK: 0,
    Nombre_Persona: '',
    Apellido_Persona: '',
    DNI: '',
    Telefono: '',
    Id_Cargo_FK: 0,
    Id_Estado_Empleado_FK: 0,
    EstadoEmpleado: '',
    fechacontratacion: '',
    horaentrada: '',
    horasalida: '',
    Id_Persona_FK: 0
  });
  const [selectedEmpleados, setSelectedEmpleados] = useState<Empleado[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [timeError, setTimeError] = useState('');

  useEffect(() => {
    loadEmpleados();
    loadCargos();
    loadEstados();
    loadPersonasEmpleados(); // 🆕 Cargar personas tipo empleado
  }, []);

  const loadEmpleados = async () => {
    try {
      setLoading(true);
      const empleadosData = await fetchEmpleados();
      console.log('✅ Empleados cargados:', empleadosData);
      setEmpleados(empleadosData || []);
    } catch (error) {
      console.error('❌ Error cargando empleados:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los empleados',
        life: 4000,
      });
      setEmpleados([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCargos = async () => {
    const cargosData = await fetchCargos();
    setCargos(cargosData);
  };

  const loadEstados = async () => {
    const estadosData = await fetchEstados();
    setEstados(estadosData);
  };

  // 🆕 Función para cargar personas tipo empleado
  const loadPersonasEmpleados = async () => {
    try {
      const personasData = await fetchPersonasEmpleados();
      console.log('✅ Personas empleados cargadas:', personasData);
      setPersonas(personasData);
    } catch (error) {
      console.error('❌ Error cargando personas:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar las personas',
        life: 3000,
      });
    }
  };

  const openNew = () => {
    // Reinicia los datos del empleado a valores vacíos o predeterminados
    setEmpleado({
      Id_Empleado_PK: 0,
      Nombre_Persona: '',  // Deja vacío el nombre de persona
      Apellido_Persona: '',
      DNI: '',
      Telefono: '',
      Id_Cargo_FK: 0,
      Id_Estado_Empleado_FK: 0,
      EstadoEmpleado: '',
      fechacontratacion: '',
      horaentrada: '',
      horasalida: '',
      Id_Persona_FK: 0 // Se asegura de que no haya un ID preseleccionado
    });
    setSubmitted(false);
    setTimeError('');
    setEmpleadoDialog(true); // Abre el diálogo para crear un nuevo empleado
  };


  const hideDialog = () => {
    setEmpleadoDialog(false);
    setSubmitted(false);
    setTimeError('');
  };

  const saveEmpleado = async () => {
    setSubmitted(true);
    setTimeError('');

    // Validación básica
    if (!empleado.fechacontratacion || !empleado.horaentrada || !empleado.horasalida ||
      !empleado.Id_Cargo_FK || !empleado.Id_Estado_Empleado_FK || !empleado.Id_Persona_FK) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete todos los campos requeridos',
        life: 3000,
      });
      return;
    }

    // Validación de horas
    if (empleado.horaentrada && empleado.horasalida) {
      const [horaEntrada, minEntrada] = empleado.horaentrada.split(':').map(Number);
      const [horaSalida, minSalida] = empleado.horasalida.split(':').map(Number);

      const minutosEntrada = horaEntrada * 60 + minEntrada;
      const minutosSalida = horaSalida * 60 + minSalida;

      if (minutosSalida <= minutosEntrada) {
        setTimeError('La hora de salida debe ser mayor a la hora de entrada');
        toast.current?.show({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'La hora de salida debe ser mayor a la hora de entrada',
          life: 3000,
        });
        return;
      }
    }

    // Código para guardar el empleado
    try {
      if (empleado.Id_Empleado_PK === 0) {
        await createEmpleado(empleado);
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Empleado creado correctamente',
          life: 3000,
        });
      } else {
        await updateEmpleado(empleado.Id_Empleado_PK, empleado);
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Empleado actualizado correctamente',
          life: 3000,
        });
      }

      await loadEmpleados();
      setEmpleadoDialog(false);
      setSubmitted(false);
      setTimeError('');
    } catch (err) {
      console.error('❌ Error guardando empleado:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err instanceof Error ? err.message : 'No se pudo guardar el empleado',
        life: 4000,
      });
    }
  };

  const editEmpleado = (e: Empleado) => {
    console.log('📝 Editando empleado:', e);
    const empleadoToEdit = {
      ...e,
      Id_Persona_FK: e.Id_Persona_FK || 0,
      Id_Cargo_FK: e.Id_Cargo_FK || 0,
      Id_Estado_Empleado_FK: e.Id_Estado_Empleado_FK || 0
    };
    console.log('📝 Empleado preparado:', empleadoToEdit);
    setEmpleado(empleadoToEdit);
    setSubmitted(false);
    setTimeError('');
    setEmpleadoDialog(true);
  };

  const confirmDeleteEmpleado = (e: Empleado) => {
    setEmpleado(e);
    setDeleteEmpleadoDialog(true);
  };

  const deleteEmpleadoHandler = async () => {
    try {
      await deleteEmpleado(empleado.Id_Empleado_PK);
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Empleado eliminado correctamente',
        life: 3000,
      });
      await loadEmpleados();
      setDeleteEmpleadoDialog(false);
    } catch (err) {
      console.error('❌ Error eliminando empleado:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo eliminar el empleado',
        life: 4000,
      });
    }
  };

  const onDropdownChange = (value: number, name: string) => {
    setEmpleado(prev => ({ ...prev, [name]: value }));
  };

  const onDateChange = (value: Date | null, name: string) => {
    if (value) {
      const formattedDate = value.toISOString().split('T')[0]; // Formateamos la fecha (YYYY-MM-DD)
      setEmpleado(prev => ({ ...prev, [name]: formattedDate }));
    }
  };


  const onTimeChange = (value: Date | null, name: string) => {
    if (value) {
      const hours = value.getHours().toString().padStart(2, '0');
      const minutes = value.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      setEmpleado(prev => ({ ...prev, [name]: timeString }));
      setTimeError('');
    }
  };

  const estadoTemplate = (rowData: Empleado) => {
    const estado = rowData.EstadoEmpleado || 'INACTIVO';
    return (
      <Tag
        value={estado}
        severity={estado === 'ACTIVO' ? 'success' : 'danger'}
        icon={estado === 'ACTIVO' ? 'pi pi-check-circle' : 'pi pi-times-circle'}
      />
    );
  };
  //Estado y función para el diálogo de detalles
  const [detalleEmpleado, setDetalleEmpleado] = useState<Empleado | null>(null);
  const [detalleEmpleadoDialog, setDetalleEmpleadoDialog] = useState(false);

  const verDetalle = (empleado: Empleado) => {
    setDetalleEmpleado(empleado);  // Setea los datos del empleado seleccionado
    setDetalleEmpleadoDialog(true);  // Abre el diálogo de detalles
  };

  const hideDetalleDialog = () => {
    setDetalleEmpleadoDialog(false);  // Cierra el diálogo de detalles
  };


  const actionTemplate = (rowData: Empleado) => (
    <div className="flex gap-2">
      <Button icon="pi pi-eye" className="btn-ver" rounded text severity="info" onClick={() => verDetalle(rowData)} tooltip="Ver" tooltipOptions={{ position: 'top' }} />
      <Button icon="pi pi-pencil" className="btn-editar" rounded text severity="warning" onClick={() => editEmpleado(rowData)} tooltip="Editar" tooltipOptions={{ position: 'top' }} />
      <Button icon="pi pi-trash" className="btn-eliminar" rounded text severity="danger" onClick={() => confirmDeleteEmpleado(rowData)} tooltip="Eliminar" tooltipOptions={{ position: 'top' }} />
    </div>
  );

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">Gestión de Empleados</h4>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          type="search"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar..."
        />
      </span>
    </div>
  );

  const empleadoDialogFooter = (
    <div className="flex gap-2 justify-content-end">
      <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button label="Guardar" icon="pi pi-check" onClick={saveEmpleado} />
    </div>
  );

  const empleadoDialogHeader = empleado.Id_Empleado_PK === 0 ? 'Nuevo Empleado' : 'Editar Empleado';



  const deleteEmpleadoDialogFooter = (
    <div className="flex gap-2 justify-content-end">
      <Button label="No" icon="pi pi-times" outlined onClick={() => setDeleteEmpleadoDialog(false)} />
      <Button label="Sí" icon="pi pi-check" severity="danger" onClick={deleteEmpleadoHandler} />
    </div>
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-HN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <Toast ref={toast} />

          <Toolbar
            className="mb-4"
            start={() => (
              <Button
                label="Nuevo Empleado"
                icon="pi pi-plus"
                severity="success"
                onClick={openNew}
              />
            )}
          />

          <DataTable
            ref={dt}
            value={empleados}
            selection={selectedEmpleados}
            onSelectionChange={(e) => setSelectedEmpleados(e.value)}
            dataKey="Id_Empleado_PK"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            loading={loading}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} empleados"
            globalFilter={globalFilter}
            emptyMessage="No se encontraron empleados."
            header={header}
            stripedRows
          >
            <Column field="Id_Empleado_PK" header="ID" sortable style={{ width: '5rem' }} />
            <Column field="Nombre_Persona" header="Nombre" sortable />
            <Column field="Apellido_Persona" header="Apellido" sortable />
            <Column field="DNI" header="DNI" sortable />
            <Column field="Telefono" header="Teléfono" sortable />
            <Column field="Cargo" header="Cargo" sortable />
            <Column body={estadoTemplate} header="Estado" sortable field="EstadoEmpleado" />
            <Column field="fechacontratacion" header="Fecha Contratación" sortable body={(rowData) => formatDate(rowData.fechacontratacion)} />
            <Column field="horaentrada" header="Hora Entrada" sortable />
            <Column field="horasalida" header="Hora Salida" sortable />
            <Column body={actionTemplate} header="Acciones" headerStyle={{ minWidth: '10rem' }} />
          </DataTable>

          {/* Diálogo para crear/editar */}
          <Dialog
            visible={empleadoDialog}
            style={{ width: '32rem' }}
            breakpoints={{ '960px': '75vw', '641px': '90vw' }}
            header={empleadoDialogHeader}
            modal
            className="p-fluid"
            footer={empleadoDialogFooter}
            onHide={hideDialog}
          >
            <div className="formgrid grid">
              {/* Persona - editable solo al crear un nuevo empleado */}
              <div className="field col-12">
                <label htmlFor="Id_Persona_FK">Persona *</label>
                {empleado.Id_Empleado_PK === 0 ? (
                  // Dropdown con filtro para buscar personas
                  <Dropdown
                    id="Id_Persona_FK"
                    value={empleado.Id_Persona_FK}
                    onChange={(e) => onDropdownChange(e.value, 'Id_Persona_FK')}
                    options={personas} // Personas filtradas
                    optionLabel="Nombre_Persona" // Campo que se muestra (puedes cambiarlo según tu estructura de datos)
                    optionValue="Id_Persona" // Valor que se guarda (ID de la persona)
                    placeholder="Selecciona una persona"
                    filter // Activa la búsqueda
                    filterBy="Nombre_Persona" // Filtra por nombre (cambia según lo que desees buscar)
                    className={submitted && !empleado.Id_Persona_FK ? 'p-invalid' : ''}
                    showClear // Botón para borrar la selección
                  />
                ) : (
                  // Si se está editando, solo muestra el nombre completo
                  <InputText
                    id="Id_Persona_FK"
                    value={`${empleado.Nombre_Persona} ${empleado.Apellido_Persona}`}
                    readOnly
                  />
                )}
                {submitted && !empleado.Id_Persona_FK && (
                  <small className="p-error">La persona es requerida.</small>
                )}
              </div>


              {/* Otros campos (cargo, estado, etc.) */}
              <div className="field col-12">
                <label htmlFor="cargo">Cargo *</label>
                <Dropdown
                  id="cargo"
                  value={empleado.Id_Cargo_FK}
                  onChange={(e) => onDropdownChange(e.value, 'Id_Cargo_FK')}
                  options={cargos}
                  optionLabel="Cargo"
                  optionValue="Id_Cargo_PK"
                  placeholder="Selecciona un cargo"
                  className={submitted && !empleado.Id_Cargo_FK ? 'p-invalid' : ''}
                />
                {submitted && !empleado.Id_Cargo_FK && <small className="p-error">El cargo es requerido.</small>}
              </div>

              <div className="field col-12">
                <label htmlFor="estado">Estado del Empleado *</label>
                <Dropdown
                  id="estado"
                  value={empleado.Id_Estado_Empleado_FK}
                  onChange={(e) => onDropdownChange(e.value, 'Id_Estado_Empleado_FK')}
                  options={estados}
                  optionLabel="EstadoEmpleado"
                  optionValue="Id_Estado_Empleado_PK"
                  placeholder="Selecciona estado"
                  className={submitted && !empleado.Id_Estado_Empleado_FK ? 'p-invalid' : ''}
                />
                {submitted && !empleado.Id_Estado_Empleado_FK && <small className="p-error">El estado es requerido.</small>}
              </div>

              <div className="field col-12">
                <label htmlFor="fechacontratacion">Fecha de Contratación *</label>
                <Calendar
                  id="fechacontratacion"
                  value={empleado.fechacontratacion ? new Date(empleado.fechacontratacion) : null}
                  onChange={(e) => onDateChange(e.value as Date, 'fechacontratacion')}
                  placeholder="Selecciona fecha"
                  dateFormat="yy-mm-dd"
                  showIcon
                  className={submitted && !empleado.fechacontratacion ? 'p-invalid' : ''}
                />
                {submitted && !empleado.fechacontratacion && <small className="p-error">La fecha es requerida.</small>}
              </div>

              <div className="field col-6">
                <label htmlFor="horaentrada">Hora de Entrada *</label>
                <Calendar
                  id="horaentrada"
                  value={empleado.horaentrada ? new Date(`2000-01-01T${empleado.horaentrada}`) : null}
                  onChange={(e) => onTimeChange(e.value as Date, 'horaentrada')}
                  timeOnly
                  hourFormat="24"
                  showIcon
                  icon="pi pi-clock"
                  placeholder="Selecciona hora"
                  className={submitted && !empleado.horaentrada ? 'p-invalid' : ''}
                />
                {submitted && !empleado.horaentrada && <small className="p-error">La hora de entrada es requerida.</small>}
              </div>

              <div className="field col-6">
                <label htmlFor="horasalida">Hora de Salida *</label>
                <Calendar
                  id="horasalida"
                  value={empleado.horasalida ? new Date(`2000-01-01T${empleado.horasalida}`) : null}
                  onChange={(e) => onTimeChange(e.value as Date, 'horasalida')}
                  timeOnly
                  hourFormat="24"
                  showIcon
                  icon="pi pi-clock"
                  placeholder="Selecciona hora"
                  className={submitted && !empleado.horasalida ? 'p-invalid' : ''}
                />
                {submitted && !empleado.horasalida && <small className="p-error">La hora de salida es requerida.</small>}
              </div>
            </div>
          </Dialog>

          {/* Diálogo de confirmación de eliminación */}
          <Dialog
            visible={deleteEmpleadoDialog}
            style={{ width: '32rem' }}
            breakpoints={{ '960px': '75vw', '641px': '90vw' }}
            header="Confirmar Eliminación"
            modal
            footer={deleteEmpleadoDialogFooter}
            onHide={() => setDeleteEmpleadoDialog(false)}
          >
            <div className="flex align-items-center">
              <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem', color: 'var(--red-500)' }} />
              <span>
                ¿Está seguro de que desea eliminar al empleado{' '}
                <b>{empleado.Nombre_Persona} {empleado.Apellido_Persona}</b>?
              </span>
            </div>
          </Dialog>
          {/* 🟦 Diálogo de detalle del empleado */}
          <Dialog
            visible={detalleEmpleadoDialog}
            style={{ width: '40rem', borderRadius: '1rem' }}
            breakpoints={{ '960px': '75vw', '641px': '90vw' }}
            header={
              <div className="flex flex-column">
                <h3 className="text-xl font-semibold text-gray-800">
                  Detalles del Empleado: {detalleEmpleado?.Nombre_Persona} {detalleEmpleado?.Apellido_Persona}
                </h3>
              </div>
            }
            modal
            onHide={hideDetalleDialog}
            footer={
              <div>
                <Button label="Cerrar" icon="pi pi-times" onClick={hideDetalleDialog} />
              </div>
            }
          >
            {detalleEmpleado && (
              <div className="grid p-fluid text-gray-700">
                {/* Código y Cargo */}
                <div className="col-6">
                  <strong>ID Empleado:</strong>
                  <p>{detalleEmpleado.Id_Empleado_PK}</p>
                </div>
                <div className="col-6">
                  <strong>Cargo:</strong>
                  <p>{detalleEmpleado.Cargo || 'Sin cargo'}</p>
                </div>

                {/* Nombre y Apellido */}
                <div className="col-6">
                  <strong>Nombre:</strong>
                  <p>{detalleEmpleado.Nombre_Persona}</p>
                </div>
                <div className="col-6">
                  <strong>Apellido:</strong>
                  <p>{detalleEmpleado.Apellido_Persona}</p>
                </div>

                {/* DNI y Teléfono */}
                <div className="col-6">
                  <strong>DNI:</strong>
                  <p>{detalleEmpleado.DNI}</p>
                </div>
                <div className="col-6">
                  <strong>Teléfono:</strong>
                  <p>{detalleEmpleado.Telefono}</p>
                </div>

                {/* Fecha contratación y Horario */}
                <div className="col-6">
                  <strong>Fecha de Contratación:</strong>
                  <p>{formatDate(detalleEmpleado.fechacontratacion)}</p>
                </div>
                <div className="col-6">
                  <strong>Horario:</strong>
                  <p>
                    {detalleEmpleado.horaentrada} - {detalleEmpleado.horasalida}
                  </p>
                </div>

                {/* Estado */}
                <div className="col-6">
                  <strong>Estado:</strong>
                  <div className="mt-2">
                    <Tag
                      value={detalleEmpleado.EstadoEmpleado}
                      severity={
                        detalleEmpleado.EstadoEmpleado === 'ACTIVO'
                          ? 'success'
                          : detalleEmpleado.EstadoEmpleado === 'INACTIVO'
                            ? 'danger'
                            : 'warning'
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </Dialog>

        </div>
      </div>
    </div>
  );
}

export default EmpleadosPage;