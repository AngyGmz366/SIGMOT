'use client';

import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { classNames } from 'primereact/utils';
import { Boleto, BoletoDialogProps } from '@/types/ventas';

const BoletoDialog: React.FC<BoletoDialogProps> = ({ 
    visible, 
    onHide, 
    boleto, 
    setBoleto, 
    onSave, 
    submitted = false 
}) => {
    
    const estadoOptions = [
        { label: 'Vendido', value: 'vendido' },
        { label: 'Reservado', value: 'reservado' },
        { label: 'Cancelado', value: 'cancelado' }
    ];

    const metodoPagoOptions = [
        { label: 'Efectivo', value: 'efectivo' },
        { label: 'Tarjeta', value: 'tarjeta' },
        { label: 'Transferencia', value: 'transferencia' }
    ];

    const destinoOptions = [
        { label: 'Tegucigalpa', value: 'Tegucigalpa' },
        { label: 'San Pedro Sula', value: 'San Pedro Sula' },
        { label: 'La Ceiba', value: 'La Ceiba' },
        { label: 'Choluteca', value: 'Choluteca' },
        { label: 'Comayagua', value: 'Comayagua' },
        { label: 'Puerto Cortés', value: 'Puerto Cortés' },
        { label: 'Danlí', value: 'Danlí' },
        { label: 'Juticalpa', value: 'Juticalpa' }
    ];

    const autobusOptions = [
        { label: 'Bus 001', value: 'Bus 001' },
        { label: 'Bus 002', value: 'Bus 002' },
        { label: 'Bus 003', value: 'Bus 003' },
        { label: 'Bus 004', value: 'Bus 004' },
        { label: 'Bus 005', value: 'Bus 005' }
    ];

    const onInputChange = (field: keyof Boleto, value: any) => {
        setBoleto({ ...boleto, [field]: value });
    };

    const onInputNumberChange = (field: keyof Boleto, value: number | null) => {
        setBoleto({ ...boleto, [field]: value || 0 });
    };

    const calcularTotal = () => {
        const precio = parseFloat(String(boleto.precio)) || 0;
        const descuento = boleto.descuento || 0;
        return precio - descuento;
    };

    React.useEffect(() => {
        const total = calcularTotal();
        if (total !== (boleto.total || 0)) {
            setBoleto({ ...boleto, total });
        }
    }, [boleto.precio, boleto.descuento]);

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
            style={{ width: '70rem' }}
            breakpoints={{ '960px': '75vw', '641px': '90vw' }}
            header={boleto.id ? "Editar Boleto" : "Nuevo Boleto"}
            modal
            className="p-fluid"
            footer={dialogFooter}
            onHide={onHide}
        >
            <div className="grid formgrid">
                {/* Información del Cliente */}
                <div className="col-12">
                    <h5>Información del Cliente</h5>
                </div>
                
                <div className="col-12 md:col-6">
                    <label htmlFor="cliente" className="font-bold">
                        Cliente *
                    </label>
                    <InputText
                        id="cliente"
                        value={boleto.cliente}
                        onChange={(e) => onInputChange('cliente', e.target.value)}
                        required
                        autoFocus
                        className={classNames({
                            'p-invalid': submitted && !boleto.cliente
                        })}
                        placeholder="Nombre completo del cliente"
                    />
                    {submitted && !boleto.cliente && (
                        <small className="p-error">El nombre del cliente es requerido.</small>
                    )}
                </div>

                <div className="col-12 md:col-6">
                    <label htmlFor="cedula" className="font-bold">
                        Cédula/Identidad
                    </label>
                    <InputText
                        id="cedula"
                        value={boleto.cedula || ''}
                        onChange={(e) => onInputChange('cedula', e.target.value)}
                        placeholder="Número de identidad"
                    />
                </div>

                <div className="col-12 md:col-6">
                    <label htmlFor="telefono" className="font-bold">
                        Teléfono
                    </label>
                    <InputText
                        id="telefono"
                        value={boleto.telefono || ''}
                        onChange={(e) => onInputChange('telefono', e.target.value)}
                        placeholder="Número de teléfono"
                    />
                </div>

                {/* Información del Viaje */}
                <div className="col-12 mt-4">
                    <h5>Información del Viaje</h5>
                </div>

                <div className="col-12 md:col-6">
                    <label htmlFor="destino" className="font-bold">
                        Destino *
                    </label>
                    <Dropdown
                        id="destino"
                        value={boleto.destino}
                        options={destinoOptions}
                        onChange={(e) => onInputChange('destino', e.value)}
                        placeholder="Seleccionar destino"
                        filter
                        className={classNames({
                            'p-invalid': submitted && !boleto.destino
                        })}
                    />
                    {submitted && !boleto.destino && (
                        <small className="p-error">El destino es requerido.</small>
                    )}
                </div>

                <div className="col-12 md:col-6">
                    <label htmlFor="fecha" className="font-bold">
                        Fecha de Viaje *
                    </label>
                    <Calendar
                        id="fecha"
                        value={boleto.fecha ? new Date(boleto.fecha) : null}
                        onChange={(e) => onInputChange('fecha', e.value?.toISOString().split('T')[0] || '')}
                        dateFormat="dd/mm/yy"
                        placeholder="Seleccionar fecha"
                        showIcon
                        className={classNames({
                            'p-invalid': submitted && !boleto.fecha
                        })}
                    />
                    {submitted && !boleto.fecha && (
                        <small className="p-error">La fecha es requerida.</small>
                    )}
                </div>

                <div className="col-12 md:col-4">
                    <label htmlFor="horaSalida" className="font-bold">
                        Hora de Salida
                    </label>
                    <InputText
                        id="horaSalida"
                        value={boleto.horaSalida || ''}
                        onChange={(e) => onInputChange('horaSalida', e.target.value)}
                        placeholder="HH:MM"
                    />
                </div>

                <div className="col-12 md:col-4">
                    <label htmlFor="autobus" className="font-bold">
                        Autobús
                    </label>
                    <Dropdown
                        id="autobus"
                        value={boleto.autobus}
                        options={autobusOptions}
                        onChange={(e) => onInputChange('autobus', e.value)}
                        placeholder="Seleccionar autobús"
                    />
                </div>

                <div className="col-12 md:col-4">
                    <label htmlFor="asiento" className="font-bold">
                        Asiento
                    </label>
                    <InputText
                        id="asiento"
                        value={boleto.asiento || ''}
                        onChange={(e) => onInputChange('asiento', e.target.value)}
                        placeholder="Ej: A1, B5"
                    />
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
                        value={parseFloat(String(boleto.precio)) || 0}
                        onValueChange={(e) => onInputNumberChange('precio', e.value ?? 0)}
                        mode="currency"
                        currency="HNL"
                        locale="es-HN"
                        placeholder="0.00"
                        className={classNames({
                            'p-invalid': submitted && (!boleto.precio || parseFloat(String(boleto.precio)) <= 0)
                        })}
                    />
                    {submitted && (!boleto.precio || parseFloat(String(boleto.precio)) <= 0) && (
                        <small className="p-error">El precio es requerido y debe ser mayor a 0.</small>
                    )}
                </div>

                <div className="col-12 md:col-4">
                    <label htmlFor="descuento" className="font-bold">
                        Descuento
                    </label>
                    <InputNumber
                        id="descuento"
                        value={boleto.descuento ?? 0}
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
                        value={boleto.metodoPago || 'efectivo'}
                        options={metodoPagoOptions}
                        onChange={(e) => onInputChange('metodoPago', e.value)}
                        placeholder="Seleccionar método"
                    />
                </div>

                <div className="col-12 md:col-6">
                    <label htmlFor="estado" className="font-bold">
                        Estado
                    </label>
                    <Dropdown
                        id="estado"
                        value={boleto.estado || 'vendido'}
                        options={estadoOptions}
                        onChange={(e) => onInputChange('estado', e.value)}
                        placeholder="Seleccionar estado"
                    />
                </div>
            </div>
        </Dialog>
    );
};

export default BoletoDialog;