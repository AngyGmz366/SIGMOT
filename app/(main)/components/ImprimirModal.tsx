'use client';

import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Boleto, Encomienda, VentaItem } from '@/types/ventas';

interface ImprimirModalProps {
    visible: boolean;
    onHide: () => void;
    item: VentaItem | null;
    onConfirm: () => void;
}

const ImprimirModal: React.FC<ImprimirModalProps> = ({ visible, onHide, item, onConfirm }) => {
    if (!item) return null;

    const esBoleto = item.tipoVenta !== 'encomienda';

    const formatFechaHora = (fecha: string, hora?: string) => {
        if (!fecha) return '';
        const [year, month, day] = fecha.split('-');
        const formattedDate = `${day}/${month}/${year}`;
        
        if (hora) {
            return `${formattedDate} ${hora}`;
        }
        return formattedDate;
    };

    return (
        <Dialog
            visible={visible}
            onHide={onHide}
            header={`Vista previa de impresión - ${esBoleto ? 'Boleto' : 'Encomienda'}`}
            modal
            style={{ width: '40rem' }}
            footer={
                <div className="flex justify-content-end gap-2">
                    <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onHide} />
                    <Button label="Imprimir" icon="pi pi-print" severity="success" onClick={onConfirm} />
                </div>
            }
        >
            <div className="border-1 surface-border border-round p-3" style={{ fontFamily: 'monospace' }}>
                {esBoleto ? (
                    <>
                        <div className="text-center font-bold text-xl mb-2">NO VÁLIDO PARA REALIZAR VIAJE</div>
                        <div className="text-center mb-3">SEÑOR PASAJERO:</div>
                        <div className="text-center mb-3" style={{ fontSize: '0.9rem' }}>
                            PARA SOLICITAR SU BOLETO, DEBE PRESENTAR ESTE COMPROBANTE EN CUALQUIERA DE NUESTRAS 
                            VENTANILLAS O TÓTEMES HABILITADOS HASTA 10 MINUTOS ANTES DE INICIAR EL SERVICIO.
                        </div>
                        
                        <table className="w-full mb-3" style={{ borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #ddd' }}>
                                    <th className="text-left p-1">Servicio</th>
                                    <th className="text-left p-1">Tipo</th>
                                    <th className="text-left p-1">Fecha/Hora</th>
                                    <th className="text-left p-1">Origen</th>
                                    <th className="text-left p-1">Destino</th>
                                    <th className="text-left p-1">Asiento</th>
                                    <th className="text-left p-1">R</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-1">{(item as Boleto).autobus || 'N/A'}</td>
                                    <td className="p-1">IDA</td>
                                    <td className="p-1">{formatFechaHora(item.fecha, (item as Boleto).horaSalida)}</td>
                                    <td className="p-1">TERMINAL PRINCIPAL</td>
                                    <td className="p-1">{item.destino}</td>
                                    <td className="p-1">{(item as Boleto).asiento || 'N/A'}</td>
                                    <td className="p-1">EJEC</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <table className="w-full mb-3" style={{ borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #ddd' }}>
                                    <th className="text-left p-1">Tipo Cliente</th>
                                    <th className="text-left p-1">Tarifa Normal</th>
                                    <th className="text-left p-1">Descuento</th>
                                    <th className="text-left p-1">Total a Pagar</th>
                                    <th className="text-left p-1">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-1">PULLMAN PASS</td>
                                    <td className="p-1">${Number(item.precio).toLocaleString('es-HN')}</td>
                                    <td className="p-1">${(item.descuento || 0).toLocaleString('es-HN')}</td>
                                    <td className="p-1">${(item.total || 0).toLocaleString('es-HN')}</td>
                                    <td className="p-1">{formatFechaHora(item.fecha)}</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <div className="border-top-1 surface-border pt-2 mt-3" style={{ fontSize: '0.9rem' }}>
                            <div className="grid">
                                <div className="col-6">
                                    <div className="font-bold">Texto Social:</div>
                                    <div>{(item as Boleto).telefono || 'N/A'}</div>
                                </div>
                                <div className="col-6">
                                    <div className="font-bold">Manuten Social:</div>
                                    <div>{item.tipoVenta === 'boleto' ? (item as Boleto).cliente : (item as Encomienda).remitente}</div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-center font-bold text-xl mb-2">COMPROBANTE DE ENCOMIENDA</div>
                        <div className="grid mb-3">
                            <div className="col-6">
                                <div className="font-bold">Remitente:</div>
                                <div>{(item as Encomienda).remitente}</div>
                                <div className="font-bold mt-2">Cédula:</div>
                                <div>{(item as Encomienda).cedulaRemitente || 'N/A'}</div>
                            </div>
                            <div className="col-6">
                                <div className="font-bold">Destinatario:</div>
                                <div>{(item as Encomienda).destinatario}</div>
                                <div className="font-bold mt-2">Cédula:</div>
                                <div>{(item as Encomienda).cedulaDestinatario || 'N/A'}</div>
                            </div>
                        </div>
                        <div className="grid mb-3">
                            <div className="col-6">
                                <div className="font-bold">Origen:</div>
                                <div>{(item as Encomienda).origen}</div>
                            </div>
                            <div className="col-6">
                                <div className="font-bold">Destino:</div>
                                <div>{item.destino}</div>
                            </div>
                        </div>
                        <div className="grid mb-3">
                            <div className="col-6">
                                <div className="font-bold">Fecha:</div>
                                <div>{formatFechaHora(item.fecha)}</div>
                            </div>
                            <div className="col-6">
                                <div className="font-bold">Peso:</div>
                                <div>{(item as Encomienda).peso} kg</div>
                            </div>
                        </div>
                        <div className="mb-3">
                            <div className="font-bold">Descripción:</div>
                            <div>{(item as Encomienda).descripcion || 'N/A'}</div>
                        </div>
                        <div className="border-top-1 surface-border pt-3 mt-2">
                            <div className="grid">
                                <div className="col-4">
                                    <div className="font-bold">Precio:</div>
                                    <div>${Number(item.precio).toLocaleString('es-HN')}</div>
                                </div>
                                <div className="col-4">
                                    <div className="font-bold">Descuento:</div>
                                    <div>${(item.descuento || 0).toLocaleString('es-HN')}</div>
                                </div>
                                <div className="col-4">
                                    <div className="font-bold">Total:</div>
                                    <div>${(item.total || 0).toLocaleString('es-HN')}</div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Dialog>
    );
};

export default ImprimirModal;