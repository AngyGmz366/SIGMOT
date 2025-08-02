/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
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

const MantenimientoTransporte = () => {
    const emptyServicio = {
        id: '',
        vehiculo: '',
        placa: '',
        tipoServicio: '',
        fecha: '',
        kilometraje: 0,
        taller: '',
        descripcion: '',
        repuestos: '',
        costo: 0,
        documentos: null
    };

    const [servicios, setServicios] = useState<any[]>([]);
    const [servicio, setServicio] = useState<any>(emptyServicio);
    const [servicioDialog, setServicioDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [alertas, setAlertas] = useState<any[]>([]);
    const toast = useRef<Toast>(null);

    const [resumen, setResumen] = useState({ verde: 0, amarillo: 0, rojo: 0 });

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
        const nuevasAlertas: any[] = [];
        const nuevoResumen = { verde: 0, amarillo: 0, rojo: 0 };

        servicios.forEach((s) => {
            const fechaServicio = new Date(s.fecha);
            const diferenciaDias = Math.floor((fechaServicio.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

            // Actualizar resumen sin limitar por mes actual
            if (diferenciaDias > 7) {
                nuevoResumen.verde++;
                // Agregar alerta verde (menos urgente) para mantenimientos futuros lejanos
                nuevasAlertas.push({ ...s, prioridad: 'lejos', tipo: 'fecha' });
            } else if (diferenciaDias >= 3 && diferenciaDias <= 7) {
                nuevoResumen.amarillo++;
                nuevasAlertas.push({ ...s, prioridad: 'proxima', tipo: 'fecha' });
            } else if (diferenciaDias >= 0 && diferenciaDias < 3) {
                nuevoResumen.rojo++;
                nuevasAlertas.push({ ...s, prioridad: 'urgente', tipo: 'fecha' });
            } else if (diferenciaDias < 0) {
                // Fecha pasada, mantenimiento vencido
                nuevasAlertas.push({ ...s, prioridad: 'vencido', tipo: 'fecha' });
            }

            // Kilometraje para alerta (suponiendo que <= 200 km restantes)
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

    const createId = () => {
        return Math.random().toString(36).substr(2, 9);
    };

    const editServicio = (rowData: any) => {
        setServicio({ ...rowData });
        setServicioDialog(true);
    };

    const deleteServicio = (rowData: any) => {
        const updatedServicios = servicios.filter((s) => s.id !== rowData.id);
        setServicios(updatedServicios);

        toast.current?.show({
            severity: 'success',
            summary: 'Eliminado',
            detail: 'Servicio eliminado correctamente',
            life: 3000
        });
    };

    const accionesTemplate = (rowData: any) => (
        <div className="flex gap-2">
            <Button icon="pi pi-pencil" rounded text severity="warning" aria-label="Editar" onClick={() => editServicio(rowData)} />
            <Button icon="pi pi-trash" rounded text severity="danger" aria-label="Eliminar" onClick={() => deleteServicio(rowData)} />
        </div>
    );

    const saveServicio = () => {
        setSubmitted(true);

        if (servicio.vehiculo.trim()) {
            let _servicios = [...servicios];
            let _servicio = { ...servicio };

            if (_servicio.id) {
                const index = _servicios.findIndex((s) => s.id === _servicio.id);
                _servicios[index] = _servicio;

                toast.current?.show({
                    severity: 'success',
                    summary: 'Actualizado',
                    detail: 'Servicio actualizado correctamente',
                    life: 3000
                });
            } else {
                _servicio.id = createId();
                _servicios.push(_servicio);

                toast.current?.show({
                    severity: 'success',
                    summary: 'Guardado',
                    detail: 'Servicio registrado correctamente',
                    life: 3000
                });
            }

            setServicios(_servicios);
            setServicioDialog(false);
            setServicio(emptyServicio);
        }
    };

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


    return (
        <div className="grid">
            <Toast ref={toast} />

            <div className="col-12">
                <Toolbar className="mb-4" left={<Button label="Nuevo Servicio" icon="pi pi-plus" onClick={openNew} />} />

                <div className="card">
                    <h5>Resumen de Mantenimientos</h5>
                    <div className="grid">
                        <div className="col md:col-4">
                            <div className="p-3 rounded-lg bg-green-100 shadow-md">
                                <h5 className="text-green-700">Mantenimientos mayores a 7 días</h5>
                                <p className="text-3xl">{resumen.verde}</p>
                            </div>
                        </div>
                        <div className="col md:col-4">
                            <div className="p-3 rounded-lg bg-yellow-100 shadow-md">
                                <h5 className="text-yellow-700">Mantenimientos en 3-7 días</h5>
                                <p className="text-3xl">{resumen.amarillo}</p>
                            </div>
                        </div>
                        <div className="col md:col-4">
                            <div className="p-3 rounded-lg bg-red-100 shadow-md">
                                <h5 className="text-red-700">Mantenimientos menores a 3 días</h5>
                                <p className="text-3xl">{resumen.rojo}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ALERTAS */}
                <div className="card">
                    <h5>Alertas</h5>
                    {alertas
                        .filter((alerta) => alerta.tipo === 'fecha')
                        .map((alerta, index) => {
                            // Normalizar fechas (sin horas)
                            const fechaServicio = new Date(alerta.fecha);
                            const hoy = new Date();
                            const fechaServicioSinHora = new Date(fechaServicio.getFullYear(), fechaServicio.getMonth(), fechaServicio.getDate());
                            const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

                            const diasRestantes = Math.floor((fechaServicioSinHora.getTime() - hoySinHora.getTime()) / (1000 * 60 * 60 * 24));

                            let bgColor = '';

                            if (diasRestantes < 3) {
                                bgColor = 'bg-red-100 text-red-800';
                            } else if (diasRestantes >= 3 && diasRestantes <= 7) {
                                bgColor = 'bg-yellow-100 text-yellow-800';
                            } else if (diasRestantes > 7) {
                                bgColor = 'bg-green-100 text-green-800';
                            }

                            return (
                                <div key={index} className={`p-3 mb-2 rounded-lg shadow-md ${bgColor}`}>
                                    <p>
                                        ⚠️ El <strong>{alerta.vehiculo}</strong> (<strong>{alerta.placa}</strong>) tiene un <strong>{alerta.tipoServicio}</strong> pendiente para la fecha <strong>{formatearFechaAlerta(alerta.fecha)}</strong>.
                                    </p>
                                </div>
                            );
                        })}
                </div>


                {/* TABLA DE SERVICIOS */}
                <div className="card mt-4">
                    <h5>Historial de Servicios</h5>
                    <DataTable value={servicios} paginator rows={5} showGridlines responsiveLayout="scroll" emptyMessage="No hay servicios registrados.">
                        <Column field="vehiculo" header="Vehículo" />
                        <Column field="placa" header="Placa" />
                        <Column field="tipoServicio" header="Tipo de Servicio" />
                        <Column header="Fecha" body={(rowData) => formatearFechaHora(rowData.fecha)} />
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

                    {/* Tooltip para los eventos */}
                    <Tooltip target=".fc-event" position="top" />

                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        editable={true}
                        locale={esLocale}
                        events={servicios.map((s) => ({
                            id: s.id,
                            title: `${s.tipoServicio} (${s.vehiculo})`,
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
                            Fecha: ${new Date(s.fecha).toLocaleDateString('es-ES')}
                            Kilometraje: ${s.kilometraje}
                            Taller: ${s.taller}
                            Costo: ${s.costo?.toLocaleString('es-HN', { style: 'currency', currency: 'HNL' })}`;

                            info.el.setAttribute('data-pr-tooltip', tooltipContent);
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
            <Dialog visible={servicioDialog} style={{ width: '600px' }} header="Registro de Servicio" modal className="p-fluid" onHide={hideDialog}
                footer={<><Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} /><Button label="Guardar" icon="pi pi-check" text onClick={saveServicio} /></>}>
                <div className="field">
                    <label htmlFor="vehiculo">Vehículo</label>
                    <InputText id="vehiculo" value={servicio.vehiculo} onChange={(e) => onInputChange(e, 'vehiculo')} required autoFocus />
                </div>

                <div className="field">
                    <label htmlFor="placa">Número de Placa</label>
                    <InputText id="placa" value={servicio.placa} onChange={(e) => onInputChange(e, 'placa')} required />
                </div>

                <div className="field">
                    <label>Tipo de Servicio</label>
                    <div className="formgrid grid">
                        <div className="field-radiobutton col-4">
                            <RadioButton inputId="preventivo" name="tipoServicio" value="Preventivo" onChange={onCategoryChange} checked={servicio.tipoServicio === 'Preventivo'} />
                            <label htmlFor="preventivo">Preventivo</label>
                        </div>
                        <div className="field-radiobutton col-4">
                            <RadioButton inputId="correctivo" name="tipoServicio" value="Correctivo" onChange={onCategoryChange} checked={servicio.tipoServicio === 'Correctivo'} />
                            <label htmlFor="correctivo">Correctivo</label>
                        </div>
                        <div className="field-radiobutton col-4">
                            <RadioButton inputId="inspeccion" name="tipoServicio" value="Inspección técnica" onChange={onCategoryChange} checked={servicio.tipoServicio === 'Inspección técnica'} />
                            <label htmlFor="inspeccion">Inspección técnica</label>
                        </div>
                    </div>
                </div>

                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="fecha">Fecha</label>
                        <Calendar
                            id="fecha"
                            value={servicio.fecha ? new Date(servicio.fecha) : null}
                            onChange={(e) => {
                                const val = e.value;
                                let _servicio = { ...servicio };
                                _servicio.fecha = val ? val.toISOString() : '';
                                setServicio(_servicio);
                            }}
                            dateFormat="yy-mm-dd"
                            locale="es"
                            showIcon
                            showTime
                            hourFormat="24"
                            showButtonBar
                        />

                    </div>

                    <div className="field col">
                        <label htmlFor="kilometraje">Kilometraje</label>
                        <InputNumber id="kilometraje" value={servicio.kilometraje} onValueChange={(e) => onInputNumberChange(e, 'kilometraje')} />
                    </div>
                </div>

                <div className="field">
                    <label htmlFor="taller">Taller</label>
                    <InputText id="taller" value={servicio.taller} onChange={(e) => onInputChange(e, 'taller')} />
                </div>

                <div className="field">
                    <label htmlFor="descripcion">Descripción</label>
                    <InputTextarea id="descripcion" value={servicio.descripcion} onChange={(e) => onInputChange(e, 'descripcion')} rows={3} />
                </div>

                <div className="field">
                    <label htmlFor="repuestos">Repuestos</label>
                    <InputTextarea id="repuestos" value={servicio.repuestos} onChange={(e) => onInputChange(e, 'repuestos')} rows={2} />
                </div>

                <div className="field">
                    <label htmlFor="costo">Costo</label>
                    <InputNumber id="costo" value={servicio.costo} onValueChange={(e) => onInputNumberChange(e, 'costo')} mode="currency" currency="HNL" locale="es-HN" />
                </div>

                <div className="field">
                    <label htmlFor="documentos">Documentos Adjuntos</label>
                    <FileUpload mode="basic" name="documentos" accept=".pdf,image/*" maxFileSize={1000000} />
                </div>
            </Dialog>
        </div>
    );
};

export default MantenimientoTransporte;