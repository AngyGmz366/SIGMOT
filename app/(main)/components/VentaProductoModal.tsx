'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Calendar } from 'primereact/calendar';
import type { Venta, ProductoVendido } from '@/types/ventas';
import type { Producto } from '@/types/productos';

interface VentaModalProps {
    visible: boolean;
    onHide: () => void;
    venta: Venta | null;
    productos: Producto[];
    onSave: (venta: Venta) => void;
}

const metodosPago = [
    { label: 'Efectivo', value: 'efectivo' },
    { label: 'Tarjeta', value: 'tarjeta' },
    { label: 'Transferencia', value: 'transferencia' }
];

const estadosVenta = [
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Completada', value: 'completada' },
    { label: 'Cancelada', value: 'cancelada' }
];

export default function VentaModal({ visible, onHide, venta, productos, onSave }: VentaModalProps) {
    const [currentVenta, setCurrentVenta] = useState<Venta>({
        id: null,
        fecha: new Date().toISOString(),
        cliente: '',
        productos: [],
        total: 0,
        estado: 'pendiente',
        metodoPago: 'efectivo',
        cobrada: false
    });
    const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
    const [cantidad, setCantidad] = useState<number>(1);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (venta) {
            setCurrentVenta({
                ...venta,
                productos: venta.productos ? [...venta.productos] : [],
                cobrada: venta.cobrada ?? false
            });
        } else {
            setCurrentVenta({
                id: null,
                fecha: new Date().toISOString(),
                cliente: '',
                productos: [],
                total: 0,
                estado: 'pendiente',
                metodoPago: 'efectivo',
                cobrada: false
            });
        }
        setSelectedProduct(null);
        setCantidad(1);
        setSubmitted(false);
    }, [venta, visible]);

    const agregarProducto = () => {
        if (!selectedProduct || cantidad <= 0) return;

        const subtotal = selectedProduct.precio * cantidad;
        const productoVendido: ProductoVendido = {
            productoId: selectedProduct.id!,
            codigo: selectedProduct.codigo,
            nombre: selectedProduct.nombre,
            cantidad,
            precioUnitario: selectedProduct.precio,
            subtotal
        };

        setCurrentVenta(prev => {
            const existingIndex = prev.productos.findIndex(p => p.productoId === selectedProduct.id);
            let nuevosProductos = [...prev.productos];

            if (existingIndex >= 0) {
                nuevosProductos[existingIndex] = {
                    ...nuevosProductos[existingIndex],
                    cantidad: nuevosProductos[existingIndex].cantidad + cantidad,
                    subtotal: nuevosProductos[existingIndex].subtotal + subtotal
                };
            } else {
                nuevosProductos.push(productoVendido);
            }

            const nuevoTotal = nuevosProductos.reduce((sum, p) => sum + p.subtotal, 0);
            return {
                ...prev,
                productos: nuevosProductos,
                total: nuevoTotal
            };
        });

        setSelectedProduct(null);
        setCantidad(1);
    };

    const eliminarProducto = (productoId: number) => {
        setCurrentVenta(prev => {
            const nuevosProductos = prev.productos.filter(p => p.productoId !== productoId);
            const nuevoTotal = nuevosProductos.reduce((sum, p) => sum + p.subtotal, 0);
            return {
                ...prev,
                productos: nuevosProductos,
                total: nuevoTotal
            };
        });
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        setCurrentVenta(prev => ({ ...prev, [name]: e.target.value }));
    };

    const onDropdownChange = (e: { value: any }, name: string) => {
        setCurrentVenta(prev => ({ ...prev, [name]: e.value }));
    };

    const onDateChange = (e: { value: Date | Date[] | null }) => {
        if (e.value && !Array.isArray(e.value)) {
            const fecha = e.value as Date;
            setCurrentVenta(prev => ({ ...prev, fecha: fecha.toISOString() }));
        }
    };

    const saveVenta = () => {
        setSubmitted(true);

        if (!currentVenta.cliente || currentVenta.cliente.trim() === '') return;
        if (currentVenta.productos.length === 0) return;

        const ventaToSave = {
            ...currentVenta,
            productos: currentVenta.productos.map(p => ({ ...p }))
        };

        onSave(ventaToSave);
    };

    const pagarVenta = () => {
        // Cambiar estado a completada y marcar cobrada
        setCurrentVenta(prev => ({
            ...prev,
            estado: 'completada',
            cobrada: true
        }));

        // Luego guardar la venta
 setTimeout(() => {
    const ventaToSave: Venta = {
        ...currentVenta,
        estado: 'completada' as 'completada',
        cobrada: true,
        productos: currentVenta.productos.map(p => ({ ...p }))
    };
    onSave(ventaToSave);
}, 100);

    };

    const productoBodyTemplate = (rowData: ProductoVendido) => `${rowData.codigo} - ${rowData.nombre}`;

    const cantidadBodyTemplate = (rowData: ProductoVendido) => (
        <InputNumber
            value={rowData.cantidad}
            onValueChange={(e) => {
                const newCantidad = e.value || 0;
                setCurrentVenta(prev => {
                    const nuevosProductos = prev.productos.map(p =>
                        p.productoId === rowData.productoId
                            ? { ...p, cantidad: newCantidad, subtotal: p.precioUnitario * newCantidad }
                            : p
                    );
                    const nuevoTotal = nuevosProductos.reduce((sum, p) => sum + p.subtotal, 0);
                    return {
                        ...prev,
                        productos: nuevosProductos,
                        total: nuevoTotal
                    };
                });
            }}
            min={1}
            max={1000}
        />
    );

    const precioBodyTemplate = (rowData: ProductoVendido) => `$${rowData.precioUnitario.toFixed(2)}`;
    const subtotalBodyTemplate = (rowData: ProductoVendido) => `$${rowData.subtotal.toFixed(2)}`;

    const actionBodyTemplate = (rowData: ProductoVendido) => (
        <Button
            icon="pi pi-trash"
            className="p-button-danger p-button-sm"
            onClick={() => eliminarProducto(rowData.productoId)}
        />
    );

    const ventaDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={onHide} />
            <Button label="Guardar" icon="pi pi-check" severity="success" onClick={saveVenta} />
            <Button label="Pagar" icon="pi pi-dollar" severity="warning" onClick={pagarVenta} disabled={currentVenta.estado === 'completada'} />
        </>
    );

    return (
        <Dialog
            visible={visible}
            onHide={onHide}
            header={currentVenta.id ? 'Editar Venta' : 'Nueva Venta'}
            modal
            className="p-fluid"
            style={{ width: '70rem' }}
            footer={ventaDialogFooter}
        >
            <div className="grid">
                <div className="col-12 md:col-6">
                    <div className="field">
                        <label htmlFor="fecha">Fecha</label>
                     <Calendar
  id="fecha"
  value={currentVenta.fecha ? new Date(currentVenta.fecha) : null}
  onChange={(e) =>
    setCurrentVenta({
      ...currentVenta,
      fecha: e.value instanceof Date ? e.value.toISOString() : '',
    })
  }
  dateFormat="dd/mm/yy"
  showIcon
/>
                    </div>

                    <div className="field">
                        <label htmlFor="cliente">Cliente*</label>
                        <InputText
                            id="cliente"
                            value={currentVenta.cliente}
                            onChange={(e) => onInputChange(e, 'cliente')}
                            required
                            className={submitted && !currentVenta.cliente ? 'p-invalid' : ''}
                        />
                        {submitted && !currentVenta.cliente && (
                            <small className="p-error">El cliente es requerido.</small>
                        )}
                    </div>

                    <div className="field">
                        <label htmlFor="metodoPago">Método de Pago*</label>
                        <Dropdown
                            id="metodoPago"
                            value={currentVenta.metodoPago}
                            options={metodosPago}
                            onChange={(e) => onDropdownChange(e, 'metodoPago')}
                            placeholder="Seleccione método de pago"
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="estado">Estado*</label>
                        <Dropdown
                            id="estado"
                            value={currentVenta.estado}
                            options={estadosVenta}
                            onChange={(e) => onDropdownChange(e, 'estado')}
                        />
                    </div>
                </div>

                <div className="col-12 md:col-6">
                    <div className="field">
                        <label htmlFor="observaciones">Observaciones</label>
                        <InputText
                            id="observaciones"
                            value={currentVenta.observaciones || ''}
                            onChange={(e) => onInputChange(e, 'observaciones')}
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="total">Total</label>
                        <InputNumber
                            id="total"
                            value={currentVenta.total}
                            mode="currency"
                            currency="USD"
                            locale="en-US"
                            readOnly
                        />
                    </div>
                </div>

                <div className="col-12">
                    <h5>Agregar Productos</h5>
                    <div className="p-fluid grid">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="producto">Producto</label>
                            <Dropdown
                                id="producto"
                                value={selectedProduct}
                                options={productos}
                                onChange={(e) => setSelectedProduct(e.value)}
                                optionLabel="nombre"
                                placeholder="Seleccione un producto"
                                filter
                            />
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="cantidad">Cantidad</label>
                            <InputNumber
                                id="cantidad"
                                value={cantidad}
                                onValueChange={(e) => setCantidad(e.value || 1)}
                                min={1}
                                max={selectedProduct?.stock || 100}
                            />
                        </div>

                        <div className="field col-12 md:col-3 flex align-items-end">
                            <Button
                                label="Agregar"
                                icon="pi pi-plus"
                                severity="success"
                                onClick={agregarProducto}
                                disabled={!selectedProduct}
                            />
                        </div>
                    </div>

                    <div className="mt-3">
                        <DataTable
                            value={currentVenta.productos}
                            emptyMessage="No hay productos agregados"
                            className="p-datatable-sm"
                        >
                            <Column field="codigo" header="Producto" body={productoBodyTemplate} />
                            <Column field="cantidad" header="Cantidad" body={cantidadBodyTemplate} />
                            <Column field="precioUnitario" header="Precio Unitario" body={precioBodyTemplate} />
                            <Column field="subtotal" header="Subtotal" body={subtotalBodyTemplate} />
                            <Column header="Acciones" body={actionBodyTemplate} style={{ width: '6rem' }} />
                        </DataTable>
                    </div>
                </div>
            </div>
        </Dialog>
    );
} 