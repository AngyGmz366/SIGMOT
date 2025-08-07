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
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { InputNumber } from 'primereact/inputnumber';

interface Empleado {
    id: string;
    codigo: string;
    nombreCompleto: string;
    dni: string;
    tipoEmpleado: string;
}

interface Pago {
    id: string;
    empleadoId: string;
    codigo: string;
    nombreCompleto: string;
    dni: string;
    tipoEmpleado: string;
    fechaPago: Date | null;
    monto: number;
    fechaCreacion: Date;
}

let contadorPago = 1;

const PlanillaPagos = () => {
    const toast = useRef<Toast>(null);
    const dt = useRef<any>(null);

    const emptyPago: Pago = {
        id: '',
        empleadoId: '',
        codigo: '',
        nombreCompleto: '',
        dni: '',
        tipoEmpleado: '',
        fechaPago: null,
        monto: 0,
        fechaCreacion: new Date()
    };

    const [globalFilter, setGlobalFilter] = useState('');
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [pagos, setPagos] = useState<Pago[]>(() => {
        const stored = localStorage.getItem('pagos');
        return stored ? JSON.parse(stored, dateReviver) : [];
    });
    const [pago, setPago] = useState<Pago>(emptyPago);
    const [pagoDialog, setPagoDialog] = useState(false);
    const [deletePagoDialog, setDeletePagoDialog] = useState(false);
    const [detallePagoDialog, setDetallePagoDialog] = useState(false);
    const [pagoDetalle, setPagoDetalle] = useState<Pago>(emptyPago);
    const [selectedPagos, setSelectedPagos] = useState<Pago[]>([]);
    const [submitted, setSubmitted] = useState(false);

    // Cargar empleados del localStorage al montar el componente
    useEffect(() => {
        const cargarEmpleados = () => {
            try {
                const empleadosStored = localStorage.getItem('empleados');
                console.log('🔍 Contenido crudo del localStorage:', empleadosStored);
                
                if (empleadosStored && empleadosStored !== 'null' && empleadosStored !== '[]') {
                    const empleadosData = JSON.parse(empleadosStored, dateReviver);
                    console.log('📊 Datos parseados:', empleadosData);
                    console.log('📊 Cantidad de empleados:', empleadosData.length);
                    
                    if (Array.isArray(empleadosData) && empleadosData.length > 0) {
                        // Mapear empleados con validación de campos requeridos
                        const empleadosFormateados = empleadosData
                            .filter((emp: any) => emp && emp.id && emp.nombreCompleto) // Filtrar registros válidos
                            .map((emp: any) => {
                                console.log('🔄 Procesando empleado:', emp);
                                return {
                                    id: emp.id,
                                    codigo: emp.codigo || 'Sin código',
                                    nombreCompleto: emp.nombreCompleto || 'Sin nombre',
                                    dni: emp.dni || 'Sin DNI',
                                    tipoEmpleado: emp.tipoEmpleado || 'Sin tipo',
                                    estado: emp.estado || 'Sin estado'
                                };
                            });
                        
                        console.log('✅ Empleados formateados:', empleadosFormateados);
                        setEmpleados(empleadosFormateados);
                        
                        if (empleadosFormateados.length === 0) {
                            console.log('⚠️ No hay empleados válidos después del formateo');
                        }
                    } else {
                        console.log('⚠️ Los datos no son un array válido o está vacío');
                        setEmpleados([]);
                    }
                } else {
                    console.log('⚠️ No hay datos en localStorage o están vacíos');
                    setEmpleados([]);
                }
            } catch (error) {
                console.error('❌ Error al cargar empleados:', error);
                setEmpleados([]);
                toast.current?.show({ 
                    severity: 'error', 
                    summary: 'Error', 
                    detail: 'Error al cargar los empleados del sistema', 
                    life: 5000 
                });
            }
        };

        // Cargar inmediatamente
        cargarEmpleados();
        
        // También escuchar cambios en el localStorage
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'empleados') {
                console.log('🔄 Detectado cambio en empleados, recargando...');
                cargarEmpleados();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        // Listener personalizado para cambios internos de la aplicación
        const handleEmpleadosUpdate = () => {
            console.log('🔄 Evento personalizado detectado, recargando empleados...');
            cargarEmpleados();
        };
        
        window.addEventListener('empleadosUpdated', handleEmpleadosUpdate);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('empleadosUpdated', handleEmpleadosUpdate);
        };
    }, []);

    // Para convertir los strings de fechas en objetos Date al leer de localStorage
    function dateReviver(key: string, value: any) {
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
            return new Date(value);
        }
        return value;
    }

    // Guardar la lista de pagos en localStorage
    const guardarEnLocalStorage = (lista: Pago[]) => {
        localStorage.setItem('pagos', JSON.stringify(lista));
    };

    const openNew = () => {
        setPago(emptyPago);
        setSubmitted(false);
        setPagoDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setPagoDialog(false);
    };

    const savePago = () => {
        setSubmitted(true);
        
        if (pago.empleadoId && pago.fechaPago && pago.monto > 0) {
            let _pagos = [...pagos];
            let _pago = { ...pago };

            if (pago.id) {
                // Editar pago existente
                const index = pagos.findIndex(p => p.id === pago.id);
                _pagos[index] = _pago;
                toast.current?.show({ severity: 'success', summary: 'Actualizado', detail: 'Pago actualizado correctamente', life: 3000 });
            } else {
                // Crear nuevo pago
                _pago.id = createId();
                _pago.fechaCreacion = new Date();
                _pagos.push(_pago);
                toast.current?.show({ severity: 'success', summary: 'Creado', detail: 'Pago registrado correctamente', life: 3000 });
            }

            setPagos(_pagos);
            guardarEnLocalStorage(_pagos);
            setPagoDialog(false);
            setPago(emptyPago);
        }
    };

    const editPago = (pagoData: Pago) => {
        setPago({ ...pagoData });
        setPagoDialog(true);
    };

    const verDetallePago = (pagoData: Pago) => {
        setPagoDetalle({ ...pagoData });
        setDetallePagoDialog(true);
    };

    const confirmDeletePago = (pagoData: Pago) => {
        setPago(pagoData);
        setDeletePagoDialog(true);
    };

    const deletePago = () => {
        const _pagos = pagos.filter(p => p.id !== pago.id);
        setPagos(_pagos);
        setDeletePagoDialog(false);
        setPago(emptyPago);
        guardarEnLocalStorage(_pagos);
        toast.current?.show({ severity: 'success', summary: 'Eliminado', detail: 'Pago eliminado correctamente', life: 3000 });
    };

    const deleteSelectedPagos = () => {
        const _pagos = pagos.filter(val => !selectedPagos.includes(val));
        setPagos(_pagos);
        setSelectedPagos([]);
        guardarEnLocalStorage(_pagos);
        toast.current?.show({ severity: 'success', summary: 'Eliminados', detail: 'Pagos eliminados correctamente', life: 3000 });
    };

    const createId = () => Math.random().toString(36).substr(2, 9);

    // Función para manejar la selección del empleado
    const onEmpleadoChange = (e: any) => {
        const empleadoSeleccionado = empleados.find(emp => emp.id === e.value);
        if (empleadoSeleccionado) {
            setPago({
                ...pago,
                empleadoId: empleadoSeleccionado.id,
                codigo: empleadoSeleccionado.codigo,
                nombreCompleto: empleadoSeleccionado.nombreCompleto,
                dni: empleadoSeleccionado.dni,
                tipoEmpleado: empleadoSeleccionado.tipoEmpleado
            });
        }
    };

    const onCalendarChange = (e: any) => {
        setPago(prev => ({ ...prev, fechaPago: e.value }));
    };

    const onMontoChange = (e: any) => {
        setPago(prev => ({ ...prev, monto: e.value || 0 }));
    };

    // Template para mostrar el tipo de empleado con colores
    const tipoEmpleadoTemplate = (rowData: Pago) => {
        if (!rowData.tipoEmpleado) return '';

        const getColorForTipo = (tipo: string) => {
            switch (tipo) {
                case 'Conductor':
                    return '#3B82F6';
                case 'Cajero':
                    return '#10B981';
                case 'Administrador':
                    return '#8B5CF6';
                case 'Servicio de Limpieza':
                    return '#F59E0B';
                default:
                    return '#6B7280';
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

    // Template para mostrar el monto formateado
    const montoTemplate = (rowData: Pago) => {
        return new Intl.NumberFormat('es-HN', {
            style: 'currency',
            currency: 'HNL'
        }).format(rowData.monto);
    };

    const pagoDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" text onClick={savePago} />
        </>
    );

    const deletePagoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={() => setDeletePagoDialog(false)} />
            <Button label="Sí" icon="pi pi-check" text onClick={deletePago} />
        </>
    );

    const detallePagoDialogFooter = (
        <>
            <Button label="Cerrar" icon="pi pi-times" text onClick={() => setDetallePagoDialog(false)} />
        </>
    );

    const accionesTemplate = (rowData: Pago) => (
        <div className="flex gap-2">
            <Button icon="pi pi-eye" rounded text severity="info" aria-label="Ver" onClick={() => verDetallePago(rowData)} />
            <Button icon="pi pi-pencil" rounded text severity="warning" aria-label="Editar" onClick={() => editPago(rowData)} />
            <Button icon="pi pi-trash" rounded text severity="danger" aria-label="Eliminar" onClick={() => confirmDeletePago(rowData)} />
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-900 mb-2">Planilla de Pagos</h2>
                <p className="text-600">Gestión de pagos a empleados</p>
                
                {/* Panel de información detallado */}
                <div className="mt-3 p-3 surface-100 border-round">
                    <div className="flex align-items-center gap-3 mb-2">
                        <i className="pi pi-info-circle text-blue-500"></i>
                        <strong className="text-900">Estado del Sistema:</strong>
                    </div>
                    
                    <div className="grid text-sm">
                        <div className="col-12 md:col-4">
                            <span className="font-bold">Empleados cargados:</span> 
                            <span className={`ml-2 ${empleados.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {empleados.length}
                            </span>
                        </div>
                        <div className="col-12 md:col-4">
                            <span className="font-bold">Estado del localStorage:</span>
                            <span className="ml-2 text-blue-600">
                                {typeof localStorage !== 'undefined' && localStorage.getItem('empleados') ? 'Datos encontrados' : 'Sin datos'}
                            </span>
                        </div>
                        <div className="col-12 md:col-4">
                            <Button 
                                label="Recargar Empleados" 
                                icon="pi pi-refresh" 
                                size="small"
                                text 
                                className="p-0"
                                onClick={() => window.location.reload()}
                            />
                        </div>
                    </div>
                    
                    {empleados.length === 0 && (
                        <div className="mt-3 p-3 bg-orange-50 border-left-3 border-orange-500">
                            <div className="flex align-items-center gap-2 text-orange-800">
                                <i className="pi pi-exclamation-triangle"></i>
                                <strong>No se encontraron empleados</strong>
                            </div>
                            <p className="mt-2 text-orange-700 text-sm mb-0">
                                • Asegúrate de haber creado empleados en el módulo de empleados<br/>
                                • Verifica que los empleados tengan estado "Activo"<br/>
                                • Abre la consola del navegador (F12) para ver más detalles<br/>
                                • Si el problema persiste, recarga la página
                            </p>
                        </div>
                    )}

                    {empleados.length > 0 && (
                        <div className="mt-3 p-2 bg-green-50 border-round">
                            <div className="text-green-800 text-sm">
                                <i className="pi pi-check-circle mr-2"></i>
                                Sistema funcionando correctamente. {empleados.length} empleado(s) disponible(s) para registrar pagos.
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Toolbar className="mb-4" left={() => (
                <>
                    <Button label="Nuevo Pago" icon="pi pi-plus" severity="success" onClick={openNew} className="mr-2" />
                    <Button 
                        label="Eliminar Seleccionados" 
                        icon="pi pi-trash" 
                        severity="danger" 
                        onClick={deleteSelectedPagos} 
                        disabled={!selectedPagos.length} 
                    />
                </>
            )} />

            <div className="mb-3">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        type="search"
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Buscar por nombre, código o DNI"
                    />
                </span>
            </div>

            <DataTable
                ref={dt}
                value={pagos}
                selection={selectedPagos}
                onSelectionChange={(e) => setSelectedPagos(e.value)}
                selectionMode="multiple"
                dataKey="id"
                paginator
                rows={10}
                responsiveLayout="scroll"
                globalFilterFields={['codigo', 'nombreCompleto', 'dni']}
                globalFilter={globalFilter}
                sortField="fechaPago"
                sortOrder={-1}
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                <Column field="codigo" header="Código Empleado" sortable />
                <Column field="nombreCompleto" header="Nombre Completo" sortable />
                <Column field="dni" header="DNI" />
                <Column field="tipoEmpleado" header="Tipo de Empleado" body={tipoEmpleadoTemplate} />
                <Column field="fechaPago" header="Fecha de Pago" body={(rowData) => rowData.fechaPago?.toLocaleDateString() || ''} sortable />
                <Column field="monto" header="Monto" body={montoTemplate} sortable />
                <Column field="fechaCreacion" header="Fecha de Registro" body={(rowData) => rowData.fechaCreacion?.toLocaleDateString() || ''} sortable />
                <Column body={accionesTemplate} header="Acciones" />
            </DataTable>

            {/* Dialog para crear/editar pago */}
            <Dialog 
                visible={pagoDialog} 
                style={{ width: '500px' }} 
                header={pago.id ? "Editar Pago" : "Nuevo Pago"} 
                modal 
                className="p-fluid" 
                footer={pagoDialogFooter} 
                onHide={hideDialog}
            >
                <div className="field">
                    <label htmlFor="empleado" className="font-bold">Empleado *</label>
                    <Dropdown
                        id="empleado"
                        value={pago.empleadoId}
                        options={empleados}
                        onChange={onEmpleadoChange}
                        optionLabel="nombreCompleto"
                        optionValue="id"
                        placeholder={empleados.length === 0 ? "No hay empleados disponibles" : "Seleccione un empleado"}
                        filter
                        showClear
                        disabled={empleados.length === 0}
                        className={submitted && !pago.empleadoId ? 'p-invalid' : ''}
                        itemTemplate={(option) => (
                            <div className="flex align-items-center">
                                <div>
                                    <div className="font-bold">{option.nombreCompleto}</div>
                                    <div className="text-sm text-600">
                                        {option.codigo} - {option.dni} - {option.tipoEmpleado}
                                        {option.estado && <span className="ml-2">({option.estado})</span>}
                                    </div>
                                </div>
                            </div>
                        )}
                    />
                    {empleados.length === 0 && (
                        <small className="text-orange-600">
                            No hay empleados registrados. Ve al módulo de empleados y crea algunos empleados primero.
                        </small>
                    )}
                    {submitted && !pago.empleadoId && <small className="p-error">Empleado es requerido.</small>}
                </div>

                {pago.empleadoId && (
                    <div className="field">
                        <div className="surface-100 border-round p-3 mb-3">
                            <h5 className="mt-0 mb-2">Datos del Empleado Seleccionado:</h5>
                            <div className="grid">
                                <div className="col-6">
                                    <strong>Código:</strong> {pago.codigo}
                                </div>
                                <div className="col-6">
                                    <strong>DNI:</strong> {pago.dni}
                                </div>
                                <div className="col-12">
                                    <strong>Tipo:</strong> 
                                    <Tag
                                        value={pago.tipoEmpleado}
                                        className="ml-2"
                                        style={{
                                            backgroundColor: pago.tipoEmpleado === 'Conductor' ? '#3B82F6' :
                                                pago.tipoEmpleado === 'Cajero' ? '#10B981' :
                                                    pago.tipoEmpleado === 'Administrador' ? '#8B5CF6' :
                                                        pago.tipoEmpleado === 'Servicio de Limpieza' ? '#F59E0B' : '#6B7280',
                                            color: 'white'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="field">
                    <label htmlFor="fechaPago" className="font-bold">Fecha de Pago *</label>
                    <Calendar
                        id="fechaPago"
                        value={pago.fechaPago}
                        onChange={onCalendarChange}
                        showIcon
                        dateFormat="dd/mm/yy"
                        placeholder="Seleccione la fecha de pago"
                        className={submitted && !pago.fechaPago ? 'p-invalid' : ''}
                    />
                    {submitted && !pago.fechaPago && <small className="p-error">Fecha de pago es requerida.</small>}
                </div>

                <div className="field">
                    <label htmlFor="monto" className="font-bold">Monto (HNL) *</label>
                    <InputNumber
                        id="monto"
                        value={pago.monto}
                        onChange={onMontoChange}
                        mode="currency"
                        currency="HNL"
                        locale="es-HN"
                        placeholder="0.00"
                        className={submitted && pago.monto <= 0 ? 'p-invalid' : ''}
                    />
                    {submitted && pago.monto <= 0 && <small className="p-error">Monto debe ser mayor a 0.</small>}
                </div>
            </Dialog>

            {/* Dialog de detalles del pago */}
            <Dialog
                visible={detallePagoDialog}
                style={{ width: '600px' }}
                header={`Detalles del Pago`}
                modal
                footer={detallePagoDialogFooter}
                onHide={() => setDetallePagoDialog(false)}
            >
                <div className="p-4">
                    <div className="grid">
                        <div className="col-12">
                            <h4 className="mt-0 mb-3 text-primary">Información del Empleado</h4>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-bold text-900">Código:</label>
                                <p className="text-700 mt-1">{pagoDetalle.codigo}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-bold text-900">DNI:</label>
                                <p className="text-700 mt-1">{pagoDetalle.dni}</p>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="field">
                                <label className="font-bold text-900">Nombre Completo:</label>
                                <p className="text-700 mt-1">{pagoDetalle.nombreCompleto}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-bold text-900">Tipo de Empleado:</label>
                                <div className="mt-1">
                                    <Tag
                                        value={pagoDetalle.tipoEmpleado}
                                        style={{
                                            backgroundColor: pagoDetalle.tipoEmpleado === 'Conductor' ? '#3B82F6' :
                                                pagoDetalle.tipoEmpleado === 'Cajero' ? '#10B981' :
                                                    pagoDetalle.tipoEmpleado === 'Administrador' ? '#8B5CF6' :
                                                        pagoDetalle.tipoEmpleado === 'Servicio de Limpieza' ? '#F59E0B' : '#6B7280',
                                            color: 'white',
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '500'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-12">
                            <h4 className="mb-3 text-primary">Información del Pago</h4>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-bold text-900">Fecha de Pago:</label>
                                <p className="text-700 mt-1">{pagoDetalle.fechaPago?.toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-bold text-900">Monto:</label>
                                <p className="text-700 mt-1 text-xl font-bold text-green-600">
                                    {new Intl.NumberFormat('es-HN', {
                                        style: 'currency',
                                        currency: 'HNL'
                                    }).format(pagoDetalle.monto)}
                                </p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-bold text-900">Fecha de Registro:</label>
                                <p className="text-700 mt-1">{pagoDetalle.fechaCreacion?.toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>

            {/* Dialog de confirmación de eliminación */}
            <Dialog 
                visible={deletePagoDialog} 
                style={{ width: '450px' }} 
                header="Confirmación" 
                modal 
                footer={deletePagoDialogFooter} 
                onHide={() => setDeletePagoDialog(false)}
            >
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {pago && (
                        <span>
                            ¿Estás seguro que deseas eliminar el pago de <b>{pago.nombreCompleto}</b> por{' '}
                            <b>{new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' }).format(pago.monto)}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
};

export default PlanillaPagos;