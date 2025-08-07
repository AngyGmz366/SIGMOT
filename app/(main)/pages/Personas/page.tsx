'use client';

import { useEffect, useState, useRef } from 'react';
import { Persona } from '@/types/persona';
import PersonaModal from '../../components/PersonaModal';
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

import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';

export default function PersonasPage() {
    // Estados principales
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [isLoaded, setIsLoaded] = useState(false); // <- FALTA ESTO

    const [personaDialog, setPersonaDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [persona, setPersona] = useState<Persona>(crearPersonaVacia());
    const [selectedPersonas, setSelectedPersonas] = useState<Persona[]>([]);
    const [deletePersonaDialog, setDeletePersonaDialog] = useState(false);
    const [deletePersonasDialog, setDeletePersonasDialog] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    // Filtros
    const [filters, setFilters] = useState({
        global: { value: '', matchMode: FilterMatchMode.CONTAINS },
    });
    const [globalFilterValue, setGlobalFilterValue] = useState('');




    
    // Opciones para dropdowns
    const [generos, setGeneros] = useState([
        { label: 'Masculino', value: '1' },
        { label: 'Femenino', value: '2' },
        { label: 'Otro', value: '3' }
    ]);

    const [tiposPersona, setTiposPersona] = useState([
        { label: 'Cliente', value: '1' },
        { label: 'EMPLEADO', value: '2' },
        { label: 'Administrador', value: '3' }
    ]);

    // Cargar datos de localStorage
useEffect(() => {
    const storedPersonas = localStorage.getItem('personas');
    setPersonas(storedPersonas ? JSON.parse(storedPersonas) : []);
    setIsLoaded(true);
}, []);

  // Guardar en localStorage cuando personas cambian
useEffect(() => {
    if (isLoaded && personas.length > 0) {
        localStorage.setItem('personas', JSON.stringify(personas));
    }
}, [personas, isLoaded]);


    function crearPersonaVacia(): Persona {
        return {
            id: '',
            nombre: '',
            apellido: '',
            dni: '',
            fechaNacimiento: '',
            correo: '',
            telefono: '',
            idGenero: '1',
            idTipoPersona: '1',
            idDireccion: '',
            idUsuario: ''
        };
    }

    // CRUD Persona
    const openNewPersona = () => {
        setPersona(crearPersonaVacia());
        setSubmitted(false);
        setPersonaDialog(true);
        
    };




    const hideDialog = () => {
        setPersonaDialog(false);
    };

    const savePersona = () => {
        setSubmitted(true);

        if (persona.nombre && persona.apellido && persona.dni && persona.correo) {
            const _personas = [...personas];
            
            if (persona.id) {
                // Editar persona existente
                const index = _personas.findIndex(p => p.id === persona.id);
                if (index !== -1) {
                    _personas[index] = persona;
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Persona actualizada',
                        life: 3000
                    });
                }
            } else {
                // Nueva persona
                persona.id = uuidv4();
                _personas.push(persona);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Persona creada',
                    life: 3000
                });
            }

            setPersonas(_personas);
            setPersonaDialog(false);
            setPersona(crearPersonaVacia());
            setSubmitted(false);
        }
    };

    const editPersona = (p: Persona) => {
        setPersona({ ...p });
        setPersonaDialog(true);
    };

    const confirmDeletePersona = (p: Persona) => {
        setPersona(p);
        setDeletePersonaDialog(true);
    };

    const deletePersona = () => {
        const _personas = personas.filter(p => p.id !== persona.id);
        setPersonas(_personas);
        setDeletePersonaDialog(false);
        setPersona(crearPersonaVacia());
        toast.current?.show({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Persona eliminada',
            life: 3000
        });
    };

    const confirmDeleteSelected = () => {
        setDeletePersonasDialog(true);
    };

    const deleteSelectedPersonas = () => {
        const _personas = personas.filter(p => !selectedPersonas.includes(p));
        setPersonas(_personas);
        setDeletePersonasDialog(false);
        setSelectedPersonas([]);
        toast.current?.show({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Personas eliminadas',
            life: 3000
        });
    };

    // Templates para la tabla
    const fechaNacimientoTemplate = (rowData: Persona) => {
        return rowData.fechaNacimiento ? new Date(rowData.fechaNacimiento).toLocaleDateString() : '';
    };

    const generoTemplate = (rowData: Persona) => {
        const genero = generos.find(g => g.value === rowData.idGenero);
        return genero ? genero.label : 'No especificado';
    };
const tipoPersonaTemplate = (rowData: Persona) => {
    const tipo = tiposPersona.find(t => t.value === rowData.idTipoPersona);

    const severity =
        rowData.idTipoPersona === '1' ? 'success' :
        rowData.idTipoPersona === '2' ? 'warning' :
        rowData.idTipoPersona === '3' ? 'danger' :
        'info';

    return tipo ? <Tag value={tipo.label} severity={severity as 'success' | 'info' | 'secondary' | 'contrast' | 'warning' | 'danger'} /> : 'No especificado';
};


    const actionTemplate = (rowData: Persona) => (
        <div className="flex gap-2">
            <Button icon="pi pi-pencil" rounded text onClick={() => editPersona(rowData)} />
            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => confirmDeletePersona(rowData)} />
        </div>
    );

    // Barra de herramientas
    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Nueva Persona" icon="pi pi-plus" severity="success" onClick={openNewPersona} />
                <Button 
                    label="Eliminar" 
                    icon="pi pi-trash" 
                    severity="danger" 
                    onClick={confirmDeleteSelected} 
                    disabled={!selectedPersonas || selectedPersonas.length === 0} 
                />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <>
                <Button 
                    label="Exportar" 
                    icon="pi pi-upload" 
                    severity="help" 
                    onClick={() => dt.current?.exportCSV()} 
                />
            </>
        );
    };

    // Header con filtro global
    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestión de Personas</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText 
                    type="search" 
                    value={globalFilterValue}
                    onChange={(e) => {
                        setGlobalFilterValue(e.target.value);
                        if (dt.current) {
                            dt.current.filter(e.target.value, 'global', 'contains');
                        }
                    }}
                    placeholder="Buscar..." 
                />
            </span>
        </div>
    );

    // Diálogos de confirmación
    const deletePersonaDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={() => setDeletePersonaDialog(false)} />
            <Button label="Sí" icon="pi pi-check" text onClick={deletePersona} />
        </>
    );

    const deletePersonasDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={() => setDeletePersonasDialog(false)} />
            <Button label="Sí" icon="pi pi-check" text onClick={deleteSelectedPersonas} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

                    <DataTable
                        ref={dt}
                        value={personas}
                        selection={selectedPersonas}
                        onSelectionChange={(e) => setSelectedPersonas(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} personas"
                        globalFilter={globalFilterValue}
                        emptyMessage="No se encontraron personas."
                        header={header}
                        responsiveLayout="scroll"
                        filters={filters}
                        filterDisplay="menu"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
                        <Column field="nombre" header="Nombre" sortable />
                        <Column field="apellido" header="Apellido" sortable />
                        <Column field="dni" header="DNI" sortable />
                        <Column 
                            field="fechaNacimiento" 
                            header="Fecha Nacimiento" 
                            body={fechaNacimientoTemplate} 
                            sortable 
                        />
                        <Column field="correo" header="Correo" sortable />
                        <Column field="telefono" header="Teléfono" sortable />
                        <Column 
                            field="idGenero" 
                            header="Género" 
                            body={generoTemplate} 
                            sortable 
                            sortField="idGenero"
                        />
                        <Column 
                            field="idTipoPersona" 
                            header="Tipo Persona" 
                            body={tipoPersonaTemplate} 
                            sortable 
                            sortField="idTipoPersona"
                        />
                        <Column body={actionTemplate} headerStyle={{ minWidth: '10rem' }} />
                    </DataTable>

                    <PersonaModal
                        visible={personaDialog}
                        onHide={hideDialog}
                        onSave={savePersona}
                        persona={persona}
                        setPersona={setPersona}
                        submitted={submitted}
                        generos={generos}
                        tiposPersona={tiposPersona}
                    />

                    {/* Diálogo de confirmación para eliminar persona */}
                    <Dialog 
                        visible={deletePersonaDialog} 
                        style={{ width: '450px' }} 
                        header="Confirmar" 
                        modal 
                        footer={deletePersonaDialogFooter} 
                        onHide={() => setDeletePersonaDialog(false)}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {persona && (
                                <span>
                                    ¿Está seguro de eliminar a {persona.nombre} {persona.apellido}?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    {/* Diálogo de confirmación para eliminar múltiples personas */}
                    <Dialog 
                        visible={deletePersonasDialog} 
                        style={{ width: '450px' }} 
                        header="Confirmar" 
                        modal 
                        footer={deletePersonasDialogFooter} 
                        onHide={() => setDeletePersonasDialog(false)}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {persona && <span>¿Está seguro de eliminar las personas seleccionadas?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}