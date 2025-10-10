/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { RadioButton } from 'primereact/radiobutton';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar } from 'primereact/calendar';
import { addLocale } from 'primereact/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import esLocale from '@fullcalendar/core/locales/es';
import { Tooltip } from 'primereact/tooltip';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Badge } from 'primereact/badge';
import { listarUnidades } from '@/modulos/unidades/servicios/unidades.servicios';
import { obtenerTiposMantenimiento } from '@/modulos/mantenimientos/servicios/tipoMantenimiento.servicios';
import { obtenerEstadosMantenimiento } from '@/modulos/mantenimientos/servicios/estadoMantenimiento.servicios';
import {
    listarMantenimientos,
    crearMantenimiento,
    actualizarMantenimiento,
    eliminarMantenimiento
} from '@/modulos/mantenimientos/servicios/mantenimientos.servicios';

const MantenimientoTransporte = () => {
    const emptyServicio = {
        id: null,
        vehiculo: '',
        placa: '',
        tipoServicio: '',
        fecha: null,
        fechaRealizada: null,
        proximoMantenimiento: null,
        kilometraje: 0,
        estado: '',
        descripcion: '',
        costo: 0,
        taller: '',
        repuestos: '',
    };


    const [servicios, setServicios] = useState<any[]>([]);
    const [servicio, setServicio] = useState<any>(emptyServicio);
    const [servicioDialog, setServicioDialog] = useState(false);
    const [detalleDialog, setDetalleDialog] = useState(false);
    const [detalleServicioDialog, setDetalleServicioDialog] = useState(false);
    const [servicioSeleccionado, setServicioSeleccionado] = useState<any>(null);
    const [submitted, setSubmitted] = useState(false);
    const [alertas, setAlertas] = useState<any[]>([]);
    const [vehiculosDetalle, setVehiculosDetalle] = useState<any[]>([]);
    const toast = useRef<Toast>(null);
    const [tiposMantenimiento, setTiposMantenimiento] = useState<TipoMantenimiento[]>([]);
    const [estadosMantenimiento, setEstadosMantenimiento] = useState<EstadoMantenimiento[]>([]);


    const [resumen, setResumen] = useState({ verde: 0, amarillo: 0, rojo: 0 });

    useEffect(() => {
        async function cargarMantenimientos() {
            try {
                const data = await listarMantenimientos();

                // 🔧 Mapear nombres de columnas desde BD a los usados en el front
                const transformados = data.map((m: any) => ({
                    id: m.Id_Mantenimiento_PK,
                    vehiculo: m.Marca_Unidad || m.Vehiculo || '',
                    placa: m.Numero_Placa || m.Placa || '',
                    tipoServicio: m.Servicio || m.Tipo_Servicio || '',
                    estado: m.Estado || '',
                    fecha: m.Fecha_Programada || m.Fecha || null,
                    fechaRealizada: m.Fecha_Realizada || m.FechaRealizada || null,
                    proximoMantenimiento: m.Proximo_Mantenimiento || m.ProximoMantenimiento || null,
                    kilometraje: m.Kilometraje || 0,
                    taller: m.Taller || '',
                    descripcion: m.Descripcion || '',
                    repuestos: m.Repuestos || '',
                    costo: m.Costo_Total || 0,
                }));

                setServicios(transformados);
            } catch (error) {
                console.error('❌ Error al listar mantenimientos:', error);
            }
        }

        cargarMantenimientos();
    }, []);

    useEffect(() => {
        async function cargarCatalogos() {
            try {
                const [tipos, estados] = await Promise.all([
                    obtenerTiposMantenimiento(),
                    obtenerEstadosMantenimiento(),
                ]);
                setTiposMantenimiento(tipos);
                setEstadosMantenimiento(estados);
            } catch (error) {
                console.error('❌ Error al cargar catálogos de mantenimiento:', error);
            }
        }

        cargarCatalogos();
    }, []);


    useEffect(() => {
        addLocale('es', {
            firstDayOfWeek: 1,
            dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
            dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
            dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
            monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
            monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
            today: 'Hoy',
            clear: 'Limpiar'
        });
    }, []);

    useEffect(() => {
        const hoy = new Date();
        const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        const nuevasAlertas: any[] = [];
        const nuevoResumen = { verde: 0, amarillo: 0, rojo: 0 };

        servicios.forEach((s) => {
            const fechaServicio = new Date(s.fecha);
            const fechaServicioSinHora = new Date(fechaServicio.getFullYear(), fechaServicio.getMonth(), fechaServicio.getDate());
            const diferenciaDias = Math.floor((fechaServicioSinHora.getTime() - hoySinHora.getTime()) / (1000 * 60 * 60 * 24));

            if (diferenciaDias > 7) {
                nuevoResumen.verde++;
                nuevasAlertas.push({ ...s, prioridad: 'lejos', tipo: 'fecha', diasRestantes: diferenciaDias });
            } else if (diferenciaDias >= 3 && diferenciaDias <= 7) {
                nuevoResumen.amarillo++;
                nuevasAlertas.push({ ...s, prioridad: 'proxima', tipo: 'fecha', diasRestantes: diferenciaDias });
            } else if (diferenciaDias >= 0 && diferenciaDias < 3) {
                nuevoResumen.rojo++;
                nuevasAlertas.push({ ...s, prioridad: 'urgente', tipo: 'fecha', diasRestantes: diferenciaDias });
            } else if (diferenciaDias < 0) {
                nuevoResumen.rojo++;
                nuevasAlertas.push({ ...s, prioridad: 'vencido', tipo: 'fecha', diasRestantes: diferenciaDias });
            }

            if (s.kilometraje <= 200) {
                nuevasAlertas.push({ ...s, prioridad: 'proxima', tipo: 'kilometraje', kilometrosRestantes: 200 });
            }
        });

        setAlertas(nuevasAlertas);
        setResumen(nuevoResumen);
    }, [servicios]);

    const openNew = () => {
        setServicio(emptyServicio);
        setSubmitted(false);
        setServicioDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setServicioDialog(false);
    };

    const hideDetalleDialog = () => {
        setDetalleDialog(false);
    };

    const hideDetalleServicioDialog = () => {
        setDetalleServicioDialog(false);
        setServicioSeleccionado(null);
    };

    const verDetalle = () => {
        // Agrupar servicios por vehículo y placa
        const vehiculosAgrupados = servicios.reduce((acc, servicio) => {
            const key = `${servicio.vehiculo}-${servicio.placa}`;
            if (!acc[key]) {
                acc[key] = {
                    vehiculo: servicio.vehiculo,
                    placa: servicio.placa,
                    servicios: [],
                    totalServicios: 0,
                    costoTotal: 0,
                    ultimoServicio: null
                };
            }
            acc[key].servicios.push(servicio);
            acc[key].totalServicios++;
            acc[key].costoTotal += servicio.costo || 0;

            // Encontrar el último servicio (más reciente)
            if (!acc[key].ultimoServicio || new Date(servicio.fecha) > new Date(acc[key].ultimoServicio.fecha)) {
                acc[key].ultimoServicio = servicio;
            }

            return acc;
        }, {});

        // Convertir a array y ordenar servicios por fecha
        const vehiculosArray = Object.values(vehiculosAgrupados).map((vehiculo: any) => ({
            ...vehiculo,
            servicios: vehiculo.servicios.sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        }));

        setVehiculosDetalle(vehiculosArray);
        setDetalleDialog(true);
    };

    const onInputChange = (e: any, name: string) => {
        const val = (e.target && e.target.value) || '';
        let _servicio = { ...servicio };
        _servicio[name] = val;
        setServicio(_servicio);
    };

    const onInputNumberChange = (e: any, name: string) => {
        const val = e.value || 0;
        let _servicio = { ...servicio };
        _servicio[name] = val;
        setServicio(_servicio);
    };

    const onCategoryChange = (e: any) => {
        let _servicio = { ...servicio };
        _servicio['tipoServicio'] = e.value;
        setServicio(_servicio);
    };

    const onEstadoChange = (e: any) => {
        let _servicio = { ...servicio };
        _servicio['estado'] = e.value;
        setServicio(_servicio);
    };

    const createId = () => {
        return Math.random().toString(36).substr(2, 9);
    };

    const editServicio = (rowData: any) => {
        const tipoSeleccionado = tiposMantenimiento.find(
            (t: any) => t.Servicio === rowData.tipoServicio
        );
        const estadoSeleccionado = estadosMantenimiento.find(
            (e: any) => e.Estado === rowData.estado
        );
        const unidadSeleccionada = unidades.find(
            (u) => `${u.Marca_Unidad} ${u.Modelo} (${u.Año})` === rowData.vehiculo
        );

        setServicio({
            ...rowData,
            Id_TipoManto_FK: tipoSeleccionado ? tipoSeleccionado.Id : null,
            Id_EstadoManto_FK: estadoSeleccionado ? estadoSeleccionado.Id : null,
            Id_Unidad_FK: unidadSeleccionada ? unidadSeleccionada.Id_Unidad_PK : null,
            fecha: rowData.fecha ? new Date(rowData.fecha) : null,
            fechaRealizada: rowData.fechaRealizada ? new Date(rowData.fechaRealizada) : null,
            proximoMantenimiento: rowData.proximoMantenimiento ? new Date(rowData.proximoMantenimiento) : null,
        });

        setServicioDialog(true);
    };


    const deleteServicio = async (rowData: any) => {
        try {
            await eliminarMantenimiento(rowData.id);
            const data = await listarMantenimientos();
            setServicios(data);

            toast.current?.show({
                severity: 'success',
                summary: 'Eliminado',
                detail: 'Mantenimiento eliminado correctamente',
                life: 3000
            });
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo eliminar el mantenimiento',
                life: 3000
            });
        }
    };


    const verDetalleServicio = (rowData: any) => {
        setServicioSeleccionado(rowData);
        setDetalleServicioDialog(true);
    };


    const accionesTemplate = (rowData: any) => (
        <div className="flex gap-2">
            <Button icon="pi pi-eye" rounded text severity="info" aria-label="Ver Detalle" onClick={() => verDetalleServicio(rowData)} />
            <Button icon="pi pi-pencil" rounded text severity="warning" aria-label="Editar" onClick={() => editServicio(rowData)} />
            <Button icon="pi pi-trash" rounded text severity="danger" aria-label="Eliminar" onClick={() => deleteServicio(rowData)} />
        </div>
    );

    interface TipoMantenimiento {
        Id: number;
        Servicio: string;
        Descripcion: string;
    }

    interface EstadoMantenimiento {
        Id: number;
        Estado: string;
        Descripcion: string;
    }

    const saveServicio = async () => {
        setSubmitted(true);

        try {
            // Validar campos obligatorios del formulario
            if (!servicio.Id_Unidad_FK) {
                toast.current?.show({
                    severity: 'warn',
                    summary: 'Unidad requerida',
                    detail: 'Debes seleccionar una unidad o vehículo.',
                    life: 3000,
                });
                return;
            }

            if (!servicio.Id_TipoManto_FK) {
                toast.current?.show({
                    severity: 'warn',
                    summary: 'Tipo requerido',
                    detail: 'Selecciona el tipo de mantenimiento.',
                    life: 3000,
                });
                return;
            }

            if (!servicio.Id_EstadoManto_FK) {
                toast.current?.show({
                    severity: 'warn',
                    summary: 'Estado requerido',
                    detail: 'Selecciona el estado del mantenimiento.',
                    life: 3000,
                });
                return;
            }

            if (!servicio.proximoMantenimiento) {
                toast.current?.show({
                    severity: 'warn',
                    summary: 'Fecha requerida',
                    detail: 'Debes seleccionar la fecha del próximo mantenimiento.',
                    life: 3000,
                });
                return;
            }

            if (servicio.fecha && servicio.proximoMantenimiento <= servicio.fecha) {
                toast.current?.show({
                    severity: 'warn',
                    summary: 'Fecha inválida',
                    detail: 'La fecha del próximo mantenimiento debe ser mayor a la programada.',
                    life: 4000,
                });
                return;
            }

            // 🔧 Mapeo de campos reales que espera el SP `sp_mantenimiento_crear`
            const payload = {
                Id_Unidad_FK: servicio.Id_Unidad_FK,
                Id_TipoManto_FK: servicio.Id_TipoManto_FK,
                Id_EstadoManto_FK: servicio.Id_EstadoManto_FK,
                Fecha_Programada: servicio.fecha
                    ? new Date(servicio.fecha).toISOString().split('T')[0]
                    : null,
                Fecha_Realizada: servicio.fechaRealizada
                    ? new Date(servicio.fechaRealizada).toISOString().split('T')[0]
                    : null,
                Proximo_Mantenimiento: servicio.proximoMantenimiento
                    ? new Date(servicio.proximoMantenimiento).toISOString().split('T')[0]
                    : null,
                Kilometraje: servicio.kilometraje,
                Descripcion: servicio.descripcion,
                Costo_Total: servicio.costo,
                Taller: servicio.taller,
                Repuestos: servicio.repuestos,
            };


            if (servicio.id) {
                // 🔄 Actualizar mantenimiento existente
                await actualizarMantenimiento(servicio.id, payload);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Actualizado',
                    detail: 'Mantenimiento actualizado correctamente',
                    life: 3000,
                });
            } else {
                // 🆕 Crear nuevo mantenimiento
                await crearMantenimiento(payload);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Guardado',
                    detail: 'Mantenimiento registrado correctamente',
                    life: 3000,
                });
            }

            // Refrescar lista y cerrar modal
            const data = await listarMantenimientos();
            setServicios(data);
            setServicioDialog(false);
            setServicio(emptyServicio);
        } catch (error) {
            console.error('❌ Error al guardar mantenimiento:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo guardar el mantenimiento.',
                life: 3000,
            });
        }
    };

    interface Unidad {
        Id_Unidad_PK: number;
        Numero_Placa: string;
        Marca_Unidad: string;
        Modelo: string;
        Año: number;
    }
    const [unidades, setUnidades] = useState<Unidad[]>([]);
    useEffect(() => {
        async function cargarUnidades() {
            try {
                const data = await listarUnidades();
                setUnidades(data);
            } catch (error) {
                console.error('❌ Error al cargar unidades:', error);
            }
        }
        cargarUnidades();
    }, []);


    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const formatearFechaHora = (fechaISO: string) => {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleString('es-HN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatearFechaAlerta = (fechaISO: string) => {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleString('es-HN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).replace(',', ' a las');
    };

    const estadisticas = meses.map((mes, index) => {
        const serviciosDelMes = servicios.filter((s) => {
            const fecha = new Date(s.fecha);
            return fecha.getMonth() === index;
        });

        return {
            mes,
            preventivo: serviciosDelMes.filter(s => s.tipoServicio === 'Preventivo').length,
            correctivo: serviciosDelMes.filter(s => s.tipoServicio === 'Correctivo').length,
            inspeccion: serviciosDelMes.filter(s => s.tipoServicio === 'Inspección técnica').length
        };
    });

    const [filtroPlaca, setFiltroPlaca] = useState('');

    const serviciosFiltrados = servicios.filter(
        (s) => (s.placa?.toLowerCase() || '').includes(filtroPlaca.toLowerCase())
    );


    const getAlertColor = (diasRestantes: number) => {
        if (diasRestantes < 0) {
            return { bg: 'surface-100', text: 'text-red-800', border: 'border-red-500' };
        } else if (diasRestantes >= 0 && diasRestantes < 3) {
            return { bg: 'surface-100', text: 'text-red-800', border: 'border-red-500' };
        } else if (diasRestantes >= 3 && diasRestantes <= 7) {
            return { bg: 'surface-100', text: 'text-yellow-800', border: 'border-yellow-500' };
        } else {
            return { bg: 'surface-100', text: 'text-green-800', border: 'border-green-500' };
        }
    };

    const getTipoServicioBadge = (tipo: string) => {
        switch (tipo) {
            case 'Preventivo':
                return <Badge value="Preventivo" severity="success" />;
            case 'Correctivo':
                return <Badge value="Correctivo" severity="danger" />;
            case 'Inspección técnica':
                return <Badge value="Inspección" severity="info" />;
            default:
                return <Badge value={tipo} />;
        }
    };

    const getEstadoBadge = (estado: string) => {
        return estado === 'Completado'
            ? <Badge value="Completado" severity="success" />
            : <Badge value="Pendiente" severity="danger" />;
    };

    const servicioDialogFooter = (
        <>
            <Button
                label="Cancelar"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDialog}
            />
            <Button
                label="Guardar"
                icon="pi pi-check"
                className="p-button-text"
                onClick={saveServicio}
            />
        </>
    );

    return (
        <div className="grid">
            <Toast ref={toast} />

            <div className="col-12">
                <Toolbar
                    className="mb-4"
                    left={
                        <div className="flex gap-2">
                            <Button label="Nuevo Servicio" icon="pi pi-plus" severity="success" onClick={openNew} />
                            <Button label="Ver Detalle por Vehículo" icon="pi pi-eye" severity="info" onClick={verDetalle} />
                        </div>
                    }
                />

                <div className="card">
                    <h5>Resumen de Mantenimientos</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <div className="p-4 border-round shadow-2" style={{
                                backgroundColor: '#dcfce7',
                                border: '2px solid #22c55e'
                            }}>
                                <h6 className="m-0 mb-2" style={{ color: '#166534' }}>
                                    Mantenimientos mayores a 7 días
                                </h6>
                                <p className="text-4xl m-0 font-bold" style={{ color: '#166534' }}>
                                    {resumen.verde}
                                </p>
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="p-4 border-round shadow-2" style={{
                                backgroundColor: '#fef3c7',
                                border: '2px solid #f59e0b'
                            }}>
                                <h6 className="m-0 mb-2" style={{ color: '#92400e' }}>
                                    Mantenimientos en 3-7 días
                                </h6>
                                <p className="text-4xl m-0 font-bold" style={{ color: '#92400e' }}>
                                    {resumen.amarillo}
                                </p>
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="p-4 border-round shadow-2" style={{
                                backgroundColor: '#fee2e2',
                                border: '2px solid #ef4444'
                            }}>
                                <h6 className="m-0 mb-2" style={{ color: '#991b1b' }}>
                                    Mantenimientos menores a 3 días
                                </h6>
                                <p className="text-4xl m-0 font-bold" style={{ color: '#991b1b' }}>
                                    {resumen.rojo}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ALERTAS */}
                <div className="card">
                    <h5>Alertas</h5>
                    {alertas.length === 0 ? (
                        <div className="p-3 border-round" style={{ backgroundColor: '#f0f9ff', border: '2px solid #0ea5e9' }}>
                            <p className="m-0" style={{ color: '#0369a1' }}>
                                ℹ️ No hay alertas pendientes.
                            </p>
                        </div>
                    ) : (
                        alertas
                            .filter((alerta) => alerta.tipo === 'fecha')
                            .map((alerta, index) => {
                                let mensaje = '';
                                const estadoTexto = alerta.estado === 'Completado' ? ' (Completado)' : ' (Pendiente)';

                                if (alerta.diasRestantes < 0) {
                                    mensaje = `⚠️ ¡VENCIDO! El ${alerta.vehiculo} (${alerta.placa}) tiene un ${alerta.tipoServicio} vencido desde hace ${Math.abs(alerta.diasRestantes)} días${estadoTexto}. Fecha: ${formatearFechaAlerta(alerta.fecha)}.`;
                                } else if (alerta.diasRestantes === 0) {
                                    mensaje = `🚨 ¡HOY! El ${alerta.vehiculo} (${alerta.placa}) tiene un ${alerta.tipoServicio} programado para hoy${estadoTexto} a las ${formatearFechaAlerta(alerta.fecha)}.`;
                                } else if (alerta.diasRestantes === 1) {
                                    mensaje = `⚡ ¡MAÑANA! El ${alerta.vehiculo} (${alerta.placa}) tiene un ${alerta.tipoServicio} programado para mañana${estadoTexto}: ${formatearFechaAlerta(alerta.fecha)}.`;
                                } else if (alerta.diasRestantes < 3) {
                                    mensaje = `🔴 El ${alerta.vehiculo} (${alerta.placa}) tiene un ${alerta.tipoServicio} en ${alerta.diasRestantes} días${estadoTexto}: ${formatearFechaAlerta(alerta.fecha)}.`;
                                } else if (alerta.diasRestantes <= 7) {
                                    mensaje = `🟡 El ${alerta.vehiculo} (${alerta.placa}) tiene un ${alerta.tipoServicio} en ${alerta.diasRestantes} días${estadoTexto}: ${formatearFechaAlerta(alerta.fecha)}.`;
                                } else {
                                    mensaje = `🟢 El ${alerta.vehiculo} (${alerta.placa}) tiene un ${alerta.tipoServicio} programado en ${alerta.diasRestantes} días${estadoTexto}: ${formatearFechaAlerta(alerta.fecha)}.`;
                                }

                                let bgColor = '';
                                let borderColor = '';
                                let textColor = '';

                                if (alerta.diasRestantes < 3) {
                                    bgColor = '#fee2e2';
                                    borderColor = '#ef4444';
                                    textColor = '#991b1b';
                                } else if (alerta.diasRestantes >= 3 && alerta.diasRestantes <= 7) {
                                    bgColor = '#fef3c7';
                                    borderColor = '#f59e0b';
                                    textColor = '#92400e';
                                } else {
                                    bgColor = '#dcfce7';
                                    borderColor = '#22c55e';
                                    textColor = '#166534';
                                }

                                return (
                                    <div
                                        key={index}
                                        className="p-3 mb-2 border-round shadow-1"
                                        style={{
                                            backgroundColor: bgColor,
                                            border: `2px solid ${borderColor}`,
                                            color: textColor
                                        }}
                                    >
                                        <p className="m-0 font-medium">{mensaje}</p>
                                    </div>
                                );
                            })
                    )}
                </div>

                {/* TABLA DE SERVICIOS */}
                <div className="card mt-4">
                    <h5>Historial de Servicios</h5>
                    <div className="card mb-3">
                        <InputText
                            placeholder="Buscar por placa..."
                            value={filtroPlaca}
                            onChange={(e) => setFiltroPlaca(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <DataTable
                        value={serviciosFiltrados}
                        paginator
                        rows={5}
                        showGridlines
                        responsiveLayout="scroll"
                        emptyMessage="No hay servicios registrados."
                    >
                        <Column field="vehiculo" header="Vehículo" />
                        <Column field="placa" header="Placa" />
                        <Column field="tipoServicio" header="Tipo de Servicio" />
                        <Column
                            header="Estado"
                            body={(rowData) => {
                                const estado = rowData.estado?.toUpperCase() || 'PENDIENTE';
                                let color = '';

                                switch (estado) {
                                    case 'PROGRAMADO':
                                        color = 'bg-blue-100 text-blue-800';
                                        break;
                                    case 'EN_PROCESO':
                                        color = 'bg-yellow-100 text-yellow-800';
                                        break;
                                    case 'COMPLETADO':
                                        color = 'bg-green-100 text-green-800';
                                        break;
                                    case 'CANCELADO':
                                        color = 'bg-red-100 text-red-800';
                                        break;
                                    default:
                                        color = 'bg-gray-200 text-gray-700';
                                }

                                return (
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
                                        {estado}
                                    </span>
                                );
                            }}
                        />
                        <Column field="fecha" header="Fecha Programada" sortable />
                        <Column field="fechaRealizada" header="Fecha Realizada" sortable />
                        <Column field="proximoMantenimiento" header="Próximo Mantenimiento" sortable />
                        <Column field="kilometraje" header="Kilometraje" />
                        <Column field="taller" header="Taller" />
                        <Column field="descripcion" header="Descripción" />
                        <Column field="repuestos" header="Repuestos" />
                        <Column field="costo" header="Costo" body={(rowData) => rowData.costo?.toLocaleString('es-HN', { style: 'currency', currency: 'HNL', minimumFractionDigits: 2 })} />
                        <Column body={accionesTemplate} header="Acciones" />
                    </DataTable>
                </div>

                {/* CALENDARIO */}
                <div className="card">
                    <h5>Calendario de Mantenimientos</h5>
                    <Tooltip target=".fc-event" position="top" />
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        editable={true}
                        locale={esLocale}
                        events={servicios.map((s) => ({
                            id: s.id,
                            title: `${s.tipoServicio} (${s.vehiculo}) - ${s.estado}`,
                            date: s.fecha,
                            color:
                                s.tipoServicio === 'Preventivo'
                                    ? '#22c55e'
                                    : s.tipoServicio === 'Correctivo'
                                        ? '#ef4444'
                                        : '#3b82f6',
                            extendedProps: s
                        }))}
                        eventDidMount={(info) => {
                            const s = info.event.extendedProps;
                            const tooltipContent = `
                                Vehículo: ${s.vehiculo}
                                Placa: ${s.placa}
                                Servicio: ${s.tipoServicio}
                                Estado: ${s.estado}
                                Fecha: ${new Date(s.fecha).toLocaleDateString('es-ES')}
                                Kilometraje: ${s.kilometraje}
                                Taller: ${s.taller}
                                Costo: ${s.costo?.toLocaleString('es-HN', { style: 'currency', currency: 'HNL' })}`;
                            info.el.setAttribute('title', tooltipContent);
                        }}
                    />
                </div>

                {/* GRÁFICO */}
                <div className="card">
                    <h5>Mantenimientos por Tipo</h5>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={estadisticas}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="mes" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="preventivo" stackId="a" fill="#22c55e" name="Preventivo" />
                            <Bar dataKey="correctivo" stackId="a" fill="#ef4444" name="Correctivo" />
                            <Bar dataKey="inspeccion" stackId="a" fill="#3b82f6" name="Inspección" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* DIALOGO FORMULARIO */}
            <Dialog
                visible={servicioDialog}
                style={{ width: '50rem' }}
                header={servicio.id ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento'}
                modal
                className="p-fluid"
                footer={servicioDialogFooter}
                onHide={hideDialog}
            >
                {/* 🚍 Unidad / Vehículo */}
                <div className="field">
                    <label htmlFor="vehiculo">Unidad / Vehículo</label>
                    <Dropdown
                        id="vehiculo"
                        value={servicio.Id_Unidad_FK}
                        options={unidades.map((u) => ({
                            label: `${u.Numero_Placa} – ${u.Marca_Unidad} ${u.Modelo} (${u.Año})`,
                            value: u.Id_Unidad_PK,
                        }))}
                        onChange={(e) => {
                            const unidadSeleccionada = unidades.find(
                                (u) => u.Id_Unidad_PK === e.value
                            );
                            setServicio({
                                ...servicio,
                                Id_Unidad_FK: e.value,
                                vehiculo: unidadSeleccionada
                                    ? `${unidadSeleccionada.Numero_Placa} – ${unidadSeleccionada.Marca_Unidad} ${unidadSeleccionada.Modelo} (${unidadSeleccionada.Año})`
                                    : '',
                            });
                        }}
                        placeholder="Selecciona una unidad"
                        className="w-full"
                    />
                </div>

                {/* 🔧 Tipo de Mantenimiento */}
                <div className="field">
                    <label htmlFor="tipoServicio">Tipo de mantenimiento</label>
                    <Dropdown
                        id="tipoServicio"
                        value={servicio.Id_TipoManto_FK}
                        options={tiposMantenimiento.map((t) => ({
                            label: `${t.Servicio} – ${t.Descripcion}`,
                            value: t.Id,
                        }))}
                        onChange={(e) =>
                            setServicio({ ...servicio, Id_TipoManto_FK: e.value })
                        }
                        placeholder="Selecciona tipo"
                        className="w-full"
                    />
                </div>

                {/* 📅 Fecha Programada */}
                <div className="field">
                    <label htmlFor="fecha">Fecha Programada</label>
                    <Calendar
                        id="fecha"
                        value={servicio.fecha}
                        onChange={(e) => setServicio({ ...servicio, fecha: e.value })}
                        dateFormat="yy-mm-dd"
                        showIcon
                        className="w-full"
                    />
                </div>

                {/* 📅 Fecha Realizada (opcional) */}
                <div className="field">
                    <label htmlFor="fechaRealizada">Fecha Realizada</label>
                    <Calendar
                        id="fechaRealizada"
                        value={servicio.fechaRealizada}
                        onChange={(e) => setServicio({ ...servicio, fechaRealizada: e.value })}
                        dateFormat="yy-mm-dd"
                        showIcon
                        className="w-full"
                        placeholder="Opcional"
                    />
                </div>

                {/* 📅 Próximo Mantenimiento (obligatorio y > fecha programada) */}
                <div className="field">
                    <label htmlFor="proximoMantenimiento">Próximo Mantenimiento</label>
                    <Calendar
                        id="proximoMantenimiento"
                        value={servicio.proximoMantenimiento}
                        onChange={(e) => {
                            const seleccionada = e.value;
                            const fechaProgramada = servicio.fecha;

                            if (fechaProgramada && seleccionada && seleccionada <= fechaProgramada) {
                                toast.current?.show({
                                    severity: 'warn',
                                    summary: 'Fecha inválida',
                                    detail: 'La fecha del próximo mantenimiento debe ser mayor a la programada.',
                                    life: 4000,
                                });
                                return;
                            }

                            setServicio({ ...servicio, proximoMantenimiento: seleccionada });
                        }}
                        dateFormat="yy-mm-dd"
                        showIcon
                        className="w-full"
                        required
                    />
                </div>

                {/* 🧭 Kilometraje */}
                <div className="field">
                    <label htmlFor="kilometraje">Kilometraje</label>
                    <InputNumber
                        id="kilometraje"
                        value={servicio.kilometraje}
                        onValueChange={(e) =>
                            setServicio({ ...servicio, kilometraje: e.value || 0 })
                        }
                        min={0}
                        placeholder="Ej. 150000"
                        className="w-full"
                    />
                </div>

                {/* 🏷️ Estado del mantenimiento */}
                <div className="field">
                    <label htmlFor="estado">Estado del mantenimiento</label>
                    <Dropdown
                        id="estado"
                        value={servicio.Id_EstadoManto_FK}
                        options={estadosMantenimiento.map((e) => ({
                            label: `${e.Estado} – ${e.Descripcion}`,
                            value: e.Id,
                        }))}
                        onChange={(e) =>
                            setServicio({ ...servicio, Id_EstadoManto_FK: e.value })
                        }
                        placeholder="Selecciona estado"
                        className="w-full"
                    />
                </div>

                {/* 💬 Descripción */}
                <div className="field">
                    <label htmlFor="descripcion">Descripción</label>
                    <InputTextarea
                        id="descripcion"
                        value={servicio.descripcion}
                        onChange={(e) =>
                            setServicio({ ...servicio, descripcion: e.target.value })
                        }
                        rows={3}
                        placeholder="Detalle del mantenimiento realizado o planificado"
                    />
                </div>

                {/* 💰 Costo total */}
                <div className="field">
                    <label htmlFor="costo">Costo Total (L)</label>
                    <InputNumber
                        id="costo"
                        value={servicio.costo}
                        onValueChange={(e) =>
                            setServicio({ ...servicio, costo: e.value || 0 })
                        }
                        mode="currency"
                        currency="HNL"
                        locale="es-HN"
                        className="w-full"
                    />
                </div>

                {/* 🧰 Taller */}
                <div className="field">
                    <label htmlFor="taller">Taller</label>
                    <InputText
                        id="taller"
                        value={servicio.taller}
                        onChange={(e) => setServicio({ ...servicio, taller: e.target.value })}
                        placeholder="Ej. Taller El Motorista"
                    />
                </div>

                {/* 🔩 Repuestos */}
                <div className="field">
                    <label htmlFor="repuestos">Repuestos utilizados</label>
                    <InputText
                        id="repuestos"
                        value={servicio.repuestos}
                        onChange={(e) =>
                            setServicio({ ...servicio, repuestos: e.target.value })
                        }
                        placeholder="Ej. Aceite, Filtro de aire"
                    />
                </div>
            </Dialog>

            {/* DIALOGO DETALLE DE SERVICIO INDIVIDUAL */}
            <Dialog
                visible={detalleServicioDialog}
                style={{ width: '600px' }}
                header={`Detalles del Servicio: ${servicioSeleccionado?.vehiculo || ''}`}
                modal
                onHide={hideDetalleServicioDialog}
                footer={<Button label="Cerrar" icon="pi pi-times" onClick={hideDetalleServicioDialog} />}
            >
                {servicioSeleccionado && (
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-semibold text-900">Código:</label>
                                <p className="m-0 mt-1 text-700">{servicioSeleccionado.id}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-semibold text-900">Vehículo:</label>
                                <p className="m-0 mt-1 text-700">{servicioSeleccionado.vehiculo}</p>
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-semibold text-900">Placa:</label>
                                <p className="m-0 mt-1 text-700">{servicioSeleccionado.placa}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-semibold text-900">Tipo de Servicio:</label>
                                <p className="m-0 mt-1">{getTipoServicioBadge(servicioSeleccionado.tipoServicio)}</p>
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-semibold text-900">Fecha del Servicio:</label>
                                <p className="m-0 mt-1 text-700">{formatearFechaHora(servicioSeleccionado.fecha)}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-semibold text-900">Kilometraje:</label>
                                <p className="m-0 mt-1 text-700">{servicioSeleccionado.kilometraje?.toLocaleString() || 0} km</p>
                            </div>
                        </div>

                        <div className="col-12">
                            <div className="field">
                                <label className="font-semibold text-900">Taller:</label>
                                <p className="m-0 mt-1 text-700">{servicioSeleccionado.taller || 'No especificado'}</p>
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-semibold text-900">Costo del Servicio:</label>
                                <p className="m-0 mt-1 text-700 font-bold text-lg">
                                    {servicioSeleccionado.costo?.toLocaleString('es-HN', {
                                        style: 'currency',
                                        currency: 'HNL'
                                    }) || 'L. 0.00'}
                                </p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-semibold text-900">Estado:</label>
                                <p className="m-0 mt-1">
                                    {getEstadoBadge(servicioSeleccionado.estado || 'Pendiente')}
                                </p>
                            </div>
                        </div>

                        <div className="col-12">
                            <div className="field">
                                <label className="font-semibold text-900">Descripción del Trabajo:</label>
                                <p className="m-0 mt-1 text-700 line-height-3">
                                    {servicioSeleccionado.descripcion || 'Sin descripción disponible'}
                                </p>
                            </div>
                        </div>

                        <div className="col-12">
                            <div className="field">
                                <label className="font-semibold text-900">Repuestos Utilizados:</label>
                                <p className="m-0 mt-1 text-700 line-height-3">
                                    {servicioSeleccionado.repuestos || 'No se especificaron repuestos'}
                                </p>
                            </div>
                        </div>

                        {servicioSeleccionado.documentos && (
                            <div className="col-12">
                                <div className="field">
                                    <label className="font-semibold text-900">Documentos:</label>
                                    <p className="m-0 mt-1 text-700">
                                        <i className="pi pi-file-pdf mr-2"></i>
                                        Documentos adjuntos disponibles
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Dialog>

            {/* DIALOGO DETALLE POR VEHÍCULO */}
            <Dialog
                visible={detalleDialog}
                style={{ width: '90vw', maxWidth: '1200px' }}
                header="Detalle de Mantenimientos por Vehículo"
                modal
                onHide={hideDetalleDialog}
                footer={<Button label="Cerrar" icon="pi pi-times" onClick={hideDetalleDialog} />}
            >
                {vehiculosDetalle.length === 0 ? (
                    <div className="text-center p-4">
                        <p>No hay vehículos registrados con servicios.</p>
                    </div>
                ) : (
                    <Accordion multiple>
                        {vehiculosDetalle.map((vehiculoData, index) => (
                            <AccordionTab
                                key={index}
                                header={
                                    <div className="flex justify-content-between align-items-center w-full pr-2">
                                        <div className="flex align-items-center gap-3">
                                            <i className="pi pi-car text-2xl"></i>
                                            <div>
                                                <h6 className="m-0 text-lg font-bold">{vehiculoData.vehiculo}</h6>
                                                <p className="m-0 text-sm text-500">Placa: {vehiculoData.placa}</p>
                                            </div>
                                        </div>
                                        <div className="flex align-items-center gap-4">
                                            <div className="text-center">
                                                <Badge value={vehiculoData.totalServicios} severity="info" />
                                                <p className="m-0 text-xs text-500 mt-1">Servicios</p>
                                            </div>
                                            <div className="text-center">
                                                <span className="text-lg font-bold text-primary">
                                                    {vehiculoData.costoTotal.toLocaleString('es-HN', {
                                                        style: 'currency',
                                                        currency: 'HNL'
                                                    })}
                                                </span>
                                                <p className="m-0 text-xs text-500 mt-1">Total</p>
                                            </div>
                                        </div>
                                    </div>
                                }
                            >
                                <div className="grid">
                                    {/* Información general del vehículo */}
                                    <div className="col-12 mb-4">
                                        <div className="grid">
                                            <div className="col-12 md:col-6">
                                                <div className="p-3 border-round shadow-1" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                                    <h6 className="m-0 mb-2 text-primary">Último Servicio</h6>
                                                    <p className="m-0"><strong>Tipo:</strong> {getTipoServicioBadge(vehiculoData.ultimoServicio.tipoServicio)}</p>
                                                    <p className="m-0"><strong>Estado:</strong> {getEstadoBadge(vehiculoData.ultimoServicio.estado || 'Pendiente')}</p>
                                                    <p className="m-0"><strong>Fecha:</strong> {formatearFechaHora(vehiculoData.ultimoServicio.fecha)}</p>
                                                    <p className="m-0"><strong>Taller:</strong> {vehiculoData.ultimoServicio.taller}</p>
                                                </div>
                                            </div>
                                            <div className="col-12 md:col-6">
                                                <div className="p-3 border-round shadow-1" style={{ backgroundColor: '#f0fdf4', border: '1px solid #22c55e' }}>
                                                    <h6 className="m-0 mb-2" style={{ color: '#166534' }}>Estadísticas</h6>
                                                    <p className="m-0"><strong>Total de Servicios:</strong> {vehiculoData.totalServicios}</p>
                                                    <p className="m-0"><strong>Costo Total:</strong> {vehiculoData.costoTotal.toLocaleString('es-HN', { style: 'currency', currency: 'HNL' })}</p>
                                                    <p className="m-0"><strong>Promedio por Servicio:</strong> {(vehiculoData.costoTotal / vehiculoData.totalServicios).toLocaleString('es-HN', { style: 'currency', currency: 'HNL' })}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Historial de servicios */}
                                    <div className="col-12">
                                        <h6 className="mb-3">Historial de Servicios</h6>
                                        <DataTable
                                            value={vehiculoData.servicios}
                                            paginator
                                            rows={5}
                                            showGridlines
                                            size="small"
                                            responsiveLayout="scroll"
                                            emptyMessage="No hay servicios para este vehículo."
                                        >
                                            <Column
                                                field="tipoServicio"
                                                header="Tipo"
                                                body={(rowData) => getTipoServicioBadge(rowData.tipoServicio)}
                                                style={{ width: '120px' }}
                                            />
                                            <Column
                                                field="estado"
                                                header="Estado"
                                                body={(rowData) => getEstadoBadge(rowData.estado || 'Pendiente')}
                                                style={{ width: '100px' }}
                                            />
                                            <Column
                                                header="Fecha"
                                                body={(rowData) => formatearFechaHora(rowData.fecha)}
                                                style={{ width: '150px' }}
                                            />
                                            <Column field="kilometraje" header="Km" style={{ width: '80px' }} />
                                            <Column field="taller" header="Taller" style={{ width: '120px' }} />
                                            <Column
                                                field="descripcion"
                                                header="Descripción"
                                                body={(rowData) => (
                                                    <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {rowData.descripcion || '-'}
                                                    </div>
                                                )}
                                            />
                                            <Column
                                                field="repuestos"
                                                header="Repuestos"
                                                body={(rowData) => (
                                                    <div style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {rowData.repuestos || '-'}
                                                    </div>
                                                )}
                                            />
                                            <Column
                                                field="costo" header="Costo" body={(rowData) => rowData.costo?.toLocaleString('es-HN', { style: 'currency', currency: 'HNL', minimumFractionDigits: 2 })} style={{ width: '100px' }}
                                            />
                                            <Column
                                                body={(rowData) => (
                                                    <div className="flex gap-1">
                                                        <Button icon="pi pi-pencil" rounded text size="small" severity="warning" aria-label="Editar" onClick={() => editServicio(rowData)}
                                                        />
                                                        <Button icon="pi pi-trash" rounded text size="small" severity="danger" aria-label="Eliminar" onClick={() => deleteServicio(rowData)}
                                                        />
                                                    </div>
                                                )}
                                                header="Acciones" style={{ width: '80px' }}
                                            />
                                        </DataTable>
                                    </div>
                                </div>
                            </AccordionTab>
                        ))}
                    </Accordion>
                )}
            </Dialog>
        </div>
    );
};

export default MantenimientoTransporte;