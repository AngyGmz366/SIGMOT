'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import { Boleto, TipoDescuento } from '@/types/ventas';
import { apiGet } from '@/lib/http';




// Tipo para las opciones del Dropdown
type DropdownOption = {
  label: string;  // El nombre del descuento y su porcentaje
  value: number;  // El ID del descuento
};


type Props = {
  visible: boolean;
  onHide: () => void;
  boleto: Boleto | null;
  onSave: (factura: any) => void | Promise<void>;
};

const FacturacionModal: React.FC<Props> = ({ visible, onHide, boleto, onSave }) => {
  const [descuentoSeleccionado, setDescuentoSeleccionado] = useState<TipoDescuento | null>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [descuentoMonto, setDescuentoMonto] = useState(0);
  const [totalConDescuento, setTotalConDescuento] = useState(0);
  const [isv, setIsv] = useState(0);
  const [total, setTotal] = useState(0);
  const [optDescuentos, setOptDescuentos] = useState<TipoDescuento[]>([]); // Estado para descuentos completos
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([]); // Estado para opciones del Dropdown
  const [saving, setSaving] = useState(false);
  const [cargando, setCargando] = useState(false);

  const toast = useRef<Toast>(null);

  // Resetear todo al abrir modal
  useEffect(() => {
    if (visible) {
      setDescuentoSeleccionado(null);
      setDescuentoMonto(0);
      setTotalConDescuento(0);
      setIsv(0);
      setTotal(0);
      setSubtotal(boleto?.precio || 0);
    }
  }, [visible, boleto]);

  // Cargar tipos de descuento
const loadDescuentos = async () => {
  try {
    setCargando(true);
    // Obtener los datos de descuentos
    const data: TipoDescuento[] = await apiGet('/api/catalogos/tipo_descuento');
    
    // Guardar los descuentos completos en el estado
    setOptDescuentos(data);

    // Crear un arreglo de opciones para el Dropdown
    const options: DropdownOption[] = data.map((descuento) => ({
      label: `${descuento.Nombre_Descuento} - ${descuento.Porcentaje_Descuento}%`,  // Usamos el nombre y el porcentaje
      value: descuento.id_Tipo_Descuento,  // Usamos 'id_Tipo_Descuento' como value
    }));

    // Guardar las opciones para el Dropdown
    setDropdownOptions(options);
    setCargando(false);
  } catch (err) {
    console.error('❌ Error cargando descuentos:', err);
    setCargando(false);
  }
};


  useEffect(() => {
    loadDescuentos();
  }, []);

  // Recalcular totales
useEffect(() => {
  const sub = subtotal || 0;
  if (descuentoSeleccionado) {
    const porcentaje = descuentoSeleccionado.Porcentaje_Descuento ?? descuentoSeleccionado.monto ?? 0;
    const descuento = (sub * porcentaje) / 100;
    setDescuentoMonto(descuento);
    const subConDesc = sub - descuento;
    setTotalConDescuento(subConDesc);
    const isvCalc = subConDesc * 0.15; // ISV calculado sobre el subtotal con descuento
    setIsv(isvCalc);
    setTotal(subConDesc + isvCalc);
  } else {
    setDescuentoMonto(0);
    setTotalConDescuento(sub);
    const isvCalc = sub * 0.15; // ISV calculado sobre el subtotal sin descuento
    setIsv(isvCalc);
    setTotal(sub + isvCalc);
  }
}, [subtotal, descuentoSeleccionado]);


  // Guardar factura
// En el componente que maneja el modal
// Guardar factura
const saveFactura = async () => {
  if (!boleto) {
    toast.current?.show({
      severity: 'warn',
      summary: 'Atención',
      detail: 'No hay boleto seleccionado',
      life: 3000,
    });
    return;
  }

  setSaving(true);

  try {
    const payload = {
      Id_Producto_FK: Number(boleto.id || boleto.Id_Ticket_PK),
      Id_TipoProducto_FK: 1, // tipo boleto
      Subtotal: Number(subtotal || 0),
      Descuento: Number(descuentoMonto || 0),
      ISV: Number(isv || 0),
      Total: Number(total || 0),
      Id_Tipo_Descuento_FK: descuentoSeleccionado ? descuentoSeleccionado.id_Tipo_Descuento : null,
      Id_MetodoPago_FK: Number(boleto.Id_MetodoPago_FK || 1),
      Id_Empleado_FK: 1,
      Id_Cliente_FK: boleto.Id_Cliente_FK ? Number(boleto.Id_Cliente_FK) : null,
    };

    // Enviar la petición para crear la factura
    const { data } = await axios.post('/api/facturas', payload);

    // Actualizar el estado de "Pagado" inmediatamente en la UI local
    const updatedBoleto = { ...boleto, estado: 'Pagado' };

    // ✅ Enviar también la información de la factura al imprimir
onSave({
  ...updatedBoleto,
  factura: {
    subtotal,
    descuentoTotal: descuentoMonto,
    isv: Number(isv),
    total: Number(total),
tipoDescuento: descuentoSeleccionado?.Nombre_Descuento ?? 'Sin descuento',
  },
});


    toast.current?.show({
      severity: 'success',
      summary: 'Éxito',
      detail: `Factura creada exitosamente para el Boleto ${boleto.Codigo_Ticket || boleto.id}`,
      life: 3000,
    });

    // Cerrar el modal después de guardar la factura
    onHide();

  } catch (err: any) {
    const mensajeSP = err?.response?.data?.error || err?.message || 'Ocurrió un error al crear la factura';
    toast.current?.show({
      severity: 'warn',
      summary: 'Atención',
      detail: mensajeSP,
      life: 4000,
    });
  } finally {
    setSaving(false);
  }
};


  const footer = (
    <div className="flex justify-content-end gap-2">
      <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onHide} />
      <Button
        label={saving ? 'Guardando...' : 'Guardar Factura'}
        icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
        onClick={saveFactura}
        disabled={saving || cargando}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      style={{ width: '70rem' }}
      header={`Crear Factura - Boleto #${boleto?.Codigo_Ticket || boleto?.id || ''}`}
      modal
      className="p-fluid"
      footer={footer}
      onHide={onHide}
    >
      <div className="grid formgrid">
        {/* Cliente */}
        <div className="col-12 md:col-6">
          <label className="font-bold">Cliente *</label>
          <div className="p-inputtext p-component p-disabled" style={{ padding: '0.75rem' }}>
            {boleto?.cliente || 'Cliente no especificado'}
          </div>
        </div>

        {/* Descuento */}
        <div className="col-12 md:col-6">
          <label className="font-bold">Descuento</label>
        <Dropdown
  value={descuentoSeleccionado?.id_Tipo_Descuento}  // Usamos 'id_Tipo_Descuento' como valor seleccionado
  options={dropdownOptions}  // Usamos las opciones procesadas
  optionLabel="label"   // 'label' será el texto a mostrar en el Dropdown
  optionValue="value"   // 'value' es el ID del descuento
  onChange={(e) => {
    // Buscamos el descuento completo por ID
    const descuento = optDescuentos.find(d => d.id_Tipo_Descuento === e.value);
    setDescuentoSeleccionado(descuento || null);  // Establecemos el descuento completo
  }}
  placeholder={cargando ? 'Cargando...' : 'Seleccionar descuento'}
  showClear
  disabled={cargando || dropdownOptions.length === 0}  // Deshabilitar si no hay opciones
/>


        </div>

        {/* Subtotal */}
        <div className="col-12 md:col-6">
          <label className="font-bold">Subtotal</label>
          <InputNumber value={subtotal} mode="currency" currency="HNL" locale="es-HN" disabled />
        </div>

        {/* Descuento Aplicado */}
        {descuentoMonto > 0 && (
          <div className="col-12 md:col-6">
            <label className="font-bold">Descuento Aplicado</label>
            <InputNumber value={descuentoMonto} mode="currency" currency="HNL" locale="es-HN" disabled />
          </div>
        )}

        {/* Total con Descuento */}
        <div className="col-12 md:col-6">
          <label className="font-bold">Subtotal con Descuento</label>
          <InputNumber value={totalConDescuento} mode="currency" currency="HNL" locale="es-HN" disabled />
        </div>

        {/* ISV */}
        <div className="col-12 md:col-6">
          <label className="font-bold">ISV (15%)</label>
          <InputNumber value={isv} mode="currency" currency="HNL" locale="es-HN" disabled />
        </div>

        {/* Total */}
        <div className="col-12 md:col-6">
          <label className="font-bold">Total Final</label>
          <InputNumber value={total} mode="currency" currency="HNL" locale="es-HN" disabled className="font-bold" style={{ fontSize: '1.2rem' }} />
        </div>
      </div>

      <Toast ref={toast} />
    </Dialog>
  );
};

export default FacturacionModal;
