'use client';
import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { RadioButton } from 'primereact/radiobutton';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';

interface Empleado {
    id: string;
    codigo: string;
    nombreCompleto: string;
    genero: string;
    dni: string;
    fechaNacimiento: Date | null;
    telefono: string;
    direccion: string;
    tipoEmpleado: string;
    fechaContratacion: Date | null;
    tipoContrato: string;
    horaEntrada: Date | null;
    horaSalida: Date | null;
    jornada: string;
    estado: string;
}

let contadorCodigo = 1;

const EmpleadosCrud = () => {
    const toast = useRef<Toast>(null);
    const dt = useRef<any>(null);

    const emptyEmpleado: Empleado = {
        id: '', codigo: '', nombreCompleto: '', genero: '', dni: '', fechaNacimiento: null,
        telefono: '', direccion: '', tipoEmpleado: '', fechaContratacion: null, tipoContrato: '',
        horaEntrada: null, horaSalida: null, jornada: '', estado: ''
    };

    const [globalFilter, setGlobalFilter] = useState('');
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [empleado, setEmpleado] = useState<Empleado>(emptyEmpleado);
    const [empleadoDialog, setEmpleadoDialog] = useState(false);
    const [deleteEmpleadoDialog, setDeleteEmpleadoDialog] = useState(false);
    const [detalleDialog, setDetalleDialog] = useState(false);
    const [empleadoDetalle, setEmpleadoDetalle] = useState<Empleado>(emptyEmpleado);
    const [selectedEmpleados, setSelectedEmpleados] = useState<Empleado[]>([]);
    const [submitted, setSubmitted] = useState(false);

    const openNew = () => {
        setEmpleado(emptyEmpleado);
        setSubmitted(false);
        setEmpleadoDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setEmpleadoDialog(false);
    };

    const saveEmpleado = () => {
        setSubmitted(true);
        if (empleado.nombreCompleto.trim()) {
            let _empleados = [...empleados];
            let _empleado = { ...empleado };

            if (empleado.id) {
                const index = empleados.findIndex(e => e.id === empleado.id);
                _empleados[index] = _empleado;
                toast.current?.show({ severity: 'success', summary: 'Actualizado', detail: 'Empleado actualizado', life: 3000 });
            } else {
                _empleado.id = createId();
                _empleado.codigo = `EMP${String(contadorCodigo++).padStart(4, '0')}`;
                _empleados.push(_empleado);
                toast.current?.show({ severity: 'success', summary: 'Creado', detail: 'Empleado registrado', life: 3000 });
            }

            setEmpleados(_empleados);
            setEmpleadoDialog(false);
            setEmpleado(emptyEmpleado);
        }
    };

    const editEmpleado = (emp: Empleado) => {
        setEmpleado({ ...emp });
        setEmpleadoDialog(true);
    };

    const verDetalle = (emp: Empleado) => {
        setEmpleadoDetalle({ ...emp });
        setDetalleDialog(true);
    };

    const confirmDeleteEmpleado = (emp: Empleado) => {
        setEmpleado(emp);
        setDeleteEmpleadoDialog(true);
    };

    const deleteEmpleado = () => {
        const _empleados = empleados.filter(e => e.id !== empleado.id);
        setEmpleados(_empleados);
        setDeleteEmpleadoDialog(false);
        setEmpleado(emptyEmpleado);
        toast.current?.show({ severity: 'success', summary: 'Eliminado', detail: 'Empleado eliminado', life: 3000 });
    };

    const deleteSelectedEmpleados = () => {
        const _empleados = empleados.filter(val => !selectedEmpleados.includes(val));
        setEmpleados(_empleados);
        setSelectedEmpleados([]);
        toast.current?.show({ severity: 'success', summary: 'Eliminados', detail: 'Empleados eliminados', life: 3000 });
    };

    const createId = () => Math.random().toString(36).substr(2, 9);

    const onInputChange = (e: any, name: string) => {
        const val = e.target.value;
        setEmpleado(prev => ({ ...prev, [name]: val }));
    };

    const onCalendarChange = (e: any, name: string) => {
        setEmpleado(prev => ({ ...prev, [name]: e.value }));
    };

    // Template para mostrar el estado con badges
    const estadoTemplate = (rowData: Empleado) => {
        if (!rowData.estado) return '';

        return (
            <Tag
                value={rowData.estado}
                severity={rowData.estado === 'Activo' ? 'success' : 'danger'}
                style={{
                    backgroundColor: rowData.estado === 'Activo' ? '#4CAF50' : '#f44336',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500'
                }}
            />
        );
    };

    const empleadoDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" text onClick={saveEmpleado} />
        </>
    );

    const deleteEmpleadoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={() => setDeleteEmpleadoDialog(false)} />
            <Button label="Sí" icon="pi pi-check" text onClick={deleteEmpleado} />
        </>
    );

    const detalleDialogFooter = (
        <>
            <Button label="Cerrar" icon="pi pi-times" text onClick={() => setDetalleDialog(false)} />
        </>
    );

    const accionesTemplate = (rowData: Empleado) => (
        <div className="flex gap-2">
            <Button icon="pi pi-eye" rounded text severity="info" aria-label="Ver" onClick={() => verDetalle(rowData)} />
            <Button icon="pi pi-pencil" rounded text severity="warning" aria-label="Editar" onClick={() => editEmpleado(rowData)} />
            <Button icon="pi pi-trash" rounded text severity="danger" aria-label="Eliminar" onClick={() => confirmDeleteEmpleado(rowData)} />
        </div>
    );


    return (
        <div className="card">
            <Toast ref={toast} />
            <Toolbar className="mb-4" left={() => (
                <>
                    <Button label="Nuevo" icon="pi pi-plus" severity="success" onClick={openNew} className="mr-2" />
                    <Button label="Eliminar seleccionados" icon="pi pi-trash" severity="danger" onClick={deleteSelectedEmpleados} disabled={!selectedEmpleados.length} />
                </>
            )} />
            <div className="mb-3">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        type="search"
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Buscar por código"
                    />
                </span>
            </div>
            <DataTable
                ref={dt}
                value={empleados}
                selection={selectedEmpleados}
                onSelectionChange={(e) => setSelectedEmpleados(e.value)}
                selectionMode="multiple"
                dataKey="id"
                paginator
                rows={10}
                responsiveLayout="scroll"
                globalFilterFields={['codigo']}
                filterDisplay="menu"
                globalFilter={globalFilter}
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                <Column field="codigo" header="Código" sortable />
                <Column field="nombreCompleto" header="Nombre" />
                <Column field="genero" header="Género" />
                <Column field="fechaNacimiento" header="Fecha de nacimiento" body={(rowData) => rowData.fechaNacimiento?.toLocaleDateString() || ''} />
                <Column field="dni" header="DNI" />
                <Column field="telefono" header="Teléfono" />
                <Column field="direccion" header="Dirección" />
                <Column field="tipoEmpleado" header="Tipo de empleado" />
                <Column field="fechaContratacion" header="Fecha de contratación" body={(rowData) => rowData.fechaContratacion?.toLocaleDateString() || ''} />
                <Column field="tipoContrato" header="Tipo de contrato" />
                <Column field="horaEntrada" header="Hora de entrada" body={(rowData) => rowData.horaEntrada?.toLocaleTimeString() || ''} />
                <Column field="horaSalida" header="Hora de salida" body={(rowData) => rowData.horaSalida?.toLocaleTimeString() || ''} />
                <Column field="jornada" header="Jornada" />
                <Column field="estado" header="Estado" body={estadoTemplate} />
                <Column body={accionesTemplate} header="Acciones" />
            </DataTable>


            <Dialog visible={empleadoDialog} style={{ width: '500px' }} header="Datos del Empleado" modal className="p-fluid" footer={empleadoDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label>Nombre completo</label>
                    <InputText value={empleado.nombreCompleto} onChange={e => onInputChange(e, 'nombreCompleto')} autoFocus className={submitted && !empleado.nombreCompleto ? 'p-invalid' : ''} />
                </div>
                <div className="formgrid grid">
                    <div className="field-radiobutton col-6">
                        <RadioButton inputId="masculino" name="genero" value="Masculino" onChange={e => onInputChange(e, 'genero')} checked={empleado.genero === 'Masculino'} />
                        <label htmlFor="masculino">Masculino</label>
                    </div>
                    <div className="field-radiobutton col-6">
                        <RadioButton inputId="femenino" name="genero" value="Femenino" onChange={e => onInputChange(e, 'genero')} checked={empleado.genero === 'Femenino'} />
                        <label htmlFor="femenino">Femenino</label>
                    </div>
                </div>
                <div className="field">
                    <label>DNI</label>
                    <InputText value={empleado.dni} onChange={e => onInputChange(e, 'dni')} />
                </div>
                <div className="field">
                    <label>Fecha de nacimiento</label>
                    <Calendar value={empleado.fechaNacimiento} onChange={e => onCalendarChange(e, 'fechaNacimiento')} showIcon dateFormat="yy-mm-dd" />
                </div>
                <div className="field">
                    <label>Teléfono</label>
                    <InputText value={empleado.telefono} onChange={e => onInputChange(e, 'telefono')} />
                </div>
                <div className="field">
                    <label>Dirección</label>
                    <InputText value={empleado.direccion} onChange={e => onInputChange(e, 'direccion')} />
                </div>
                <div className="field">
                    <label>Tipo de empleado</label>
                    <Dropdown value={empleado.tipoEmpleado} options={["Conductor", "Cajero", "Administrador", "Servicio de Limpieza"]} onChange={e => onInputChange(e, 'tipoEmpleado')} placeholder="Seleccione uno" />
                </div>
                <div className="field">
                    <label>Fecha de contratación</label>
                    <Calendar value={empleado.fechaContratacion} onChange={e => onCalendarChange(e, 'fechaContratacion')} showIcon dateFormat="yy-mm-dd" />
                </div>
                <div className="field">
                    <label>Tipo de contrato</label>
                    <Dropdown value={empleado.tipoContrato} options={["Indefinido", "Temporal"]} onChange={e => onInputChange(e, 'tipoContrato')} placeholder="Seleccione uno" />
                </div>
                <div className="formgrid grid">
                    <div className="field col-6">
                        <label>Hora de entrada</label>
                        <Calendar value={empleado.horaEntrada} onChange={e => onCalendarChange(e, 'horaEntrada')} timeOnly showIcon hourFormat="24" />
                    </div>
                    <div className="field col-6">
                        <label>Hora de salida</label>
                        <Calendar value={empleado.horaSalida} onChange={e => onCalendarChange(e, 'horaSalida')} timeOnly showIcon hourFormat="24" />
                    </div>
                </div>

                <div className="field">
                    <label>Jornada</label>
                    <Dropdown value={empleado.jornada} options={["Mañana", "Tarde", "Noche"]} onChange={e => onInputChange(e, 'jornada')} placeholder="Seleccione jornada" />
                </div>
                <div className="formgrid grid">
                    <div className="field-radiobutton col-6">
                        <RadioButton inputId="activo" name="estado" value="Activo" onChange={e => onInputChange(e, 'estado')} checked={empleado.estado === 'Activo'} />
                        <label htmlFor="activo">Activo</label>
                    </div>
                    <div className="field-radiobutton col-6">
                        <RadioButton inputId="inactivo" name="estado" value="Inactivo" onChange={e => onInputChange(e, 'estado')} checked={empleado.estado === 'Inactivo'} />
                        <label htmlFor="inactivo">Inactivo</label>
                    </div>
                </div>
            </Dialog>

            {/* Diálogo de Detalles del Empleado */}
            <Dialog
                visible={detalleDialog}
                style={{ width: '600px' }}
                header={`Detalles del Empleado: ${empleadoDetalle.nombreCompleto}`}
                modal
                footer={detalleDialogFooter}
                onHide={() => setDetalleDialog(false)}
            >
                <div className="p-4">
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-bold text-900">Código:</label>
                                <p className="text-700 mt-1">{empleadoDetalle.codigo || 'No especificado'}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-bold text-900">Nombre Completo:</label>
                                <p className="text-700 mt-1">{empleadoDetalle.nombreCompleto || 'No especificado'}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-bold text-900">Género:</label>
                                <p className="text-700 mt-1">{empleadoDetalle.genero || 'No especificado'}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-bold text-900">DNI:</label>
                                <p className="text-700 mt-1">{empleadoDetalle.dni || 'No especificado'}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-bold text-900">Fecha de Nacimiento:</label>
                                <p className="text-700 mt-1">{empleadoDetalle.fechaNacimiento?.toLocaleDateString() || 'No especificado'}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-bold text-900">Teléfono:</label>
                                <p className="text-700 mt-1">{empleadoDetalle.telefono || 'No especificado'}</p>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="field">
                                <label className="font-bold text-900">Dirección:</label>
                                <p className="text-700 mt-1">{empleadoDetalle.direccion || 'No especificado'}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-bold text-900">Tipo de Empleado:</label>
                                <p className="text-700 mt-1">{empleadoDetalle.tipoEmpleado || 'No especificado'}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-bold text-900">Fecha de Contratación:</label>
                                <p className="text-700 mt-1">{empleadoDetalle.fechaContratacion?.toLocaleDateString() || 'No especificado'}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-bold text-900">Tipo de Contrato:</label>
                                <p className="text-700 mt-1">{empleadoDetalle.tipoContrato || 'No especificado'}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-bold text-900">Jornada:</label>
                                <p className="text-700 mt-1">{empleadoDetalle.jornada || 'No especificado'}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-bold text-900">Hora de Entrada:</label>
                                <p className="text-700 mt-1">{empleadoDetalle.horaEntrada?.toLocaleTimeString() || 'No especificado'}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-bold text-900">Hora de Salida:</label>
                                <p className="text-700 mt-1">{empleadoDetalle.horaSalida?.toLocaleTimeString() || 'No especificado'}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-bold text-900">Estado:</label>
                                <div className="mt-1">
                                    {empleadoDetalle.estado ? (
                                        <Tag
                                            value={empleadoDetalle.estado}
                                            severity={empleadoDetalle.estado === 'Activo' ? 'success' : 'danger'}
                                            style={{
                                                backgroundColor: empleadoDetalle.estado === 'Activo' ? '#4CAF50' : '#f44336',
                                                color: 'white',
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: '500'
                                            }}
                                        />
                                    ) : (
                                        <span className="text-700">No especificado</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>

            <Dialog visible={deleteEmpleadoDialog} style={{ width: '450px' }} header="Confirmación" modal footer={deleteEmpleadoDialogFooter} onHide={() => setDeleteEmpleadoDialog(false)}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {empleado && <span>¿Estás seguro que deseas eliminar a <b>{empleado.nombreCompleto}</b>?</span>}
                </div>
            </Dialog>
        </div>
    );
};

export default EmpleadosCrud;