'use client';
import React, { useState, useRef, useEffect } from 'react';
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

// 🔹 Función segura para generar códigos sin romper SSR
const getNextCodigo = () => {
    if (typeof window === 'undefined') return 'EMP0001';
    const stored = localStorage.getItem('contadorCodigo');
    let contador = stored ? parseInt(stored) : 1;
    const codigo = `EMP${String(contador).padStart(4, '0')}`;
    localStorage.setItem('contadorCodigo', String(contador + 1));
    return codigo;
};

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

    // 🔹 Convertir strings de fechas en Date al leer desde localStorage
    function dateReviver(key: string, value: any) {
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
            return new Date(value);
        }
        return value;
    }

    // 🔹 Cargar datos de localStorage solo en cliente
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('empleados');
            if (stored) {
                try {
                    setEmpleados(JSON.parse(stored, dateReviver));
                } catch (e) {
                    console.error('Error al leer empleados del localStorage', e);
                }
            }
        }
    }, []);

    // 🔹 Guardar la lista de empleados en localStorage
    const guardarEnLocalStorage = (lista: Empleado[]) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('empleados', JSON.stringify(lista));
        }
    };

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
                _empleado.codigo = getNextCodigo();
                _empleados.push(_empleado);
                toast.current?.show({ severity: 'success', summary: 'Creado', detail: 'Empleado registrado', life: 3000 });
            }

            setEmpleados(_empleados);
            guardarEnLocalStorage(_empleados);
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
        guardarEnLocalStorage(_empleados);
        toast.current?.show({ severity: 'success', summary: 'Eliminado', detail: 'Empleado eliminado', life: 3000 });
    };

    const deleteSelectedEmpleados = () => {
        const _empleados = empleados.filter(val => !selectedEmpleados.includes(val));
        setEmpleados(_empleados);
        setSelectedEmpleados([]);
        guardarEnLocalStorage(_empleados);
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

    // 🔹 Template Estado
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

    // 🔹 Template Tipo Empleado
    const tipoEmpleadoTemplate = (rowData: Empleado) => {
        if (!rowData.tipoEmpleado) return '';
        const getColorForTipo = (tipo: string) => {
            switch (tipo) {
                case 'Conductor': return '#3B82F6';
                case 'Cajero': return '#10B981';
                case 'Administrador': return '#8B5CF6';
                case 'Servicio de Limpieza': return '#F59E0B';
                default: return '#6B7280';
            }
        };
        return (
            <Tag
                value={rowData.tipoEmpleado}
                style={{
                    backgroundColor: getColorForTipo(rowData.tipoEmpleado),
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
                <Column field="fechaNacimiento" header="Fecha de nacimiento" body={(r) => r.fechaNacimiento?.toLocaleDateString() || ''} />
                <Column field="dni" header="DNI" />
                <Column field="telefono" header="Teléfono" />
                <Column field="direccion" header="Dirección" />
                <Column field="tipoEmpleado" header="Tipo de empleado" body={tipoEmpleadoTemplate} />
                <Column field="fechaContratacion" header="Fecha de contratación" body={(r) => r.fechaContratacion?.toLocaleDateString() || ''} />
                <Column field="tipoContrato" header="Tipo de contrato" />
                <Column field="horaEntrada" header="Hora de entrada" body={(r) => r.horaEntrada?.toLocaleTimeString() || ''} />
                <Column field="horaSalida" header="Hora de salida" body={(r) => r.horaSalida?.toLocaleTimeString() || ''} />
                <Column field="jornada" header="Jornada" />
                <Column field="estado" header="Estado" body={estadoTemplate} />
                <Column body={accionesTemplate} header="Acciones" />
            </DataTable>

            {/* Dialogos */}
            {/* ... todos tus diálogos de edición, detalle y eliminación (idénticos al original) ... */}
        </div>
    );
};

export default EmpleadosCrud;
