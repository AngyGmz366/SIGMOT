// components/EncomiendaModal.tsx
'use client';

import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { classNames } from 'primereact/utils';
import { Encomienda, EncomiendaDialogProps } from '@/types/ventas';



const EncomiendaDialog: React.FC<EncomiendaDialogProps> = ({ 
    visible, 
    onHide, 
    encomienda, 
    setEncomienda, 
    onSave, 
    submitted = false 
}) => {
    
    const estadoOptions = [
        { label: 'Enviado', value: 'enviado' },
        { label: 'En Tránsito', value: 'en_transito' },
        { label: 'Entregado', value: 'entregado' },
        { label: 'Cancelado', value: 'cancelado' }
    ];

    const metodoPagoOptions = [
        { label: 'Efectivo', value: 'efectivo' },
        { label: 'Tarjeta', value: 'tarjeta' },
        { label: 'Transferencia', value: 'transferencia' }
    ];

    const ciudadOptions = [
        { label: 'Tegucigalpa', value: 'Tegucigalpa' },
        { label: 'San Pedro Sula', value: 'San Pedro Sula' },
        { label: 'La Ceiba', value: 'La Ceiba' },
        { label: 'Choluteca', value: 'Choluteca' },
        { label: 'Comayagua', value: 'Comayagua' },
        { label: 'Puerto Cortés', value: 'Puerto Cortés' },
        { label: 'Danlí', value: 'Danlí' },
        { label: 'Juticalpa', value: 'Juticalpa' },
        { label: 'El Progreso', value: 'El Progreso' },
        { label: 'Siguatepeque', value: 'Siguatepeque' }
    ];

    const onInputChange = (field: keyof Encomienda, value: any) => {
        setEncomienda({ ...encomienda, [field]: value });
    };

    const onInputNumberChange = (field: keyof Encomienda, value: number | null) => {
        setEncomienda({ ...encomienda, [field]: value || 0 });
    };

    const calcularTotal = () => {
        const precio = parseFloat(String(encomienda.precio)) || 0;
        const descuento = encomienda.descuento || 0;
        return precio - descuento;
    };

    React.useEffect(() => {
        const total = calcularTotal();
        if (total !== (encomienda.total || 0)) {
            setEncomienda({ ...encomienda, total });
        }
    }, [encomienda.precio, encomienda.descuento]);

    const dialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button 
                label="Cancelar" 
                icon="pi pi-times" 
                className="p-button-text" 
                onClick={onHide} 
            />
            <Button 
                label="Guardar" 
                icon="pi pi-check" 
                onClick={onSave} 
            />
        </div>
    );

    return (
        <Dialog
            visible={visible}
            style={{ width: '80rem' }}
            breakpoints={{ '960px': '75vw', '641px': '90vw' }}
            header={encomienda.id ? "Editar Encomienda" : "Nueva Encomienda"}
            modal
            className="p-fluid"
            footer={dialogFooter}
            onHide={onHide}
        >
            <div className="grid formgrid">
                {/* Información del Remitente */}
                <div className="col-12">
                    <h5>Información del Remitente</h5>
                </div>
                
                <div className="col-12 md:col-6">
                    <label htmlFor="remitente" className="font-bold">
                        Remitente *
                    </label>
                    <InputText
                        id="remitente"
                        value={encomienda.remitente}
                        onChange={(e) => onInputChange('remitente', e.target.value)}
                        required
                        autoFocus
                        className={classNames({
                            'p-invalid': submitted && !encomienda.remitente
                        })}
                        placeholder="Nombre completo del remitente"
                    />
                    {submitted && !encomienda.remitente && (
                        <small className="p-error">El nombre del remitente es requerido.</small>
                    )}
                </div>

                <div className="col-12 md:col-6">
                    <label htmlFor="cedulaRemitente" className="font-bold">
                        Cédula Remitente
                    </label>
                    <InputText
                        id="cedulaRemitente"
                        value={encomienda.cedulaRemitente || ''}
                        onChange={(e) => onInputChange('cedulaRemitente', e.target.value)}
                        placeholder="Número de identidad del remitente"
                    />
                </div>

                <div className="col-12 md:col-6">
                    <label htmlFor="telefono" className="font-bold">
                        Teléfono Contacto
                    </label>
                    <InputText
                        id="telefono"
                        value={encomienda.telefono || ''}
                        onChange={(e) => onInputChange('telefono', e.target.value)}
                        placeholder="Número de teléfono"
                    />
                </div>

                <div className="col-12 md:col-6">
                    <label htmlFor="origen" className="font-bold">
                        Ciudad de Origen *
                    </label>
                    <Dropdown
                        id="origen"
                        value={encomienda.origen}
                        options={ciudadOptions}
                        onChange={(e) => onInputChange('origen', e.value)}
                        placeholder="Seleccionar origen"
                        filter
                        className={classNames({
                            'p-invalid': submitted && !encomienda.origen
                        })}
                    />
                    {submitted && !encomienda.origen && (
                        <small className="p-error">La ciudad de origen es requerida.</small>
                    )}
                </div>

                {/* Información del Destinatario */}
                <div className="col-12 mt-4">
                    <h5>Información del Destinatario</h5>
                </div>

                <div className="col-12 md:col-6">
                    <label htmlFor="destinatario" className="font-bold">
                        Destinatario *
                    </label>
                    <InputText
                        id="destinatario"
                        value={encomienda.destinatario}
                        onChange={(e) => onInputChange('destinatario', e.target.value)}
                        required
                        className={classNames({
                            'p-invalid': submitted && !encomienda.destinatario
                        })}
                        placeholder="Nombre completo del destinatario"
                    />
                    {submitted && !encomienda.destinatario && (
                        <small className="p-error">El nombre del destinatario es requerido.</small>
                    )}
                </div>

                <div className="col-12 md:col-6">
                    <label htmlFor="cedulaDestinatario" className="font-bold">
                        Cédula Destinatario
                    </label>
                    <InputText
                        id="cedulaDestinatario"
                        value={encomienda.cedulaDestinatario || ''}
                        onChange={(e) => onInputChange('cedulaDestinatario', e.target.value)}
                        placeholder="Número de identidad del destinatario"
                    />
                </div>

                <div className="col-12 md:col-6">
                    <label htmlFor="destino" className="font-bold">
                        Ciudad de Destino *
                    </label>
                    <Dropdown
                        id="destino"
                        value={encomienda.destino}
                        options={ciudadOptions}
                        onChange={(e) => onInputChange('destino', e.value)}
                        placeholder="Seleccionar destino"
                        filter
                        className={classNames({
                            'p-invalid': submitted && !encomienda.destino
                        })}
                    />
                    {submitted && !encomienda.destino && (
                        <small className="p-error">La ciudad de destino es requerida.</small>
                    )}
                </div>

                <div className="col-12 md:col-6">
                    <label htmlFor="fecha" className="font-bold">
                        Fecha de Envío *
                    </label>
                    <Calendar
                        id="fecha"
                        value={encomienda.fecha ? new Date(encomienda.fecha) : null}
                        onChange={(e) => onInputChange('fecha', e.value?.toISOString().split('T')[0] || '')}
                        dateFormat="dd/mm/yy"
                        placeholder="Seleccionar fecha"
                        showIcon
                        className={classNames({
                            'p-invalid': submitted && !encomienda.fecha
                        })}
                    />
                    {submitted && !encomienda.fecha && (
                        <small className="p-error">La fecha de envío es requerida.</small>
                    )}
                </div>

                {/* Información del Paquete */}
                <div className="col-12 mt-4">
                    <h5>Información del Paquete</h5>
                </div>

                <div className="col-12">
                    <label htmlFor="descripcion" className="font-bold">
                        Descripción del Contenido *
                    </label>
                    <InputTextarea
                        id="descripcion"
                        value={encomienda.descripcion}
                        onChange={(e) => onInputChange('descripcion', e.target.value)}
                        rows={3}
                        cols={30}
                        placeholder="Describa el contenido del paquete..."
                        className={classNames({
                            'p-invalid': submitted && !encomienda.descripcion
                        })}
                    />
                    {submitted && !encomienda.descripcion && (
                        <small className="p-error">La descripción del contenido es requerida.</small>
                    )}
                </div>

                <div className="col-12 md:col-4">
                    <label htmlFor="peso" className="font-bold">
                        Peso (kg) *
                    </label>
                    <InputNumber
                        id="peso"
                        value={encomienda.peso}
                        onValueChange={(e) => onInputNumberChange('peso', e.value ?? 0)}
                        mode="decimal"
                        minFractionDigits={2}
                        maxFractionDigits={2}
                        suffix=" kg"
                        placeholder="0.00"
                        className={classNames({
                            'p-invalid': submitted && (!encomienda.peso || encomienda.peso <= 0)
                        })}
                    />
                    {submitted && (!encomienda.peso || encomienda.peso <= 0) && (
                        <small className="p-error">El peso debe ser mayor a 0.</small>
                    )}
                </div>

                {/* Información de Pago */}
                <div className="col-12 mt-4">
                    <h5>Información de Pago</h5>
                </div>

                <div className="col-12 md:col-4">
                    <label htmlFor="precio" className="font-bold">
                        Precio *
                    </label>
                    <InputNumber
                        id="precio"
                        value={parseFloat(String(encomienda.precio)) || 0}
                        onValueChange={(e) => onInputNumberChange('precio', e.value ?? 0)}
                        mode="currency"
                        currency="HNL"
                        locale="es-HN"
                        placeholder="0.00"
                        className={classNames({
                            'p-invalid': submitted && (!encomienda.precio || parseFloat(String(encomienda.precio)) <= 0)
                        })}
                    />
                    {submitted && (!encomienda.precio || parseFloat(String(encomienda.precio)) <= 0) && (
                        <small className="p-error">El precio debe ser mayor a 0.</small>
                    )}
                </div>

                <div className="col-12 md:col-4">
                    <label htmlFor="descuento" className="font-bold">
                        Descuento
                    </label>
                    <InputNumber
                        id="descuento"
                        value={encomienda.descuento || 0}
                        onValueChange={(e) => onInputNumberChange('descuento', e.value ?? 0)}
                        mode="currency"
                        currency="HNL"
                        locale="es-HN"
                        placeholder="0.00"
                    />
                </div>

                <div className="col-12 md:col-4">
                    <label htmlFor="total" className="font-bold">
                        Total
                    </label>
                    <InputNumber
                        id="total"
                        value={calcularTotal()}
                        mode="currency"
                        currency="HNL"
                        locale="es-HN"
                        disabled
                        className="p-inputtext-lg font-bold text-green-600"
                    />
                </div>

                <div className="col-12 md:col-6">
                    <label htmlFor="metodoPago" className="font-bold">
                        Método de Pago
                    </label>
                    <Dropdown
                        id="metodoPago"
                        value={encomienda.metodoPago || 'efectivo'}
                        options={metodoPagoOptions}
                        onChange={(e) => onInputChange('metodoPago', e.value)}
                        placeholder="Seleccionar método"
                    />
                </div>

                <div className="col-12 md:col-6">
                    <label htmlFor="estado" className="font-bold">
                        Estado del Envío
                    </label>
                    <Dropdown
                        id="estado"
                        value={encomienda.estado || 'enviado'}
                        options={estadoOptions}
                        onChange={(e) => onInputChange('estado', e.value)}
                        placeholder="Seleccionar estado"
                    />
                </div>

            </div>
        </Dialog>
    );
};

export default EncomiendaDialog;