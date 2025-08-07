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
import VentaModal from '../../components/VentaProductoModal';
import type { Venta } from '@/types/ventas';
import type { Producto } from '@/types/productos';

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

                    <VentaModal
                        visible={ventaDialogVisible}
                        onHide={hideDialog}
                        venta={currentVenta}
                        productos={productos}
                        onSave={saveVenta}
                    />

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