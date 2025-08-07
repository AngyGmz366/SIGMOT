'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
// Verifica que estos archivos existan en estas ubicaciones
import BoletoDialog from '../../components/BoletoModal';
import EncomiendaDialog from '../../components/EncomiendaModal';
import ImprimirModal from '../../components/ImprimirModal';
import { VentaItem, Boleto, Encomienda } from '@/types/ventas';



export default function VentasPage() {
    const toast = useRef<Toast>(null);
    const [ventaItems, setVentaItems] = useState<VentaItem[]>([]);
    const [boletoDialogVisible, setBoletoDialogVisible] = useState(false);
    const [encomiendaDialogVisible, setEncomiendaDialogVisible] = useState(false);
    const [currentMode, setCurrentMode] = useState<'boleto' | 'encomienda'>('boleto');
    const [selectedItems, setSelectedItems] = useState<VentaItem[] | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [imprimirDialogVisible, setImprimirDialogVisible] = useState(false);
    const [itemParaImprimir, setItemParaImprimir] = useState<VentaItem | null>(null);

    const [boleto, setBoleto] = useState<Boleto>({ 
        id: null, 
        cliente: '', 
        destino: '', 
        fecha: '', 
        precio: 0,
        tipoVenta: 'boleto',
        asiento: '',
        autobus: '',
        horaSalida: '',
        horaLlegada: '',
        telefono: '',
        cedula: '',
        estado: 'vendido',
        metodoPago: 'efectivo',
        descuento: 0,
        total: 0
    });

    const [encomienda, setEncomienda] = useState<Encomienda>({
        id: null,
        remitente: '',
        destinatario: '',
        origen: '',
        destino: '',
        fecha: '',
        descripcion: '',
        peso: 0,
        precio: 0,
        tipoVenta: 'encomienda',
        telefono: '',
        cedulaRemitente: '',
        cedulaDestinatario: '',
        estado: 'enviado',
        metodoPago: 'efectivo',
        descuento: 0,
        total: 0
    });

    useEffect(() => {
        const stored = localStorage.getItem('ventaItems');
        if (stored) setVentaItems(JSON.parse(stored));
    }, []);

    const guardarEnStorage = (data: VentaItem[]) => {
        localStorage.setItem('ventaItems', JSON.stringify(data));
    };

    const filteredItems = ventaItems.filter(item => 
        currentMode === 'boleto' 
            ? (item.tipoVenta === 'boleto' || !item.tipoVenta)
            : item.tipoVenta === 'encomienda'
    );

    const openNew = () => {
        if (currentMode === 'boleto') {
            setBoleto({ 
                id: null, 
                cliente: '', 
                destino: '', 
                fecha: '', 
                precio: 0,
                tipoVenta: 'boleto',
                asiento: '',
                autobus: '',
                horaSalida: '',
                horaLlegada: '',
                telefono: '',
                cedula: '',
                estado: 'vendido',
                metodoPago: 'efectivo',
                descuento: 0,
                total: 0
            });
            setBoletoDialogVisible(true);
        } else {
            setEncomienda({
                id: null,
                remitente: '',
                destinatario: '',
                origen: '',
                destino: '',
                fecha: '',
                descripcion: '',
                peso: 0,
                precio: 0,
                tipoVenta: 'encomienda',
                telefono: '',
                cedulaRemitente: '',
                cedulaDestinatario: '',
                estado: 'enviado',
                metodoPago: 'efectivo',
                descuento: 0,
                total: 0
            });
            setEncomiendaDialogVisible(true);
        }
        setSubmitted(false);
    };


    

    const saveBoleto = () => {
        setSubmitted(true);
        if (boleto.cliente.trim() && boleto.destino.trim()) {
            let _items = [...ventaItems];
            let _boleto = { ...boleto };

            const precio = parseFloat(String(_boleto.precio)) || 0;
            const descuento = _boleto.descuento || 0;
            _boleto.total = precio - descuento;

            if (boleto.id) {
                const index = _items.findIndex((item) => item.id === boleto.id);
                _items[index] = _boleto;
                toast.current?.show({ severity: 'success', summary: 'Actualizado', detail: 'Boleto actualizado', life: 3000 });
            } else {
                _boleto.id = new Date().getTime();
                _items.push(_boleto);
                toast.current?.show({ severity: 'success', summary: 'Creado', detail: 'Boleto registrado', life: 3000 });
            }

            setVentaItems(_items);
            guardarEnStorage(_items);
            setBoletoDialogVisible(false);
        }
    };

    const saveEncomienda = () => {
        setSubmitted(true);
        if (encomienda.remitente.trim() && encomienda.destinatario.trim()) {
            let _items = [...ventaItems];
            let _encomienda = { ...encomienda };

            const precio = parseFloat(String(_encomienda.precio)) || 0;
            const descuento = _encomienda.descuento || 0;
            _encomienda.total = precio - descuento;

            if (encomienda.id) {
                const index = _items.findIndex((item) => item.id === encomienda.id);
                _items[index] = _encomienda;
                toast.current?.show({ severity: 'success', summary: 'Actualizado', detail: 'Encomienda actualizada', life: 3000 });
            } else {
                _encomienda.id = new Date().getTime();
                _items.push(_encomienda);
                toast.current?.show({ severity: 'success', summary: 'Creado', detail: 'Encomienda registrada', life: 3000 });
            }

            setVentaItems(_items);
            guardarEnStorage(_items);
            setEncomiendaDialogVisible(false);
        }
    };

    const editItem = (item: VentaItem) => {
        if (item.tipoVenta === 'encomienda') {
            setEncomienda({ ...item as Encomienda });
            setEncomiendaDialogVisible(true);
        } else {
            setBoleto({ ...item as Boleto });
            setBoletoDialogVisible(true);
        }
    };

    const eliminarSeleccionados = () => {
        if (!selectedItems) return;
        const _items = ventaItems.filter(item => !selectedItems.includes(item));
        setVentaItems(_items);
        guardarEnStorage(_items);
        setSelectedItems(null);
        toast.current?.show({ severity: 'success', summary: 'Eliminados', detail: 'Elementos eliminados', life: 3000 });
    };

    const cambiarModo = (nuevoModo: 'boleto' | 'encomienda') => {
        setCurrentMode(nuevoModo);
        setSelectedItems(null);
        setGlobalFilter('');
    };

    const abrirModalImprimir = (item: VentaItem) => {
        setItemParaImprimir(item);
        setImprimirDialogVisible(true);
    };

    const confirmarImpresion = () => {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        document.body.appendChild(iframe);

        const esBoleto = itemParaImprimir?.tipoVenta !== 'encomienda';
        const formatFechaHora = (fecha: string, hora?: string) => {
            if (!fecha) return '';
            const [year, month, day] = fecha.split('-');
            const formattedDate = `${day}/${month}/${year}`;
            return hora ? `${formattedDate} ${hora}` : formattedDate;
        };

        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Impresión de ${esBoleto ? 'Boleto' : 'Encomienda'}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 10px; font-size: 12px; }
                    .ticket { width: 80mm; margin: 0 auto; }
                    .text-center { text-align: center; }
                    .font-bold { font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; margin: 5px 0; font-size: 11px; }
                    th, td { padding: 3px; border: 1px solid #000; }
                    .border-top { border-top: 1px dashed #000; margin-top: 5px; padding-top: 5px; }
                    .no-border { border: none !important; }
                </style>
            </head>
            <body>
                <div class="ticket">
                    ${esBoleto ? `
                        <div class="text-center font-bold" style="font-size: 14px; margin-bottom: 5px;">NO VÁLIDO PARA REALIZAR VIAJE</div>
                        <div class="text-center" style="margin-bottom: 5px;">SEÑOR PASAJERO:</div>
                        <div class="text-center" style="margin-bottom: 10px; font-size: 10px;">
                            PARA SOLICITAR SU BOLETO, DEBE PRESENTAR ESTE COMPROBANTE EN CUALQUIERA DE NUESTRAS 
                            VENTANILLAS O TÓTEMES HABILITADOS HASTA 10 MINUTOS ANTES DE INICIAR EL SERVICIO.
                        </div>
                        
                        <table>
                            <thead>
                                <tr>
                                    <th>Servicio</th>
                                    <th>Tipo</th>
                                    <th>Fecha/Hora</th>
                                    <th>Origen</th>
                                    <th>Destino</th>
                                    <th>Asiento</th>
                                    <th>R</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>${(itemParaImprimir as Boleto)?.autobus || 'N/A'}</td>
                                    <td>IDA</td>
                                    <td>${formatFechaHora(itemParaImprimir?.fecha || '', (itemParaImprimir as Boleto)?.horaSalida)}</td>
                                    <td>TERMINAL PRINCIPAL</td>
                                    <td>${itemParaImprimir?.destino}</td>
                                    <td>${(itemParaImprimir as Boleto)?.asiento || 'N/A'}</td>
                                    <td>EJEC</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <table>
                            <thead>
                                <tr>
                                    <th>Tipo Cliente</th>
                                    <th>Tarifa Normal</th>
                                    <th>Descuento</th>
                                    <th>Total a Pagar</th>
                                    <th>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>PULLMAN PASS</td>
                                    <td>$${Number(itemParaImprimir?.precio).toLocaleString('es-HN')}</td>
                                    <td>$${(itemParaImprimir?.descuento || 0).toLocaleString('es-HN')}</td>
                                    <td>$${(itemParaImprimir?.total || 0).toLocaleString('es-HN')}</td>
                                    <td>${formatFechaHora(itemParaImprimir?.fecha || '')}</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <div class="border-top">
                            <div style="float: left; width: 50%;">
                                <div class="font-bold">Texto Social:</div>
                                <div>${(itemParaImprimir as Boleto)?.telefono || 'N/A'}</div>
                            </div>
                            <div style="float: right; width: 50%;">
                                <div class="font-bold">Manuten Social:</div>
                                <div>${itemParaImprimir?.tipoVenta === 'boleto' ? (itemParaImprimir as Boleto).cliente : (itemParaImprimir as Encomienda).remitente}</div>
                            </div>
                            <div style="clear: both;"></div>
                        </div>
                    ` : `
                        <div class="text-center font-bold" style="font-size: 14px; margin-bottom: 5px;">COMPROBANTE DE ENCOMIENDA</div>
                        <table class="no-border">
                            <tr>
                                <td class="no-border" style="width: 50%;">
                                    <div class="font-bold">Remitente:</div>
                                    <div>${(itemParaImprimir as Encomienda)?.remitente}</div>
                                    <div class="font-bold">Cédula:</div>
                                    <div>${(itemParaImprimir as Encomienda)?.cedulaRemitente || 'N/A'}</div>
                                </td>
                                <td class="no-border" style="width: 50%;">
                                    <div class="font-bold">Destinatario:</div>
                                    <div>${(itemParaImprimir as Encomienda)?.destinatario}</div>
                                    <div class="font-bold">Cédula:</div>
                                    <div>${(itemParaImprimir as Encomienda)?.cedulaDestinatario || 'N/A'}</div>
                                </td>
                            </tr>
                        </table>
                        <table class="no-border">
                            <tr>
                                <td class="no-border" style="width: 50%;">
                                    <div class="font-bold">Origen:</div>
                                    <div>${(itemParaImprimir as Encomienda)?.origen}</div>
                                </td>
                                <td class="no-border" style="width: 50%;">
                                    <div class="font-bold">Destino:</div>
                                    <div>${itemParaImprimir?.destino}</div>
                                </td>
                            </tr>
                        </table>
                        <table class="no-border">
                            <tr>
                                <td class="no-border" style="width: 50%;">
                                    <div class="font-bold">Fecha:</div>
                                    <div>${formatFechaHora(itemParaImprimir?.fecha || '')}</div>
                                </td>
                                <td class="no-border" style="width: 50%;">
                                    <div class="font-bold">Peso:</div>
                                    <div>${(itemParaImprimir as Encomienda)?.peso} kg</div>
                                </td>
                            </tr>
                        </table>
                        <div style="margin: 5px 0;">
                            <div class="font-bold">Descripción:</div>
                            <div>${(itemParaImprimir as Encomienda)?.descripcion || 'N/A'}</div>
                        </div>
                        <div class="border-top">
                            <div style="display: flex;">
                                <div style="flex: 1; text-align: center;">
                                    <div class="font-bold">Precio:</div>
                                    <div>$${Number(itemParaImprimir?.precio).toLocaleString('es-HN')}</div>
                                </div>
                                <div style="flex: 1; text-align: center;">
                                    <div class="font-bold">Descuento:</div>
                                    <div>$${(itemParaImprimir?.descuento || 0).toLocaleString('es-HN')}</div>
                                </div>
                                <div style="flex: 1; text-align: center;">
                                    <div class="font-bold">Total:</div>
                                    <div>$${(itemParaImprimir?.total || 0).toLocaleString('es-HN')}</div>
                                </div>
                            </div>
                        </div>
                    `}
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            setTimeout(function() {
                                window.close();
                            }, 100);
                        }, 100);
                    };
                </script>
            </body>
            </html>
        `;

        iframe.contentDocument?.write(content);
        iframe.contentDocument?.close();

        setTimeout(() => {
            document.body.removeChild(iframe);
            setImprimirDialogVisible(false);
            setItemParaImprimir(null);
        }, 1000);
    };

    const tipoVentaBodyTemplate = (rowData: VentaItem) => {
        const tipo = rowData.tipoVenta || 'boleto';
        return (
            <Tag 
                value={tipo.toUpperCase()} 
                severity={tipo === 'boleto' ? 'success' : 'info'}
                icon={tipo === 'boleto' ? 'pi pi-ticket' : 'pi pi-box'}
            />
        );
    };

    const estadoBodyTemplate = (rowData: VentaItem) => {
        const estado = rowData.estado || (rowData.tipoVenta === 'encomienda' ? 'enviado' : 'vendido');
        const getSeverity = (estado: string) => {
            switch (estado) {
                case 'vendido':
                case 'entregado': return 'success';
                case 'reservado':
                case 'en_transito': return 'warning';
                case 'cancelado': return 'danger';
                case 'enviado': return 'info';
                default: return 'info';
            }
        };

        return (
            <Tag 
                value={estado.toUpperCase().replace('_', ' ')} 
                severity={getSeverity(estado)}
            />
        );
    };

    const metodoPagoBodyTemplate = (rowData: VentaItem) => {
        const metodo = rowData.metodoPago || 'efectivo';
        const getIcon = (metodo: string) => {
            switch (metodo) {
                case 'efectivo': return 'pi pi-money-bill';
                case 'tarjeta': return 'pi pi-credit-card';
                case 'transferencia': return 'pi pi-send';
                default: return 'pi pi-question';
            }
        };

        return (
            <div className="flex align-items-center gap-2">
                <i className={getIcon(metodo)}></i>
                <span className="capitalize">{metodo}</span>
            </div>
        );
    };

    const precioBodyTemplate = (rowData: VentaItem) => {
        const precio = parseFloat(String(rowData.precio)) || 0;
        const descuento = rowData.descuento || 0;
        const total = rowData.total || precio;
        
        return (
            <div>
                <div className="font-semibold">${total.toFixed(2)}</div>
                {descuento > 0 && (
                    <div className="text-sm text-gray-500">
                        Precio: ${precio.toFixed(2)}
                        <br />
                        Desc: -${descuento.toFixed(2)}
                    </div>
                )}
            </div>
        );
    };

    const actionBodyTemplate = (rowData: VentaItem) => {
        return (
            <div className="flex gap-2">
                <Button 
                    icon="pi pi-pencil" 
                    rounded 
                    text 
                    severity="info"
                    onClick={() => editItem(rowData)} 
                    tooltip="Editar"
                />
                <Button 
                    icon="pi pi-print" 
                    rounded 
                    text 
                    severity="help"
                    onClick={() => abrirModalImprimir(rowData)} 
                    tooltip="Imprimir"
                />
            </div>
        );
    };

    const clienteBodyTemplate = (rowData: VentaItem) => {
        if (rowData.tipoVenta === 'encomienda') {
            const enc = rowData as Encomienda;
            return (
                <div>
                    <div className="font-semibold">{enc.remitente}</div>
                    <div className="text-sm text-gray-500">Para: {enc.destinatario}</div>
                </div>
            );
        } else {
            const bol = rowData as Boleto;
            return bol.cliente;
        }
    };

    const detallesBodyTemplate = (rowData: VentaItem) => {
        if (rowData.tipoVenta === 'encomienda') {
            const enc = rowData as Encomienda;
            return (
                <div className="text-sm">
                    <div>{enc.descripcion}</div>
                    <div className="text-gray-500">{enc.peso} kg</div>
                </div>
            );
        } else {
            const bol = rowData as Boleto;
            return (
                <div className="text-sm">
                    {bol.autobus && <div>Bus: {bol.autobus}</div>}
                    {bol.asiento && <div>Asiento: {bol.asiento}</div>}
                    {bol.horaSalida && <div>{bol.horaSalida}</div>}
                </div>
            );
        }
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <div className="flex align-items-center gap-3">
                <h4 className="m-0">
                    Gestión de {currentMode === 'boleto' ? 'Boletos' : 'Encomiendas'}
                </h4>
                <Button
                    icon={currentMode === 'boleto' ? 'pi pi-box' : 'pi pi-ticket'}
                    label={`Cambiar a ${currentMode === 'boleto' ? 'Encomiendas' : 'Boletos'}`}
                    className="p-button-outlined p-button-sm"
                    onClick={() => cambiarModo(currentMode === 'boleto' ? 'encomienda' : 'boleto')}
                />
            </div>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Buscar..."
                />
            </span>
        </div>
    );

    const leftToolbar = (
        <div className="flex flex-wrap gap-2">
            <Button 
                label={`Nuevo ${currentMode === 'boleto' ? 'Boleto' : 'Encomienda'}`}
                icon="pi pi-plus" 
                severity="success" 
                onClick={openNew} 
            />
            <Button 
                label="Exportar" 
                icon="pi pi-upload" 
                className="p-button-help"
                onClick={() => console.log('Exportar datos')}
            />
        </div>
    );

    const rightToolbar = (
        <div className="flex flex-wrap gap-2">
            <Button 
                label="Eliminar Seleccionados" 
                icon="pi pi-trash" 
                severity="danger" 
                onClick={eliminarSeleccionados} 
                disabled={!selectedItems || !selectedItems.length} 
            />
        </div>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    
                    <Toolbar className="mb-4" left={leftToolbar} right={rightToolbar} />
                    
                    <DataTable
                        value={filteredItems}
                        selection={selectedItems}
                        onSelectionChange={(e) => setSelectedItems(e.value as VentaItem[])}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate={`Mostrando {first} a {last} de {totalRecords} ${currentMode === 'boleto' ? 'boletos' : 'encomiendas'}`}
                        globalFilter={globalFilter}
                        header={header}
                        emptyMessage={`No se encontraron ${currentMode === 'boleto' ? 'boletos' : 'encomiendas'}.`}
                    >
                        <Column 
                            selectionMode="multiple" 
                            headerStyle={{ width: '3rem' }}
                            exportable={false}
                        />
                        <Column 
                            field="tipoVenta" 
                            header="Tipo" 
                            body={tipoVentaBodyTemplate}
                            sortable
                            style={{ minWidth: '8rem' }}
                        />
                        <Column 
                            field={currentMode === 'boleto' ? 'cliente' : 'remitente'}
                            header={currentMode === 'boleto' ? 'Cliente' : 'Remitente/Destinatario'}
                            body={clienteBodyTemplate}
                            sortable
                            style={{ minWidth: '12rem' }}
                        />
                        {currentMode === 'boleto' && (
                            <>
                                <Column 
                                    field="cedula" 
                                    header="Cédula" 
                                    sortable
                                    style={{ minWidth: '10rem' }}
                                />
                                <Column 
                                    field="telefono" 
                                    header="Teléfono" 
                                    style={{ minWidth: '10rem' }}
                                />
                            </>
                        )}
                        <Column 
                            field="destino" 
                            header="Destino" 
                            sortable
                            style={{ minWidth: '10rem' }}
                        />
                        <Column 
                            field="fecha" 
                            header="Fecha" 
                            sortable
                            style={{ minWidth: '8rem' }}
                        />
                        <Column 
                            header="Detalles"
                            body={detallesBodyTemplate}
                            style={{ minWidth: '10rem' }}
                        />
                        <Column 
                            field="estado" 
                            header="Estado" 
                            body={estadoBodyTemplate}
                            sortable
                            style={{ minWidth: '8rem' }}
                        />
                        <Column 
                            field="metodoPago" 
                            header="Método Pago" 
                            body={metodoPagoBodyTemplate}
                            sortable
                            style={{ minWidth: '10rem' }}
                        />
                        <Column 
                            field="total" 
                            header="Total" 
                            body={precioBodyTemplate}
                            sortable
                            style={{ minWidth: '8rem' }}
                        />
                        <Column 
                            body={actionBodyTemplate}
                            exportable={false}
                            style={{ minWidth: '8rem' }}
                            header="Acciones"
                        />
                    </DataTable>
                    
                    <BoletoDialog
                        visible={boletoDialogVisible}
                        onHide={() => setBoletoDialogVisible(false)}
                        boleto={boleto}
                        setBoleto={setBoleto}
                        onSave={saveBoleto}
                        submitted={submitted}
                    />

                    <EncomiendaDialog
                        visible={encomiendaDialogVisible}
                        onHide={() => setEncomiendaDialogVisible(false)}
                        encomienda={encomienda}
                        setEncomienda={setEncomienda}
                        onSave={saveEncomienda}
                        submitted={submitted}
                    />

                    <ImprimirModal
                        visible={imprimirDialogVisible}
                        onHide={() => setImprimirDialogVisible(false)}
                        item={itemParaImprimir}
                        onConfirm={confirmarImpresion}
                    />
                </div>
            </div>
        </div>
    );
}
