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
import { OverlayPanel } from 'primereact/overlaypanel';
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

                // ✅ usar los alias exactos del SP
                const transformados = data.map((m: any) => ({
                    id: m.id,
                    vehiculo: m.vehiculo || '',
                    placa: m.placa || '',
                    tipoServicio: m.tipoServicio || '',
                    estado: m.estado || '',
                    fecha: m.fecha || null,
                    fechaRealizada: m.fechaRealizada || null,
                    proximoMantenimiento: m.proximoMantenimiento || null,
                    kilometraje: m.kilometraje || 0,
                    taller: m.taller || '',
                    descripcion: m.descripcion || '',
                    repuestos: m.repuestos || '',
                    costo: parseFloat(m.costo) || 0,
                }));

                setServicios(transformados);
                console.log('✅ Datos cargados desde API:', transformados);
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
            // ============================
            // 🔸 FECHAS PROGRAMADAS (solo si NO hay fechaRealizada)
            // ============================
            if (!s.fechaRealizada && s.fecha) {
                const fechaServicio = new Date(s.fecha);
                const fechaServicioSinHora = new Date(
                    fechaServicio.getFullYear(),
                    fechaServicio.getMonth(),
                    fechaServicio.getDate()
                );
                const diferenciaDias = Math.floor(
                    (fechaServicioSinHora.getTime() - hoySinHora.getTime()) / (1000 * 60 * 60 * 24)
                );

                if (diferenciaDias > 7) {
                    nuevoResumen.verde++;
                    nuevasAlertas.push({
                        ...s,
                        prioridad: 'lejos',
                        tipo: 'fecha',
                        diasRestantes: diferenciaDias,
                        mensaje: `Mantenimiento programado para el ${fechaServicioSinHora.toLocaleDateString('es-HN')}`,
                    });
                } else if (diferenciaDias >= 3 && diferenciaDias <= 7) {
                    nuevoResumen.amarillo++;
                    nuevasAlertas.push({
                        ...s,
                        prioridad: 'proxima',
                        tipo: 'fecha',
                        diasRestantes: diferenciaDias,
                        mensaje: `Mantenimiento próximo en ${diferenciaDias} días (${fechaServicioSinHora.toLocaleDateString('es-HN')})`,
                    });
                } else if (diferenciaDias >= 0 && diferenciaDias < 3) {
                    nuevoResumen.rojo++;
                    nuevasAlertas.push({
                        ...s,
                        prioridad: 'urgente',
                        tipo: 'fecha',
                        diasRestantes: diferenciaDias,
                        mensaje: `¡Mantenimiento urgente! programado para ${fechaServicioSinHora.toLocaleDateString('es-HN')}`,
                    });
                } else if (diferenciaDias < 0) {
                    nuevoResumen.rojo++;
                    nuevasAlertas.push({
                        ...s,
                        prioridad: 'vencido',
                        tipo: 'fecha',
                        diasRestantes: diferenciaDias,
                        mensaje: `Mantenimiento vencido desde ${Math.abs(diferenciaDias)} días`,
                    });
                }
            }

            // ============================
            // 🔹 PRÓXIMO MANTENIMIENTO (SIEMPRE)
            // ============================
            if (s.proximoMantenimiento) {
                const fechaProx = new Date(s.proximoMantenimiento);
                const fechaProxSinHora = new Date(
                    fechaProx.getFullYear(),
                    fechaProx.getMonth(),
                    fechaProx.getDate()
                );
                const diferenciaProx = Math.floor(
                    (fechaProxSinHora.getTime() - hoySinHora.getTime()) / (1000 * 60 * 60 * 24)
                );

                let prioridad = '';
                let mensaje = '';

                if (diferenciaProx < 0) {
                    prioridad = 'azul-vencido';
                    mensaje = `El próximo mantenimiento está vencido desde hace ${Math.abs(diferenciaProx)} días`;
                } else if (diferenciaProx <= 10) {
                    prioridad = 'azul-cercano';
                    mensaje = `Debe realizar el próximo mantenimiento en ${diferenciaProx} días (${fechaProxSinHora.toLocaleDateString('es-HN')})`;
                } else if (diferenciaProx <= 30) {
                    prioridad = 'azul-normal';
                    mensaje = `El próximo mantenimiento será en ${diferenciaProx} días (${fechaProxSinHora.toLocaleDateString('es-HN')})`;
                } else {
                    prioridad = 'azul-lejano';
                    mensaje = `El próximo mantenimiento está programado para el ${fechaProxSinHora.toLocaleDateString('es-HN')}`;
                }

                nuevasAlertas.push({
                    ...s,
                    prioridad,
                    tipo: 'proximo',
                    diasRestantes: diferenciaProx,
                    mensaje,
                });
            }
        });

        setAlertas(nuevasAlertas);
        setResumen(nuevoResumen); // 👈 este resumen solo considera "fecha programada", como antes
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
            acc[key].costoTotal += parseFloat(servicio.costo) || 0;

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
        if (!estado) return <Badge value="Sin estado" severity="secondary" />;

        const estadoUpper = estado.toUpperCase().trim();

        switch (estadoUpper) {
            case 'PROGRAMADO':
                return <Badge value="Programado" severity="info" />;
            case 'EN_PROCESO':
                return <Badge value="En proceso" severity="warning" />;
            case 'COMPLETADO':
                return <Badge value="Completado" severity="success" />;
            case 'CANCELADO':
                return <Badge value="Cancelado" severity="danger" />;
            default:
                return <Badge value={estado} severity="secondary" />;
        }
    };
    const op = useRef<OverlayPanel>(null);

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
                        <div className="flex flex-wrap gap-2">
                            <Button
                                label="Nuevo Servicio"
                                icon="pi pi-plus"
                                severity="success"
                                onClick={openNew}
                            />
                            <Button
                                label="Ver Detalle por Vehículo"
                                icon="pi pi-eye"
                                severity="info"
                                onClick={verDetalle}
                            />
                        </div>
                    }
                />
                {/* 🔔 Botón de notificaciones mejorado */}
                <div className="flex justify-content-end mb-3 relative">
                    <Button
                        icon="pi pi-bell"
                        rounded
                        text
                        style={{
                            backgroundColor: '#094293',
                            color: 'white',
                            width: '3rem',
                            height: '3rem',
                            position: 'relative',
                        }}
                        className={alertas.length > 0 ? 'bell-animate' : ''}
                        aria-label="Notificaciones"
                        onClick={(e) => op.current?.toggle(e)}
                    />

                    {/* 🔢 Contador de alertas filtradas (únicamente tipo 'fecha') */}
                    {alertas.length > 0 && (
                        <Badge
                            value={alertas.length}
                            severity="danger"
                            style={{
                                position: 'absolute',
                                top: '-6px',
                                right: '-6px',
                                fontSize: '0.85rem',
                                backgroundColor: '#0061a9',
                                color: 'white',
                                width: '1.8rem',
                                height: '1.8rem',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '700',
                                boxShadow: '0 0 6px rgba(0,0,0,0.2)',
                            }}
                        />
                    )}
                    <OverlayPanel ref={op} showCloseIcon dismissable>
                        <div
                            style={{
                                minWidth: '360px',
                                maxWidth: '400px',
                                maxHeight: '420px',
                                overflowY: 'auto',
                                paddingRight: '0.5rem',
                            }}
                        >
                            <h6 className="mb-3 text-primary font-bold flex align-items-center gap-2">
                                <i className="pi pi-exclamation-triangle text-yellow-500"></i>
                                Alertas de Mantenimiento
                            </h6>

                            {alertas.length === 0 ? (
                                <p className="text-center text-500">No hay alertas pendientes 🚘</p>
                            ) : (
                                <>
                                    {/* 🔸 SECCIÓN: Mantenimientos Programados */}
                                    <h6 className="mt-2 mb-2 text-700">Fechas Programadas</h6>
                                    {alertas
                                        .filter((a) => a.tipo === 'fecha')
                                        .map((alerta, i) => {
                                            const vencida = alerta.diasRestantes < 0;
                                            const color = vencida
                                                ? '#ef4444'
                                                : alerta.diasRestantes < 3
                                                    ? '#f59e0b'
                                                    : '#22c55e';
                                            const estado = vencida ? '⏰ VENCIDA' : '🟢 ACTIVA';
                                            const mensaje = `${alerta.vehiculo} (${alerta.placa}) • ${alerta.tipoServicio}`;
                                            const fechaFormateada = alerta.fecha
                                                ? new Date(alerta.fecha).toLocaleDateString('es-HN')
                                                : '-';

                                            return (
                                                <div
                                                    key={`fecha-${i}`}
                                                    className="p-2 mb-2 border-round shadow-1 flex flex-column"
                                                    style={{
                                                        borderLeft: `5px solid ${color}`,
                                                        backgroundColor: '#f9fafb',
                                                    }}
                                                >
                                                    <div className="flex align-items-center justify-content-between">
                                                        <div className="flex align-items-center gap-2">
                                                            <i
                                                                className="pi pi-exclamation-circle"
                                                                style={{ color, fontSize: '1.2rem' }}
                                                            />
                                                            <span
                                                                style={{
                                                                    fontSize: '0.9rem',
                                                                    fontWeight: '500',
                                                                    color: '#374151',
                                                                }}
                                                            >
                                                                {mensaje}
                                                            </span>
                                                        </div>
                                                        <span
                                                            style={{
                                                                fontSize: '0.75rem',
                                                                fontWeight: 'bold',
                                                                color: vencida ? '#dc2626' : '#16a34a',
                                                            }}
                                                        >
                                                            {estado}
                                                        </span>
                                                    </div>
                                                    <small
                                                        className="ml-3 text-500"
                                                        style={{ fontSize: '0.8rem', color: '#6b7280' }}
                                                    >
                                                        {vencida
                                                            ? `Vencida hace ${Math.abs(alerta.diasRestantes)} días`
                                                            : `En ${alerta.diasRestantes} días`}
                                                    </small>
                                                    {/* 🗓️ Mostrar fecha programada */}
                                                    {alerta.fecha && (
                                                        <small
                                                            className="ml-3 text-500"
                                                            style={{
                                                                fontSize: '0.8rem',
                                                                color: '#374151',
                                                                fontStyle: 'italic',
                                                            }}
                                                        >
                                                            Fecha programada: {fechaFormateada}
                                                        </small>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    {/* 🔹 SECCIÓN: Próximos Mantenimientos */}
                                    <h6 className="mt-4 mb-2 text-700">Próximos Mantenimientos</h6>
                                    {alertas
                                        .filter((a) => a.tipo === 'proximo')
                                        .map((alerta, i) => {
                                            let color = '#3b82f6'; // azul base
                                            let fondo = '#eff6ff';
                                            let estado = '🔷 PRÓXIMO';

                                            switch (alerta.prioridad) {
                                                case 'azul-vencido':
                                                    color = '#1e3a8a';
                                                    fondo = '#e0e7ff';
                                                    estado = '🔵 VENCIDO';
                                                    break;
                                                case 'azul-cercano':
                                                    color = '#2563eb';
                                                    fondo = '#dbeafe';
                                                    estado = '🔷 CERCANO';
                                                    break;
                                                case 'azul-normal':
                                                    color = '#3b82f6';
                                                    fondo = '#e0f2fe';
                                                    estado = '🔹 PROGRAMADO';
                                                    break;
                                                case 'azul-lejano':
                                                    color = '#93c5fd';
                                                    fondo = '#f0f9ff';
                                                    estado = '⚪ LEJANO';
                                                    break;
                                                default:
                                                    break;
                                            }

                                            const mensaje = `${alerta.vehiculo} (${alerta.placa}) • ${alerta.tipoServicio}`;
                                            const fechaProx = alerta.proximoMantenimiento
                                                ? new Date(alerta.proximoMantenimiento).toLocaleDateString('es-HN')
                                                : '-';

                                            return (
                                                <div
                                                    key={`prox-${i}`}
                                                    className="p-2 mb-2 border-round shadow-1 flex flex-column"
                                                    style={{
                                                        borderLeft: `5px solid ${color}`,
                                                        backgroundColor: fondo,
                                                    }}
                                                >
                                                    <div className="flex align-items-center justify-content-between">
                                                        <div className="flex align-items-center gap-2">
                                                            <i className="pi pi-wrench" style={{ color, fontSize: '1.2rem' }} />
                                                            <span
                                                                style={{
                                                                    fontSize: '0.9rem',
                                                                    fontWeight: '500',
                                                                    color: '#1e3a8a',
                                                                }}
                                                            >
                                                                {mensaje}
                                                            </span>
                                                        </div>
                                                        <span
                                                            style={{
                                                                fontSize: '0.75rem',
                                                                fontWeight: 'bold',
                                                                color,
                                                            }}
                                                        >
                                                            {estado}
                                                        </span>
                                                    </div>
                                                    <small
                                                        className="ml-3 text-500"
                                                        style={{ fontSize: '0.8rem', color: color }}
                                                    >
                                                        {alerta.diasRestantes < 0
                                                            ? `Vencido hace ${Math.abs(alerta.diasRestantes)} días`
                                                            : `En ${alerta.diasRestantes} días`}
                                                    </small>
                                                    {/* 🗓️ Mostrar próxima fecha */}
                                                    {alerta.proximoMantenimiento && (
                                                        <small
                                                            className="ml-3 text-500"
                                                            style={{
                                                                fontSize: '0.8rem',
                                                                color,
                                                                fontStyle: 'italic',
                                                            }}
                                                        >
                                                            Próximo mantenimiento: {fechaProx}
                                                        </small>
                                                    )}
                                                </div>
                                            );
                                        })}

                                </>
                            )}
                        </div>
                    </OverlayPanel>

                </div>

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

                {/* TABLA DE SERVICIOS */}
                <div className="card mt-4">
                    <div className="mb-3 flex align-items-center justify-content-between">
                        <h4 className="m-0 text-primary font-semibold">Historial de Servicios</h4>
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText
                                value={filtroPlaca}
                                onChange={(e) => setFiltroPlaca(e.target.value)}
                                placeholder="Buscar por placa..."
                                className="p-inputtext-sm w-20rem"
                            />
                        </span>
                    </div>
                    {/* 🔹 Tabla principal */}
                    <DataTable
                        value={serviciosFiltrados}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        className="datatable-responsive shadow-2 border-round"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} servicios"
                        responsiveLayout="scroll"
                        showGridlines
                        emptyMessage="No hay servicios registrados."
                    >
                        <Column
                            field="id"
                            header="ID"
                            sortable
                            headerStyle={{ width: '80px', textAlign: 'center' }}
                            bodyStyle={{ textAlign: 'center' }}
                        />
                        <Column field="vehiculo" header="Vehículo" sortable style={{ minWidth: '10rem' }} />
                        <Column field="placa" header="Placa" sortable style={{ minWidth: '8rem' }} />
                        <Column
                            field="tipoServicio"
                            header="Tipo de Servicio"
                            body={(rowData) => getTipoServicioBadge(rowData.tipoServicio)}
                            sortable
                            style={{ minWidth: '10rem' }}
                        />
                        <Column
                            header="Estado"
                            body={(rowData) => getEstadoBadge(rowData.estado || 'Pendiente')}
                            sortable
                            style={{ minWidth: '9rem' }}
                        />
                        <Column
                            field="fecha"
                            header="Fecha Programada"
                            sortable
                            style={{ minWidth: '9rem' }}
                            body={(r) => (r.fecha ? new Date(r.fecha).toLocaleDateString('es-HN') : '-')}
                        />
                        <Column
                            field="fechaRealizada"
                            header="Fecha Realizada"
                            sortable
                            style={{ minWidth: '9rem' }}
                            body={(r) => (r.fechaRealizada ? new Date(r.fechaRealizada).toLocaleDateString('es-HN') : '-')}
                        />
                        <Column
                            field="proximoMantenimiento"
                            header="Próximo Mantenimiento"
                            sortable
                            style={{ minWidth: '10rem' }}
                            body={(r) => (r.proximoMantenimiento ? new Date(r.proximoMantenimiento).toLocaleDateString('es-HN') : '-')}
                        />
                        <Column
                            field="kilometraje"
                            header="Kilometraje"
                            sortable
                            body={(r) => `${r.kilometraje?.toLocaleString() || 0} km`}
                            style={{ minWidth: '8rem' }}
                        />
                        <Column field="taller" header="Taller" sortable style={{ minWidth: '10rem' }} />
                        <Column
                            field="costo"
                            header="Costo (L)"
                            body={(r) =>
                                r.costo?.toLocaleString('es-HN', {
                                    style: 'currency',
                                    currency: 'HNL',
                                    minimumFractionDigits: 2,
                                })
                            }
                            sortable
                            style={{ minWidth: '8rem' }}
                        />
                        <Column
                            header="Acciones"
                            body={(rowData) => (
                                <div className="flex gap-2 justify-content-center">
                                    <Button
                                        icon="pi pi-eye"
                                        rounded
                                        text
                                        severity="info"
                                        tooltip="Ver detalle"
                                        onClick={() => verDetalleServicio(rowData)}
                                    />
                                    <Button
                                        icon="pi pi-pencil"
                                        rounded
                                        text
                                        severity="warning"
                                        tooltip="Editar"
                                        onClick={() => editServicio(rowData)}
                                    />
                                    <Button
                                        icon="pi pi-trash"
                                        rounded
                                        text
                                        severity="danger"
                                        tooltip="Eliminar"
                                        onClick={() => deleteServicio(rowData)}
                                    />
                                </div>
                            )}
                            style={{ width: '8rem' }}
                        />
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

                    {servicio.id ? (
                        // 🔒 Modo edición: solo lectura
                        <InputText
                            id="vehiculo"
                            value={servicio.vehiculo}
                            className="w-full"
                            disabled
                            style={{
                                backgroundColor: '#f9fafb',
                                color: '#374151',
                                fontWeight: '500',
                            }}
                        />
                    ) : (
                        // 🆕 Modo creación: dropdown activo
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
                    )}
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

                {/* 📅 Fecha Realizada (solo visible al editar) */}
                {servicio.id && (
                    <div className="field">
                        <label htmlFor="fechaRealizada">Fecha Realizada</label>
                        <Calendar
                            id="fechaRealizada"
                            value={servicio.fechaRealizada}
                            onChange={(e) => setServicio({ ...servicio, fechaRealizada: e.value })}
                            dateFormat="yy-mm-dd"
                            showIcon
                            className="w-full"
                            placeholder="Selecciona la fecha de realización"
                        />
                    </div>
                )}


                {/* 📅 Próximo Mantenimiento (obligatorio y > fecha programada) */}
                <div className="field">
                    <label htmlFor="proximoMantenimiento">Próximo Mantenimiento</label>
                    <Calendar
                        id="proximoMantenimiento"
                        value={servicio.proximoMantenimiento}
                        dateFormat="yy-mm-dd"
                        showIcon
                        className="w-full"
                        disabled
                    />

                </div>

                {/* 🧭 Kilometraje */}
                <div className="field">
                    <label htmlFor="kilometraje">Kilometraje</label>
                    <InputNumber
                        id="kilometraje"
                        value={servicio.kilometraje}
                        onValueChange={(e) => {
                            const nuevoKm = e.value || 0;
                            let nuevaFechaProx = servicio.proximoMantenimiento;

                            if (servicio.fecha) {
                                const base = new Date(servicio.fecha);

                                // 📅 Lógica automática según kilometraje
                                if (nuevoKm > 5000 && nuevoKm <= 10000) {
                                    base.setDate(base.getDate() + 20); // +20 días
                                } else if (nuevoKm > 10000 && nuevoKm <= 20000) {
                                    base.setDate(base.getDate() + 15); // +15 días
                                } else if (nuevoKm > 20000) {
                                    base.setDate(base.getDate() + 10); // +10 días
                                } else {
                                    base.setDate(base.getDate() + 5); // Por defecto +5 días
                                }

                                nuevaFechaProx = base;
                            }

                            setServicio({
                                ...servicio,
                                kilometraje: nuevoKm,
                                proximoMantenimiento: nuevaFechaProx,
                            });
                        }}
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
                                    {getEstadoBadge(servicioSeleccionado.estado)}
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
                                                    {(() => {
                                                        const costoTotalNum = parseFloat(
                                                            String(vehiculoData.costoTotal || '0').replace(/[^\d.-]/g, '')
                                                        ) || 0;

                                                        return `L.${costoTotalNum
                                                            .toFixed(2)
                                                            .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
                                                    })()}
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
                                                    <p className="m-0"><strong>Estado:</strong> {getEstadoBadge(vehiculoData.ultimoServicio.estado)}</p>
                                                    <p className="m-0"><strong>Fecha:</strong> {formatearFechaHora(vehiculoData.ultimoServicio.fecha)}</p>
                                                    <p className="m-0"><strong>Taller:</strong> {vehiculoData.ultimoServicio.taller}</p>
                                                </div>
                                            </div>
                                            <div className="col-12 md:col-6">
                                                <div
                                                    className="p-3 border-round shadow-1"
                                                    style={{ backgroundColor: '#f0fdf4', border: '1px solid #22c55e' }}
                                                >
                                                    <h6 className="m-0 mb-2" style={{ color: '#166534' }}>Estadísticas</h6>
                                                    <p className="m-0">
                                                        <strong>Total de Servicios:</strong> {vehiculoData.totalServicios}
                                                    </p>
                                                    {(() => {
                                                        // 🔹 Limpieza del valor: quitar letras o caracteres raros
                                                        const costoTotalNum = parseFloat(
                                                            String(vehiculoData.costoTotal || '0').replace(/[^\d.-]/g, '')
                                                        ) || 0;

                                                        const promedio = vehiculoData.totalServicios > 0
                                                            ? costoTotalNum / vehiculoData.totalServicios
                                                            : 0;

                                                        const format = (n: number) =>
                                                            `L.${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

                                                        return (
                                                            <>
                                                                <p className="m-0">
                                                                    <strong>Costo Total:</strong> {format(costoTotalNum)}
                                                                </p>
                                                                <p className="m-0">
                                                                    <strong>Promedio por Servicio:</strong> {format(promedio)}
                                                                </p>
                                                            </>
                                                        );
                                                    })()}
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