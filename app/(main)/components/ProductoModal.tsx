'use client';

import React, { useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import type { Producto } from '@/types/productos';

interface ProductoModalProps {
    visible: boolean;
    onHide: () => void;
    producto: Producto | null;
    categorias: string[];
    onSave: (producto: Producto) => void;
}

const estados = ['activo', 'inactivo', 'agotado', 'bajo_stock'];

export default function ProductoModal({ visible, onHide, producto, categorias, onSave }: ProductoModalProps) {
    const fileUploadRef = useRef<FileUpload>(null);
    const [submitted, setSubmitted] = useState(false);
    const [imagenPreview, setImagenPreview] = useState<string | null>(null);
    const [currentProduct, setCurrentProduct] = useState<Producto>(producto || {
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

React.useEffect(() => {
    if (producto) {
        setCurrentProduct(producto);
        setImagenPreview(producto.imagen || null);
    } else {
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
    }
}, [producto]);
    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target as HTMLInputElement).value;
        setCurrentProduct(prev => ({ ...prev, [name]: val }));
    };

    const onNumberChange = (value: number | null, name: string) => {
        setCurrentProduct(prev => ({ ...prev, [name]: value || 0 }));
    };

    const onDropdownChange = (e: { value: any }, name: string) => {
        setCurrentProduct(prev => ({ ...prev, [name]: e.value }));
    };

    const onImageUpload = (e: { files: File[] }) => {
        const file = e.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagenPreview(event.target?.result as string);
                setCurrentProduct(prev => ({ 
                    ...prev, 
                    imagen: event.target?.result as string 
                }));
            };
            reader.readAsDataURL(file);
        }
        fileUploadRef.current?.clear();
    };

    const saveProduct = () => {
        setSubmitted(true);

        // Validaciones básicas
        if (!currentProduct.nombre.trim() || !currentProduct.codigo.trim() || 
            currentProduct.precio <= 0 || currentProduct.costo <= 0) {
            return;
        }

        // Actualizar estado según stock
        const updatedProduct = { ...currentProduct };
        if (updatedProduct.stock <= 0) {
            updatedProduct.estado = 'agotado';
        } else if (updatedProduct.stock < updatedProduct.stockMinimo) {
            updatedProduct.estado = 'bajo_stock';
        } else {
            updatedProduct.estado = 'activo';
        }

        onSave(updatedProduct);
        onHide();
    };

const productDialogFooter = (
    <React.Fragment>
        <Button 
            label="Cancelar" 
            icon="pi pi-times" 
            outlined 
            onClick={onHide} 
        />
        <Button 
            label="Guardar" 
            icon="pi pi-check" 
            onClick={saveProduct} 
        />
    </React.Fragment>
);







    
    return (
        <Dialog 
            visible={visible} 
            onHide={onHide}
            header={currentProduct.id ? 'Editar Producto' : 'Nuevo Producto'}
            modal 
            className="p-fluid"
            style={{ width: '50rem' }}
            footer={productDialogFooter}
        >
            <div className="grid">
                <div className="col-12 md:col-8">
                    <div className="field">
                        <label htmlFor="nombre">Nombre del Producto*</label>
                        <InputText 
                            id="nombre" 
                            value={currentProduct.nombre} 
                            onChange={(e) => onInputChange(e, 'nombre')} 
                            required 
                            autoFocus 
                            className={submitted && !currentProduct.nombre ? 'p-invalid' : ''}
                        />
                        {submitted && !currentProduct.nombre && (
                            <small className="p-error">El nombre es requerido.</small>
                        )}
                    </div>
                    
                    <div className="field">
                        <label htmlFor="codigo">Código del Producto*</label>
                        <InputText 
                            id="codigo" 
                            value={currentProduct.codigo} 
                            onChange={(e) => onInputChange(e, 'codigo')} 
                            required 
                            className={submitted && !currentProduct.codigo ? 'p-invalid' : ''}
                        />
                        {submitted && !currentProduct.codigo && (
                            <small className="p-error">El código es requerido.</small>
                        )}
                    </div>
                    
                    <div className="field">
                        <label htmlFor="descripcion">Descripción</label>
                        <InputTextarea 
                            id="descripcion" 
                            value={currentProduct.descripcion} 
                            onChange={(e) => onInputChange(e, 'descripcion')} 
                            rows={3}
                        />
                    </div>
                    
                    <div className="field">
                        <label htmlFor="categoria">Categoría</label>
                        <Dropdown 
                            id="categoria" 
                            value={currentProduct.categoria} 
                            options={categorias} 
                            onChange={(e) => onDropdownChange(e, 'categoria')} 
                            placeholder="Seleccione una categoría"
                        />
                    </div>
                    
                </div>
                
                <div className="col-12 md:col-4">
                    <div className="field">
                        <label htmlFor="precio">Precio de Venta*</label>
                        <InputNumber 
                            id="precio" 
                            value={currentProduct.precio} 
                           onValueChange={(e) => onNumberChange(e.value !== undefined ? e.value : null, 'precio')}

                            mode="currency" 
                            currency="USD" 
                            locale="en-US"
                            className={submitted && currentProduct.precio <= 0 ? 'p-invalid' : ''}
                        />
                        {submitted && currentProduct.precio <= 0 && (
                            <small className="p-error">El precio debe ser mayor a 0.</small>
                        )}
                    </div>
                    
                    <div className="field">
                        <label htmlFor="costo">Costo*</label>
                        <InputNumber 
                            id="costo" 
                            value={currentProduct.costo} 
                          
                              onValueChange={(e) => onNumberChange(e.value !== undefined ? e.value : null, 'costo')}
                            mode="currency" 
                            currency="USD" 
                            locale="en-US"
                            className={submitted && currentProduct.costo <= 0 ? 'p-invalid' : ''}
                        />
                        {submitted && currentProduct.costo <= 0 && (
                            <small className="p-error">El costo debe ser mayor a 0.</small>
                        )}
                    </div>
                    
<div className="field">
    <label htmlFor="stock">Stock Actual*</label>
    <InputNumber 
        id="stock" 
        value={currentProduct.stock} 
        onValueChange={(e) => onNumberChange(e.value !== undefined ? e.value : null, 'stock')}
        min={0}
        minFractionDigits={0}
        maxFractionDigits={0}
        className={submitted && currentProduct.stock < 0 ? 'p-invalid' : ''}
    />
    {submitted && currentProduct.stock < 0 && (
        <small className="p-error">El stock no puede ser negativo.</small>
    )}
</div>

                    
                    <div className="field">
                        <label htmlFor="estado">Estado</label>
                        <Dropdown 
                            id="estado" 
                            value={currentProduct.estado} 
                            options={estados} 
                            onChange={(e) => onDropdownChange(e, 'estado')} 
                        />
                    </div>
                    
                    <div className="field">
                        <label htmlFor="imagen">Imagen del Producto</label>
                        <FileUpload 
                            ref={fileUploadRef}
                            name="imagen" 
                            accept="image/*" 
                            maxFileSize={1000000} 
                            mode="basic" 
                            chooseLabel="Subir Imagen" 
                            auto 
                            customUpload 
                            uploadHandler={onImageUpload}
                        />
                        {imagenPreview && (
                            <div className="mt-2">
                                <img 
                                    src={imagenPreview} 
                                    alt="Preview" 
                                    className="w-full border-round" 
                                    style={{ maxHeight: '100px', objectFit: 'contain' }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Dialog>
    );
}