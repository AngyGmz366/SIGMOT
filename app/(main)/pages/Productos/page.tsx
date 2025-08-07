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
import ProductoModal from '../../components/ProductoModal';
import type { Producto } from '@/types/productos';

export default function ProductoPage() {
    const toast = useRef<Toast>(null);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<Producto[] | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [productoDialogVisible, setProductoDialogVisible] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Producto | null>(null);
    const [imagenPreview, setImagenPreview] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [deleteProductoDialog, setDeleteProductoDialog] = useState(false);
    const [deleteProductosDialog, setDeleteProductosDialog] = useState(false);

    const categorias = [
        'Electrónicos', 'Ropa', 'Alimentos', 'Bebidas', 
        'Hogar', 'Juguetes', 'Deportes', 'Oficina'
    ];

    const filters = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        nombre: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        categoria: { value: null, matchMode: FilterMatchMode.EQUALS },
        estado: { value: null, matchMode: FilterMatchMode.EQUALS },
        codigo: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
    };

    const openNew = () => {
        setCurrentProduct({
            id: null,
            codigo: '',
            nombre: '',
            descripcion: '',
            categoria: '',
            precio: 0,
            costo: 0,
            stock: 0,
            stockMinimo: 0,
            proveedor: '',
            ubicacion: '',
            estado: 'activo'
        });
        setImagenPreview(null);
        setProductoDialogVisible(true);
        setSubmitted(false);
    };

    const hideDialog = () => {
        setProductoDialogVisible(false);
    };

    const guardarEnStorage = (data: Producto[]) => {
        localStorage.setItem('productos', JSON.stringify(data));
    };

    useEffect(() => {
        const stored = localStorage.getItem('productos');
        if (stored) {
            setProductos(JSON.parse(stored));
        } else {
            setProductos([]);
        }
    }, []);

    const saveProduct = (producto: Producto) => {
        let _products = [...productos];
        
        if (producto.id) {
            const index = _products.findIndex(p => p.id === producto.id);
            _products[index] = {
                ...producto,
                fechaActualizacion: new Date().toISOString()
            };
            toast.current?.show({
                severity: 'success',
                summary: 'Actualizado',
                detail: 'Producto actualizado',
                life: 3000
            });
        } else {
            producto.id = new Date().getTime();
            producto.fechaCreacion = new Date().toISOString();
            producto.fechaActualizacion = producto.fechaCreacion;
            _products.push(producto);
            toast.current?.show({
                severity: 'success',
                summary: 'Creado',
                detail: 'Producto creado',
                life: 3000
            });
        }

        setProductos(_products);
        guardarEnStorage(_products);
        setProductoDialogVisible(false);
    };

    const editProduct = (product: Producto) => {
        setCurrentProduct({ ...product });
        setProductoDialogVisible(true);
    };

    const confirmDeleteSelectedProducts = () => {
        setDeleteProductosDialog(true);
    };

    const deleteSelectedProducts = () => {
        if (!selectedProducts) return;
        
        const _products = productos.filter(p => !selectedProducts.includes(p));
        setProductos(_products);
        guardarEnStorage(_products);
        setSelectedProducts(null);
        setDeleteProductosDialog(false);
        
        toast.current?.show({
            severity: 'success',
            summary: 'Eliminados',
            detail: 'Productos eliminados',
            life: 3000
        });
    };

    const confirmDeleteProduct = (product: Producto) => {
        setCurrentProduct(product);
        setDeleteProductoDialog(true);
    };

    const deleteProduct = () => {
        if (!currentProduct) return;
        
        const _products = productos.filter(p => p.id !== currentProduct.id);
        setProductos(_products);
        guardarEnStorage(_products);
        setDeleteProductoDialog(false);
        setCurrentProduct(null);
        
        toast.current?.show({
            severity: 'success',
            summary: 'Eliminado',
            detail: 'Producto eliminado',
            life: 3000
        });
    };

    const estadoBodyTemplate = (rowData: Producto) => {
        const getSeverity = (estado: string) => {
            switch (estado) {
                case 'activo': return 'success';
                case 'inactivo': return 'warning';
                case 'agotado': return 'danger';
                case 'bajo_stock': return 'info';
                default: return null;
            }
        };

        const getLabel = (estado: string) => {
            switch (estado) {
                case 'activo': return 'Activo';
                case 'inactivo': return 'Inactivo';
                case 'agotado': return 'Agotado';
                case 'bajo_stock': return 'Bajo Stock';
                default: return estado;
            }
        };

        return (
            <Tag 
                value={getLabel(rowData.estado)} 
                severity={getSeverity(rowData.estado)}
            />
        );
    };

    const stockBodyTemplate = (rowData: Producto) => {
        const isLowStock = rowData.stock < rowData.stockMinimo;
        const isOutOfStock = rowData.stock <= 0;

        return (
            <div className={`flex align-items-center gap-2 ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-orange-500' : 'text-green-500'}`}>
                <i className={`pi ${isOutOfStock ? 'pi-times-circle' : isLowStock ? 'pi-exclamation-circle' : 'pi-check-circle'}`}></i>
                <span>
                    {rowData.stock} / {rowData.stockMinimo}
                </span>
            </div>
        );
    };

    const precioBodyTemplate = (rowData: Producto) => {
        const margen = ((rowData.precio - rowData.costo) / rowData.costo) * 100;
        
        return (
            <div>
                <div className="font-semibold">${rowData.precio.toFixed(2)}</div>
                <div className="text-sm text-gray-500">
                    Costo: ${rowData.costo.toFixed(2)}
                    <br />
                    Margen: {margen.toFixed(2)}%
                </div>
            </div>
        );
    };

    const imagenBodyTemplate = (rowData: Producto) => {
        return rowData.imagen ? (
            <img 
                src={rowData.imagen} 
                alt={rowData.nombre} 
                className="w-10 h-10 shadow-2 border-round" 
                style={{ objectFit: 'cover' }}
            />
        ) : (
            <div className="flex align-items-center justify-content-center w-10 h-10 bg-gray-100 border-round">
                <i className="pi pi-image text-gray-400"></i>
            </div>
        );
    };

    const actionBodyTemplate = (rowData: Producto) => {
        return (
            <div className="flex gap-2">
                <Button 
                    icon="pi pi-pencil" 
                    rounded 
                    text 
                    severity="info"
                    onClick={() => editProduct(rowData)} 
                    tooltip="Editar"
                    tooltipOptions={{ position: 'top' }}
                />
                <Button 
                    icon="pi pi-trash" 
                    rounded 
                    text 
                    severity="danger"
                    onClick={() => confirmDeleteProduct(rowData)}
                    tooltip="Eliminar"
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Gestión de Productos</h4>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText 
                    type="search" 
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Buscar productos..." 
                />
            </span>
        </div>
    );

    const leftToolbar = (
        <div className="flex flex-wrap gap-2">
            <Button 
                label="Nuevo Producto" 
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
                onClick={confirmDeleteSelectedProducts} 
                disabled={!selectedProducts || !selectedProducts.length} 
            />
        </div>
    );

    const deleteProductoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" outlined onClick={() => setDeleteProductoDialog(false)} />
            <Button label="Sí" icon="pi pi-check" severity="danger" onClick={deleteProduct} />
        </>
    );

    const deleteProductosDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" outlined onClick={() => setDeleteProductosDialog(false)} />
            <Button label="Sí" icon="pi pi-check" severity="danger" onClick={deleteSelectedProducts} />
        </>
    );

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbar} right={rightToolbar} />
                    
                    <DataTable
                        value={productos}
                        selection={selectedProducts}
                        onSelectionChange={(e) => setSelectedProducts(e.value as Producto[])}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos"
                        globalFilter={globalFilter}
                        header={header}
                        filters={filters}
                        filterDisplay="menu"
                        responsiveLayout="scroll"
                        emptyMessage="No se encontraron productos."
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} exportable={false} />
                        <Column field="imagen" header="Imagen" body={imagenBodyTemplate} style={{ minWidth: '6rem' }} />
                        <Column field="codigo" header="Código" sortable filter filterPlaceholder="Buscar por código" style={{ minWidth: '8rem' }} />
                        <Column field="nombre" header="Nombre" sortable filter filterPlaceholder="Buscar por nombre" style={{ minWidth: '12rem' }} />
                        <Column field="categoria" header="Categoría" sortable filter filterPlaceholder="Filtrar por categoría" style={{ minWidth: '10rem' }} />
                        <Column header="Precio/Costo" body={precioBodyTemplate} sortable sortField="precio" style={{ minWidth: '10rem' }} />
                        <Column header="Stock" body={stockBodyTemplate} sortable sortField="stock" style={{ minWidth: '10rem' }} />
                        <Column field="estado" header="Estado" body={estadoBodyTemplate} sortable filter filterPlaceholder="Filtrar por estado" style={{ minWidth: '8rem' }} />
                        <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} header="Acciones" />
                    </DataTable>

                    <ProductoModal
                        visible={productoDialogVisible}
                        onHide={hideDialog}
                        producto={currentProduct}
                        categorias={categorias}
                        onSave={saveProduct}
                    />

<Dialog 
                visible={deleteProductoDialog} 
                style={{ width: '450px' }} 
                header="Confirmar" 
                modal 
                footer={deleteProductoDialogFooter} 
                onHide={() => setDeleteProductoDialog(false)}
            >
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {currentProduct && (
                        <span>
                            ¿Está seguro de eliminar el producto <b>{currentProduct.nombre}</b>?
                            {currentProduct.codigo && (
                                <span> (Código: {currentProduct.codigo})</span>
                            )}
                        </span>
                    )}
                </div>
            </Dialog>

                    <Dialog 
                        visible={deleteProductosDialog} 
                        style={{ width: '450px' }} 
                        header="Confirmar" 
                        modal 
                        footer={deleteProductosDialogFooter} 
                        onHide={() => setDeleteProductosDialog(false)}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            <span>¿Está seguro de eliminar los {selectedProducts?.length} productos seleccionados?</span>
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}