/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tooltip } from 'primereact/tooltip';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Badge } from 'primereact/badge';
import { OverlayPanel } from 'primereact/overlaypanel';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar } from 'primereact/calendar';
import { addLocale } from 'primereact/api';
import esLocale from '@fullcalendar/core/locales/es';

import { listarUnidades } from '@/modulos/unidades/servicios/unidades.servicios';
import { obtenerTiposMantenimiento } from '@/modulos/mantenimientos/servicios/tipoMantenimiento.servicios';
import { obtenerEstadosMantenimiento } from '@/modulos/mantenimientos/servicios/estadoMantenimiento.servicios';
import {
    listarMantenimientos, crearMantenimiento, actualizarMantenimiento, eliminarMantenimiento
} from '@/modulos/mantenimientos/servicios/mantenimientos.servicios';

// 🎨 Importar estilos
import '@/styles/layout/_mantenimiento.scss';

// Interfaces
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

interface Unidad {
    Id_Unidad_PK: number;
    Numero_Placa: string;
    Marca_Unidad: string;
    Modelo: string;
    Año: number;
}

const MantenimientoTransporte = () => {
    const emptyServicio = {
        id: null, vehiculo: '', placa: '', tipoServicio: '', fecha: null,
        fechaRealizada: null, proximoMantenimiento: null, kilometraje: 0,
        estado: '', descripcion: '', costo: 0, taller: '', repuestos: '',
    };

    // Estados
    const [servicios, setServicios] = useState<any[]>([]);
    const [servicio, setServicio] = useState<any>(emptyServicio);
    const [servicioDialog, setServicioDialog] = useState(false);
    const [detalleDialog, setDetalleDialog] = useState(false);
    const [detalleServicioDialog, setDetalleServicioDialog] = useState(false);
    const [servicioSeleccionado, setServicioSeleccionado] = useState<any>(null);
    const [submitted, setSubmitted] = useState(false);
    const [alertas, setAlertas] = useState<any[]>([]);
    const [vehiculosDetalle, setVehiculosDetalle] = useState<any[]>([]);
    const [tiposMantenimiento, setTiposMantenimiento] = useState<TipoMantenimiento[]>([]);
    const [estadosMantenimiento, setEstadosMantenimiento] = useState<EstadoMantenimiento[]>([]);
    const [resumen, setResumen] = useState({ verde: 0, amarillo: 0, rojo: 0 });
    const [unidades, setUnidades] = useState<Unidad[]>([]);
    const [filtroPlaca, setFiltroPlaca] = useState('');

    const toast = useRef<Toast>(null);
    const op = useRef<OverlayPanel>(null);

    // Cargar mantenimientos
    useEffect(() => {
        async function cargarMantenimientos() {
            try {
                const data = await listarMantenimientos();
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

    // Cargar catálogos
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

    // Cargar unidades
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

    // Configurar locale del calendario español
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

    // Calcular alertas
    useEffect(() => {
        const hoy = new Date();
        const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        const nuevasAlertas: any[] = [];
        const nuevoResumen = { verde: 0, amarillo: 0, rojo: 0 };

        servicios.forEach((s) => {
            // FECHAS PROGRAMADAS
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

            // PRÓXIMO MANTENIMIENTO
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
        setResumen(nuevoResumen);
    }, [servicios]);

    // Funciones CRUD
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

            if (!acc[key].ultimoServicio || new Date(servicio.fecha) > new Date(acc[key].ultimoServicio.fecha)) {
                acc[key].ultimoServicio = servicio;
            }
            return acc;
        }, {});

        const vehiculosArray = Object.values(vehiculosAgrupados).map((vehiculo: any) => ({
            ...vehiculo,
            servicios: vehiculo.servicios.sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        }));

        setVehiculosDetalle(vehiculosArray);
        setDetalleDialog(true);
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

    const saveServicio = async () => {
        setSubmitted(true);
        try {
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

            if (servicio.estado === 'Cancelado') {
                setAlertas((prevAlertas) =>
                    prevAlertas.filter((alerta) => alerta.tipo !== 'fecha')
                );
            }

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
                await actualizarMantenimiento(servicio.id, payload);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Actualizado',
                    detail: 'Mantenimiento actualizado correctamente',
                    life: 3000,
                });
            } else {
                await crearMantenimiento(payload);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Guardado',
                    detail: 'Mantenimiento registrado correctamente',
                    life: 3000,
                });
            }

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

    // Funciones auxiliares
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

    const serviciosFiltrados = servicios.filter(
        (s) => (s.placa?.toLowerCase() || '').includes(filtroPlaca.toLowerCase())
    );

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

    const accionesTemplate = (rowData: any) => (
        <div className="flex gap-2">
            <Button icon="pi pi-eye" rounded text aria-label="Ver Detalle" className="btn-ver" onClick={() => verDetalleServicio(rowData)} />
            <Button icon="pi pi-pencil" rounded text aria-label="Editar" className="btn-editar" onClick={() => editServicio(rowData)} />
            <Button icon="pi pi-trash" className="btn-eliminar" rounded text severity="danger" aria-label="Eliminar" onClick={() => deleteServicio(rowData)} />
        </div>
    );

    const servicioDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveServicio} />
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
                            <Button label="Nuevo Servicio" icon="pi pi-plus" severity="success" onClick={openNew} />
                            <Button label="Ver Detalle por Vehículo" icon="pi pi-eye" severity="info" onClick={verDetalle} />
                        </div>
                    }
                />

                {/* Botón de notificaciones */}
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

                    {alertas.length > 0 && (
                        <Badge
                            value={alertas.length}
                            severity="danger"
                            className="badge-contador"
                        />
                    )}

                    <OverlayPanel ref={op} showCloseIcon dismissable>
                        <div className="notificaciones-panel">
                            <h6 className="notificacion-header mb-3 text-primary font-bold">
                                <i className="pi pi-exclamation-triangle text-yellow-500"></i>
                                Alertas de Mantenimiento
                            </h6>
                            {alertas.length === 0 ? (
                                <p className="text-center text-500">No hay alertas pendientes 🚘</p>
                            ) : (
                                <>
                                    <h6 className="seccion-titulo">Fechas Programadas</h6>
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
                                                    className={`alerta-item fecha ${alerta.prioridad}`}
                                                >
                                                    <div className="alerta-header">
                                                        <div className="alerta-info">
                                                            <i
                                                                className="pi pi-exclamation-circle"
                                                                style={{ color }}
                                                            />
                                                            <span>{mensaje}</span>
                                                        </div>
                                                        <span className="alerta-estado">{estado}</span>
                                                    </div>
                                                    <small className="alerta-detalle">
                                                        {vencida
                                                            ? `Vencida hace ${Math.abs(alerta.diasRestantes)} días`
                                                            : `En ${alerta.diasRestantes} días`}
                                                    </small>
                                                    {alerta.fecha && (
                                                        <small className="alerta-fecha">
                                                            Fecha programada: {fechaFormateada}
                                                        </small>
                                                    )}
                                                </div>
                                            );
                                        })}

                                    <h6 className="seccion-titulo mt-4">Próximos Mantenimientos</h6>
                                    {alertas
                                        .filter((a) => a.tipo === 'proximo')
                                        .map((alerta, i) => {
                                            let color = '#3b82f6';
                                            let estado = '🔷 PRÓXIMO';

                                            switch (alerta.prioridad) {
                                                case 'azul-vencido':
                                                    color = '#1e3a8a';
                                                    estado = '🔵 VENCIDO';
                                                    break;
                                                case 'azul-cercano':
                                                    color = '#2563eb';
                                                    estado = '🔷 CERCANO';
                                                    break;
                                                case 'azul-normal':
                                                    color = '#3b82f6';
                                                    estado = '🔹 PROGRAMADO';
                                                    break;
                                                case 'azul-lejano':
                                                    color = '#93c5fd';
                                                    estado = '⚪ LEJANO';
                                                    break;
                                            }

                                            const mensaje = `${alerta.vehiculo} (${alerta.placa}) • ${alerta.tipoServicio}`;
                                            const fechaProx = alerta.proximoMantenimiento
                                                ? new Date(alerta.proximoMantenimiento).toLocaleDateString('es-HN')
                                                : '-';

                                            return (
                                                <div
                                                    key={`prox-${i}`}
                                                    className={`alerta-item proximo ${alerta.prioridad}`}
                                                >
                                                    <div className="alerta-header">
                                                        <div className="alerta-info">
                                                            <i className="pi pi-wrench" style={{ color }} />
                                                            <span>{mensaje}</span>
                                                        </div>
                                                        <span className="alerta-estado" style={{ color }}>{estado}</span>
                                                    </div>
                                                    <small className="alerta-detalle" style={{ color }}>
                                                        {alerta.diasRestantes < 0
                                                            ? `Vencido hace ${Math.abs(alerta.diasRestantes)} días`
                                                            : `En ${alerta.diasRestantes} días`}
                                                    </small>
                                                    {alerta.proximoMantenimiento && (
                                                        <small className="alerta-fecha" style={{ color }}>
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

                {/* RESUMEN DE MANTENIMIENTOS */}
                <div className="card">
                    <h5>Resumen de Mantenimientos</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <div className="resumen-card verde">
                                <h6 className="m-0 mb-2">
                                    Mantenimientos mayores a 7 días
                                </h6>
                                <p className="text-4xl m-0 font-bold">
                                    {resumen.verde}
                                </p>
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="resumen-card amarillo">
                                <h6 className="m-0 mb-2">
                                    Mantenimientos en 3-7 días
                                </h6>
                                <p className="text-4xl m-0 font-bold">
                                    {resumen.amarillo}
                                </p>
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="resumen-card rojo">
                                <h6 className="m-0 mb-2">
                                    Mantenimientos menores a 3 días
                                </h6>
                                <p className="text-4xl m-0 font-bold">
                                    {resumen.rojo}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLA DE SERVICIOS */}
                <div className="card mt-4">
                    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                        <h4 className="m-0">Historial de Servicios</h4>
                        <div>
                            <span className="block mt-2 md:mt-0 p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText
                                    type="search"
                                    value={filtroPlaca}
                                    onChange={(e) => setFiltroPlaca(e.target.value)}
                                    placeholder="Buscar por placa..."
                                    className="w-full"
                                />
                            </span>
                        </div>
                    </div>

                    <DataTable
                        value={serviciosFiltrados}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        className="datatable-responsive"
                        tableStyle={{ minWidth: '50rem' }}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} servicios"
                        responsiveLayout="scroll"
                        emptyMessage="No hay servicios registrados."
                    >
                        <Column
                            field="id" header="ID" sortable headerStyle={{ width: '80px', textAlign: 'center' }} bodyStyle={{ textAlign: 'center' }}
                        />
                        <Column field="vehiculo" header="Vehículo" sortable style={{ minWidth: '10rem' }} />
                        <Column field="placa" header="Placa" sortable style={{ minWidth: '8rem' }} />
                        <Column
                            field="tipoServicio" header="Tipo de Servicio"
                            body={(rowData) => getTipoServicioBadge(rowData.tipoServicio)} sortable style={{ minWidth: '10rem' }}
                        />
                        <Column
                            header="Estado" body={(rowData) => getEstadoBadge(rowData.estado || 'Pendiente')}
                            sortable style={{ minWidth: '9rem' }}
                        />
                        <Column
                            field="fecha" header="Fecha Programada" sortable style={{ minWidth: '9rem' }}
                            body={(r) => (r.fecha ? new Date(r.fecha).toLocaleDateString('es-HN') : '-')}
                        />
                        <Column
                            field="fechaRealizada" header="Fecha Realizada" sortable style={{ minWidth: '9rem' }}
                            body={(r) => (r.fechaRealizada ? new Date(r.fechaRealizada).toLocaleDateString('es-HN') : '-')}
                        />
                        <Column
                            field="proximoMantenimiento" header="Próximo Mantenimiento" sortable style={{ minWidth: '10rem' }}
                            body={(r) => (r.proximoMantenimiento ? new Date(r.proximoMantenimiento).toLocaleDateString('es-HN') : '-')}
                        />
                        <Column
                            field="kilometraje" header="Kilometraje" sortable body={(r) => `${r.kilometraje?.toLocaleString() || 0} km`}
                            style={{ minWidth: '8rem' }}
                        />
                        <Column field="taller" header="Taller" sortable style={{ minWidth: '10rem' }} />
                        <Column
                            field="costo" header="Costo (L)"
                            body={(r) =>
                                r.costo?.toLocaleString('es-HN', {
                                    style: 'currency',
                                    currency: 'HNL',
                                    minimumFractionDigits: 2,
                                })
                            }
                            sortable style={{ minWidth: '8rem' }}
                        />
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
                            extendedProps: s
                        }))}
                        eventDidMount={(info: any) => {
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
                <div className="field">
                    <label htmlFor="vehiculo">Unidad / Vehículo</label>
                    {servicio.id ? (
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

                                if (nuevoKm > 5000 && nuevoKm <= 10000) {
                                    base.setDate(base.getDate() + 20);
                                } else if (nuevoKm > 10000 && nuevoKm <= 20000) {
                                    base.setDate(base.getDate() + 15);
                                } else if (nuevoKm > 20000) {
                                    base.setDate(base.getDate() + 10);
                                } else {
                                    base.setDate(base.getDate() + 5);
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

                <div className="field">
                    <label htmlFor="taller">Taller</label>
                    <InputText
                        id="taller"
                        value={servicio.taller}
                        onChange={(e) => setServicio({ ...servicio, taller: e.target.value })}
                        placeholder="Ej. Taller El Motorista"
                    />
                </div>

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
                                    <div className="vehiculo-header-info">
                                        <div className="vehiculo-datos">
                                            <i className="pi pi-car text-2xl"></i>
                                            <div>
                                                <h6 className="m-0 text-lg font-bold">{vehiculoData.vehiculo}</h6>
                                                <p className="m-0 text-sm text-500">Placa: {vehiculoData.placa}</p>
                                            </div>
                                        </div>
                                        <div className="vehiculo-estadisticas">
                                            <div className="stat-item">
                                                <Badge value={vehiculoData.totalServicios} severity="info" />
                                                <p className="m-0 text-xs text-500 mt-1">Servicios</p>
                                            </div>
                                            <div className="stat-item">
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
                                    <div className="col-12 mb-4">
                                        <div className="grid">
                                            <div className="col-12 md:col-6">
                                                <div className="info-card ultimo-servicio">
                                                    <h6>Último Servicio</h6>
                                                    <p className="m-0"><strong>Tipo:</strong> {getTipoServicioBadge(vehiculoData.ultimoServicio.tipoServicio)}</p>
                                                    <p className="m-0"><strong>Estado:</strong> {getEstadoBadge(vehiculoData.ultimoServicio.estado)}</p>
                                                    <p className="m-0"><strong>Fecha:</strong> {formatearFechaHora(vehiculoData.ultimoServicio.fecha)}</p>
                                                    <p className="m-0"><strong>Taller:</strong> {vehiculoData.ultimoServicio.taller}</p>
                                                </div>
                                            </div>
                                            <div className="col-12 md:col-6">
                                                <div className="info-card estadisticas">
                                                    <h6>Estadísticas</h6>
                                                    <p className="m-0">
                                                        <strong>Total de Servicios:</strong> {vehiculoData.totalServicios}
                                                    </p>
                                                    {(() => {
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
                                            <Column field="tipoServicio" header="Tipo" body={(rowData) => getTipoServicioBadge(rowData.tipoServicio)} style={{ width: '120px' }} />
                                            <Column field="estado" header="Estado" body={(rowData) => getEstadoBadge(rowData.estado || 'Pendiente')} style={{ width: '100px' }} />
                                            <Column header="Fecha" body={(rowData) => formatearFechaHora(rowData.fecha)} style={{ width: '150px' }} />
                                            <Column field="kilometraje" header="Km" style={{ width: '80px' }} />
                                            <Column field="taller" header="Taller" style={{ width: '120px' }} />
                                            <Column
                                                field="descripcion"
                                                header="Descripción"
                                                body={(rowData) => (
                                                    <div className="text-ellipsis" style={{ maxWidth: '200px' }}>
                                                        {rowData.descripcion || '-'}
                                                    </div>
                                                )}
                                            />
                                            <Column
                                                field="repuestos"
                                                header="Repuestos"
                                                body={(rowData) => (
                                                    <div className="text-ellipsis" style={{ maxWidth: '150px' }}>
                                                        {rowData.repuestos || '-'}
                                                    </div>
                                                )}
                                            />
                                            <Column field="costo" header="Costo" body={(rowData) => rowData.costo?.toLocaleString('es-HN', { style: 'currency', currency: 'HNL', minimumFractionDigits: 2 })} style={{ width: '100px' }} />
                                            <Column
                                                body={(rowData) => (
                                                    <div className="flex gap-1">
                                                        <Button icon="pi pi-pencil" rounded text size="small" severity="warning" aria-label="Editar" onClick={() => editServicio(rowData)} />
                                                        <Button icon="pi pi-trash" rounded text size="small" severity="danger" aria-label="Eliminar" onClick={() => deleteServicio(rowData)} />
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