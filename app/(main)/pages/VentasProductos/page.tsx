'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
//import VentaModal from '../../components/VentaProductoModal';
import type { Venta } from '@/types/ventas';
import type { Producto } from '@/types/productos';
import ImprimirComprobante from '../../components/ImprimirComprobante'; 
import jsPDF from 'jspdf';


export default function VentasPage() {
    const toast = useRef<Toast>(null);
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [selectedVentas, setSelectedVentas] = useState<Venta[] | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [ventaDialogVisible, setVentaDialogVisible] = useState(false);
    const [currentVenta, setCurrentVenta] = useState<Venta | null>(null);
    const [deleteVentaDialog, setDeleteVentaDialog] = useState(false);
    const [deleteVentasDialog, setDeleteVentasDialog] = useState(false);

    const filters = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        cliente: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        estado: { value: null, matchMode: FilterMatchMode.EQUALS },
        fecha: { value: null, matchMode: FilterMatchMode.DATE_IS }
    };

    const openNew = () => {
        setCurrentVenta(null);
        setVentaDialogVisible(true);
    };

    const hideDialog = () => {
        setVentaDialogVisible(false);
    };

    const guardarEnStorage = (data: Venta[]) => {
        localStorage.setItem('ventas', JSON.stringify(data));
    };


const [imprimirDialogVisible, setImprimirDialogVisible] = useState(false);
const [ventaParaImprimir, setVentaParaImprimir] = useState<Venta | null>(null);



const abrirImprimir = (venta: Venta) => {
    setVentaParaImprimir(venta);
    setImprimirDialogVisible(true);
};

const cerrarImprimir = () => {
    setImprimirDialogVisible(false);
    setVentaParaImprimir(null);
};
    
    useEffect(() => {
        // Cargar ventas
        const storedVentas = localStorage.getItem('ventas');
        if (storedVentas) {
            try {
                const parsedVentas = JSON.parse(storedVentas);
                // Asegurar que las fechas sean strings válidas
                const ventasConFechasValidas = parsedVentas.map((venta: any) => ({
                    ...venta,
                    fecha: venta.fecha || new Date().toISOString()
                }));
                setVentas(ventasConFechasValidas);
            } catch (error) {
                console.error("Error al parsear ventas:", error);
                setVentas([]);
            }
        }



        
        // Cargar productos
        const storedProductos = localStorage.getItem('productos');
        if (storedProductos) {
            try {
                setProductos(JSON.parse(storedProductos));
            } catch (error) {
                console.error("Error al parsear productos:", error);
                setProductos([]);
            }
        }
    }, []);

    const saveVenta = (venta: Venta) => {
        let updatedVentas: Venta[];
        
        if (venta.id) {
            // Actualizar venta existente
            updatedVentas = ventas.map(v => 
                v.id === venta.id ? { ...venta } : v
            );
        } else {
            // Crear nueva venta con ID único
            const nuevaVenta = { 
                ...venta, 
                id: Date.now(),
                fecha: venta.fecha || new Date().toISOString()
            };
            updatedVentas = [...ventas, nuevaVenta];
        }

        setVentas(updatedVentas);
        guardarEnStorage(updatedVentas);
        
        setVentaDialogVisible(false);
        toast.current?.show({
            severity: 'success',
            summary: venta.id ? 'Actualizado' : 'Creado',
            detail: `Venta ${venta.id ? 'actualizada' : 'creada'}`,
            life: 3000
        });
    };

    const editVenta = (venta: Venta) => {
        setCurrentVenta({ ...venta });
        setVentaDialogVisible(true);
    };

    const confirmDeleteVenta = (venta: Venta) => {
        setCurrentVenta(venta);
        setDeleteVentaDialog(true);
    };

    const deleteVenta = () => {
        if (!currentVenta) return;
        
        const _ventas = ventas.filter(v => v.id !== currentVenta.id);
        setVentas(_ventas);
        guardarEnStorage(_ventas);
        setDeleteVentaDialog(false);
        setCurrentVenta(null);
        
        toast.current?.show({
            severity: 'success',
            summary: 'Eliminado',
            detail: 'Venta eliminada',
            life: 3000
        });
    };

const imprimirDialogFooter = (
  <>
    <Button 
      label="Generar PDF" 
      icon="pi pi-file-pdf" 
      severity="danger" 
      onClick={() => ventaParaImprimir && generarPDFComprobante(ventaParaImprimir)} 
    />
    <Button 
      label="Cerrar" 
      icon="pi pi-times" 
      onClick={cerrarImprimir} 
      className="p-button-text" 
    />
  </>
);
    const confirmDeleteSelectedVentas = () => {
        setDeleteVentasDialog(true);
    };

    const deleteSelectedVentas = () => {
        if (!selectedVentas) return;
        
        const _ventas = ventas.filter(v => !selectedVentas.includes(v));
        setVentas(_ventas);
        guardarEnStorage(_ventas);
        setSelectedVentas(null);
        setDeleteVentasDialog(false);
        
        toast.current?.show({
            severity: 'success',
            summary: 'Eliminados',
            detail: 'Ventas eliminadas',
            life: 3000
        });
    };

    const estadoBodyTemplate = (rowData: Venta) => {
        const getSeverity = (estado: string) => {
            switch (estado) {
                case 'completada': return 'success';
                case 'pendiente': return 'warning';
                case 'cancelada': return 'danger';
                default: return null;
            }
        };

        return (
            <Tag 
                value={rowData.estado?.toUpperCase() || 'PENDIENTE'} 
                severity={getSeverity(rowData.estado || 'pendiente')}
            />
        );
    };

    const fechaBodyTemplate = (rowData: Venta) => {
        return new Date(rowData.fecha).toLocaleDateString();
    };

    const totalBodyTemplate = (rowData: Venta) => {
        return `$${rowData.total?.toFixed(2) || '0.00'}`;
    };

    const productosBodyTemplate = (rowData: Venta) => {
        return rowData.productos?.length || 0;
    };

    ////////////////////////////////////////////////////////777
const generarPDFComprobante = (venta: Venta) => {
  const doc = new jsPDF({
    unit: 'mm',
    format: [80, 150], // Tamaño de ticket (80mm ancho, 150mm alto)
  });

  // Configuración inicial
  doc.setFont('helvetica');
  const margin = 10;
  let y = margin;

  // Encabezado
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPROBANTE DE VENTA', 40, y, { align: 'center' });
  y += 10;

  // Información de la empresa
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Tienda: Mi Tienda', margin, y);
  y += 5;
  doc.text(`Fecha: ${new Date(venta.fecha).toLocaleString()}`, margin, y);
  y += 5;
  doc.text(`Comprobante: ${venta.comprobante || 'N/A'}`, margin, y);
  y += 5;
  doc.line(margin, y, 70, y); // Línea divisoria
  y += 5;

  // Información del cliente
  doc.setFontSize(11);
  doc.text(`Cliente: ${venta.cliente || 'Consumidor Final'}`, margin, y);
  y += 7;

  // Tabla de productos
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  // Encabezados de la tabla
  doc.text('Producto', margin, y);
  doc.text('Cant.', margin + 40, y);
  doc.text('Precio', margin + 55, y);
  y += 5;

  // Línea bajo encabezados
  doc.line(margin, y, 70, y);
  y += 5;

  // Productos
  doc.setFont('helvetica', 'normal');
  venta.productos?.forEach((producto) => {
    // Si nos quedamos sin espacio, añadimos nueva página
    if (y > 130) {
      doc.addPage([80, 150], 'portrait');
      y = margin;
    }

    doc.text(producto.nombre || 'Producto', margin, y);
    doc.text(producto.cantidad.toString(), margin + 40, y);
    doc.text(`$${producto.precioUnitario.toFixed(2)}`, margin + 55, y);
    y += 5;
  });

  // Totales
  doc.line(margin, y, 70, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal:', margin + 35, y);
  doc.text(`$${venta.total.toFixed(2)}`, margin + 55, y);
  y += 5;

  // Método de pago
  doc.setFont('helvetica', 'normal');
  doc.text(`Método de pago: ${venta.metodoPago.toUpperCase()}`, margin, y);
  y += 5;

  if (venta.metodoPago === 'efectivo' && venta.montoRecibido) {
    doc.text(`Monto recibido: $${venta.montoRecibido.toFixed(2)}`, margin, y);
    y += 5;
    doc.text(`Cambio: $${(venta.cambio || 0).toFixed(2)}`, margin, y);
    y += 5;
  }

  // Estado
  doc.text(`Estado: ${venta.estado.toUpperCase()}`, margin, y);
  y += 5;

  // Observaciones
  if (venta.observaciones) {
    doc.text(`Observaciones: ${venta.observaciones}`, margin, y);
    y += 5;
  }

  // Pie de página
  doc.line(margin, y, 70, y);
  y += 5;
  doc.setFontSize(8);
  doc.text('¡Gracias por su compra!', 40, y, { align: 'center' });
  y += 5;
  doc.text('Venta #' + venta.id, 40, y, { align: 'center' });

  // Guardar el PDF
  doc.save(`comprobante_${venta.id}.pdf`);
};

 // En el actionBodyTemplate agrega un botón nuevo:
const actionBodyTemplate = (rowData: Venta) => {
    return (
        <div className="flex gap-2">
            <Button 
                icon="pi pi-pencil" 
                rounded 
                text 
                severity="info"
                onClick={() => editVenta(rowData)} 
                tooltip="Editar"
                tooltipOptions={{ position: 'top' }}
            />
            <Button 
                icon="pi pi-print" 
                rounded 
                text 
                severity="info"
                onClick={() => abrirImprimir(rowData)}
                tooltip="Imprimir"
                tooltipOptions={{ position: 'top' }}
            />
            <Button 
                icon="pi pi-trash" 
                rounded 
                text 
                severity="danger"
                onClick={() => confirmDeleteVenta(rowData)}
                tooltip="Eliminar"
                tooltipOptions={{ position: 'top' }}
            />
        </div>
    );
};

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Gestión de Ventas</h4>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText 
                    type="search" 
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Buscar ventas..." 
                />
            </span>
        </div>
    );

    const leftToolbar = (
        <div className="flex flex-wrap gap-2">
            <Button 
                label="Nueva Venta" 
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
                label="Eliminar Seleccionadas" 
                icon="pi pi-trash" 
                severity="danger" 
                onClick={confirmDeleteSelectedVentas} 
                disabled={!selectedVentas || !selectedVentas.length} 
            />
        </div>
    );

    const deleteVentaDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" outlined onClick={() => setDeleteVentaDialog(false)} />
            <Button label="Sí" icon="pi pi-check" severity="danger" onClick={deleteVenta} />
        </>
    );

    const deleteVentasDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" outlined onClick={() => setDeleteVentasDialog(false)} />
            <Button label="Sí" icon="pi pi-check" severity="danger" onClick={deleteSelectedVentas} />
        </>
    );

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbar} right={rightToolbar} />
                    
                    <DataTable
                        value={ventas}
                        selection={selectedVentas}
                        onSelectionChange={(e) => setSelectedVentas(e.value as Venta[])}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} ventas"
                        globalFilter={globalFilter}
                        header={header}
                        filters={filters}
                        filterDisplay="menu"
                        responsiveLayout="scroll"
                        emptyMessage="No se encontraron ventas."
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} exportable={false} />
                        <Column field="fecha" header="Fecha" body={fechaBodyTemplate} sortable style={{ minWidth: '8rem' }} />
                        <Column field="cliente" header="Cliente" sortable filter style={{ minWidth: '12rem' }} />
                        <Column field="productos" header="Productos" body={productosBodyTemplate} style={{ minWidth: '6rem' }} />
                        <Column field="total" header="Total" body={totalBodyTemplate} sortable style={{ minWidth: '8rem' }} />
                        <Column field="metodoPago" header="Método Pago" sortable style={{ minWidth: '10rem' }} />
                        <Column field="estado" header="Estado" body={estadoBodyTemplate} sortable filter style={{ minWidth: '8rem' }} />
                        <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} header="Acciones" />
                    </DataTable>

                    {/* <VentaModal
                        visible={ventaDialogVisible}
                        onHide={hideDialog}
                        venta={currentVenta}
                        productos={productos}
                        onSave={saveVenta}
                    />*/}

                    <Dialog 
                        visible={deleteVentaDialog} 
                        style={{ width: '450px' }} 
                        header="Confirmar" 
                        modal 
                        footer={deleteVentaDialogFooter} 
                        onHide={() => setDeleteVentaDialog(false)}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {currentVenta && (
                                <span>
                                    ¿Está seguro de eliminar la venta del cliente <b>{currentVenta.cliente}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
<Dialog
  visible={imprimirDialogVisible}
  onHide={cerrarImprimir}
  style={{ width: '450px' }}
  header="Comprobante de Venta"
  dismissableMask
  footer={
    <div>
      <Button
        label="Cerrar"
        icon="pi pi-times"
        onClick={cerrarImprimir}
        className="p-button-text"
      />
      <Button
        label="Imprimir Comprobante"
            icon="pi pi-print"
        onClick={() => {
          if (ventaParaImprimir) {
            generarPDFComprobante(ventaParaImprimir);
          }
        }}
        className="p-button-text"
        //severity="success"
      />
    </div>
  }
>
  {ventaParaImprimir && (
    <ImprimirComprobante item={ventaParaImprimir} />
  )}
</Dialog>

                    <Dialog 
                        visible={deleteVentasDialog} 
                        style={{ width: '450px' }} 
                        header="Confirmar" 
                        modal 
                        footer={deleteVentasDialogFooter} 
                        onHide={() => setDeleteVentasDialog(false)}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            <span>¿Está seguro de eliminar las {selectedVentas?.length} ventas seleccionadas?</span>
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}