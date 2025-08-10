'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { FilterMatchMode } from 'primereact/api';
import { Dialog } from 'primereact/dialog';
import ImprimirBoleto from '../../components/ImprimirBoleto';
import BoletoDialog from '../../components/BoletoModal';
import EncomiendaDialog from '../../components/EncomiendaModal';
import { VentaItem, Boleto, Encomienda } from '@/types/ventas';
import { jsPDF } from 'jspdf';
import ImprimirEncomienda from '../../components/ImprimirEncomienda';

export default function VentasPage() {
    const toast = useRef<Toast>(null);
    const [ventaItems, setVentaItems] = useState<VentaItem[]>([]);
    const [boletoDialogVisible, setBoletoDialogVisible] = useState(false);
    const [encomiendaDialogVisible, setEncomiendaDialogVisible] = useState(false);
const [itemParaImprimir, setItemParaImprimir] = useState<VentaItem | null>(null)
    const [currentMode, setCurrentMode] = useState<'boleto' | 'encomienda'>('boleto');
    const [printing, setPrinting] = useState(false);
    const [printingMode, setPrintingMode] = useState<'boleto' | 'encomienda'>('boleto');
    
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


    ////////////////////////////////////GENERAR PDF BOLETO//////////////////////////////////
const generarPDF = (item: Boleto) => {
  const doc = new jsPDF({
    unit: 'mm',
    format: [70, 145], // 7cm x 14.5cm
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TRANSPORTE SAENS', 35, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.text('BOLETO DE VIAJE', 35, 22, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  let y = 35;
  const lineHeight = 7;

  doc.text(`Cliente: ${item.cliente}`, 5, y);
  doc.text(`Cédula: ${item.cedula || 'N/A'}`, 40, y);
  y += lineHeight;

  doc.text(`Fecha: ${item.fecha}`, 5, y);
  doc.text(`Hora Salida: ${item.horaSalida || 'N/A'}`, 40, y);
  y += lineHeight;

  doc.text(`Destino: ${item.destino}`, 5, y);
  doc.text(`Asiento: ${item.asiento || 'N/A'}`, 40, y);
  y += lineHeight;

  doc.text(`Autobús: ${item.autobus || 'N/A'}`, 5, y);
  doc.text(`Estado: ${item.estado}`, 40, y);
  y += lineHeight;

  doc.text(`Método Pago: ${item.metodoPago}`, 5, y);
  y += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text(`Total: HNL ${item.total?.toFixed(2) || '0.00'}`, 5, y);
  y += lineHeight;

  const svgElement = document.getElementById('qr-code-svg');
  if (svgElement) {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const pngDataUrl = canvas.toDataURL('image/png');

        // QR centrado horizontalmente, más grande
        doc.addImage(pngDataUrl, 'PNG', (70 - 35) / 2, 110, 35, 35);

        doc.setFontSize(7);
        doc.text(`ID: ${item.id}`, 5, 145);

        doc.save(`boleto_${item.cliente.replace(/ /g, '_')}_${item.fecha.replace(/\//g, '-')}.pdf`);
        URL.revokeObjectURL(url);
      }
    };

    img.onerror = () => {
      doc.setFontSize(7);
      doc.text(`ID: ${item.id}`, 5, 145);
      doc.save(`boleto_${item.cliente.replace(/ /g, '_')}_${item.fecha.replace(/\//g, '-')}.pdf`);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  } else {
    doc.setFontSize(7);
    doc.text(`ID: ${item.id}`, 5, 145);
    doc.save(`boleto_${item.cliente.replace(/ /g, '_')}_${item.fecha.replace(/\//g, '-')}.pdf`);
  }
};


/////////////////////////////////////////////////////////////////////////////

///////////////////////GENERAR PDF ENCOMIENDA///////////////////////
const generarPDFEncomienda = (item: Encomienda) => {
  const doc = new jsPDF({
    unit: 'mm',
    format: [70, 145], // igual que boleto
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TRANSPORTE SAENS', 35, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.text('COMPROBANTE ENCOMIENDA', 35, 22, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  let y = 35;
  const lineHeight = 7;

  doc.text(`Remitente: ${item.remitente}`, 5, y);
  doc.text(`Cédula: ${item.cedulaRemitente || 'N/A'}`, 40, y);
  y += lineHeight;

  doc.text(`Destinatario: ${item.destinatario}`, 5, y);
  doc.text(`Cédula: ${item.cedulaDestinatario || 'N/A'}`, 40, y);
  y += lineHeight;

  doc.text(`Origen: ${item.origen}`, 5, y);
  doc.text(`Destino: ${item.destino}`, 40, y);
  y += lineHeight;

  doc.text(`Fecha: ${item.fecha}`, 5, y);
  doc.text(`Teléfono: ${item.telefono || 'N/A'}`, 40, y);
  y += lineHeight;

  doc.text(`Descripción: ${item.descripcion.substring(0, 30)}...`, 5, y);
  y += lineHeight;

  doc.text(`Peso: ${item.peso} kg`, 5, y);
  doc.text(`Estado: ${item.estado}`, 40, y);
  y += lineHeight;

  doc.text(`Método Pago: ${item.metodoPago}`, 5, y);
  y += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text(`Total: HNL ${item.total?.toFixed(2) || '0.00'}`, 5, y);
  y += lineHeight;

  // QR
  const svgElement = document.getElementById('qr-code-svg'); // asumes que tienes el SVG en DOM con este id
  if (svgElement) {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const pngDataUrl = canvas.toDataURL('image/png');

        // QR centrado horizontalmente y tamaño 35x35
        doc.addImage(pngDataUrl, 'PNG', (70 - 35) / 2, 110, 35, 35);

        doc.setFontSize(7);
        doc.text(`ID: ${item.id}`, 5, 145);

        doc.save(`encomienda_${item.remitente.replace(/ /g, '_')}_${item.fecha.replace(/\//g, '-')}.pdf`);
        URL.revokeObjectURL(url);
      }
    };

    img.onerror = () => {
      doc.setFontSize(7);
      doc.text(`ID: ${item.id}`, 5, 145);
      doc.save(`encomienda_${item.remitente.replace(/ /g, '_')}_${item.fecha.replace(/\//g, '-')}.pdf`);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  } else {
    doc.setFontSize(7);
    doc.text(`ID: ${item.id}`, 5, 145);
    doc.save(`encomienda_${item.remitente.replace(/ /g, '_')}_${item.fecha.replace(/\//g, '-')}.pdf`);
  }
};


/////////////////////////////////////////////////////////////////////



    const [selectedItems, setSelectedItems] = useState<VentaItem[] | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [filters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        cliente: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        remitente: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        destino: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        tipoVenta: { value: null, matchMode: FilterMatchMode.EQUALS },
        estado: { value: null, matchMode: FilterMatchMode.EQUALS }
    });

    // Type guard para verificar si un item es Boleto
    const isBoleto = (item: VentaItem): item is Boleto => {
        return item.tipoVenta === 'boleto';
    };

    useEffect(() => {
        const stored = localStorage.getItem('ventaItems');
        if (stored) setVentaItems(JSON.parse(stored));
    }, []);

    const guardarEnStorage = (data: VentaItem[]) => {
        localStorage.setItem('ventaItems', JSON.stringify(data));
    };

    const filteredItems = ventaItems.filter(item => 
        currentMode === 'boleto' 
            ? isBoleto(item)
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
        if (boleto.cliente.trim()) {
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
        if (isBoleto(item)) {
            setBoleto(item);
            setBoletoDialogVisible(true);
        } else {
            setEncomienda(item);
            setEncomiendaDialogVisible(true);
        }
    };

    // const imprimirBoleto = (item: VentaItem) => {
    //     if (isBoleto(item)) {
    //         setItemParaImprimir(item);
    //         setPrinting(true);
    //     }
    // };


const imprimirItem = (item: VentaItem) => {
  if (item.tipoVenta !== 'boleto' && item.tipoVenta !== 'encomienda') {
    console.error('Tipo de venta no válido');
    return;
  }
  
  setItemParaImprimir(item);
  setPrintingMode(item.tipoVenta); // Ahora TypeScript sabe que es 'boleto' o 'encomienda'
  setPrinting(true);
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
        severity="warning"
        onClick={() => editItem(rowData)} 
        tooltip="Editar"
        tooltipOptions={{ position: 'top' }}
      />
      <Button 
        icon="pi pi-print" 
        rounded 
        text 
        severity="info"
        onClick={() => imprimirItem(rowData)} 
        tooltip="Imprimir"
        tooltipOptions={{ position: 'top' }}
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
                <input
                    type="search"
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Buscar..."
                    className="p-inputtext p-component"
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
        
            {/* <Button 
                label="Exportar" 
                icon="pi pi-upload" 
                className="p-button-help"
                onClick={() => console.log('Exportar datos')}
            /> */}
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
                        onSelectionChange={(e: any) => setSelectedItems(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate={`Mostrando {first} a {last} de {totalRecords} ${currentMode === 'boleto' ? 'boletos' : 'encomiendas'}`}
                        globalFilter={globalFilter}
                        header={header}
                        filters={filters}
                        filterDisplay="menu"
                        responsiveLayout="scroll"
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
                            filter
                            filterPlaceholder="Filtrar por tipo"
                            style={{ minWidth: '8rem' }}
                        />
                        
                        <Column 
                            field={currentMode === 'boleto' ? 'cliente' : 'remitente'}
                            header={currentMode === 'boleto' ? 'Cliente' : 'Remitente/Destinatario'}
                            body={clienteBodyTemplate}
                            sortable
                            filter
                            filterPlaceholder={`Buscar por ${currentMode === 'boleto' ? 'cliente' : 'remitente'}`}
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
                            filter
                            filterPlaceholder="Buscar por destino"
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
                            filter
                            filterPlaceholder="Filtrar por estado"
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

<Dialog
  visible={printing}
  onHide={() => setPrinting(false)}
  style={{ width: '450px' }}
  header={`Imprimir ${printingMode === 'boleto' ? 'Boleto' : 'Encomienda'}`}
  dismissableMask
  footer={
    <div>
      <Button
        label="Cerrar"
        icon="pi pi-times"
        onClick={() => setPrinting(false)}
        className="p-button-text"
      />
      <Button
        label="Imprimir"
        icon="pi pi-print"
        onClick={() => {
          if (itemParaImprimir) {
            if (printingMode === 'boleto') {
              generarPDF(itemParaImprimir as Boleto);
            } else {
              generarPDFEncomienda(itemParaImprimir as Encomienda);
            }
          }
        }}
        className="p-button-text"
      />
    </div>
  }
>
  {itemParaImprimir && (
    printingMode === 'boleto' ? 
      <ImprimirBoleto item={itemParaImprimir as Boleto} /> : 
      <ImprimirEncomienda item={itemParaImprimir as Encomienda} />
  )}
</Dialog>

     </div>
            </div>
        </div>
    );
}