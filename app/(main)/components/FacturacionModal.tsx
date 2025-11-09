'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import type { Boleto, Encomienda, FacturaForm } from '@/types/ventas';
import type { Persona, Cliente, Empleado } from '@/types/persona';

function isBoleto(item: Boleto | Encomienda | null | undefined): item is Boleto {
  return !!item && item.tipoVenta === 'boleto';
}

type TipoDescuento = {
  id_Tipo_Descuento: number;
  Nombre_Descuento: string;
  Descripcion: string;
  Porcentaje_Descuento: number;
  Condicion_Aplica: string;
};

type Props = {
  visible: boolean;
  onHide: () => void;
  boleto?: Boleto | Encomienda | null;
  onSave?: (factura: any) => void;
};

export default function FacturacionModal({ visible, onHide, boleto, onSave }: Props) {
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const [tiposDescuento, setTiposDescuento] = useState<TipoDescuento[]>([]);
  const [condicionDescuento, setCondicionDescuento] = useState<string>(''); // 👈 NUEVO estado

  const [form, setForm] = useState<FacturaForm>({
    descuentoBase: 0,
    descuentoEdad: 0,
    descuentoTotal: 0,
    isv: 0,
    total: 0,
    empleado: 1,
    metodoPago: 0,
    edadCliente: 0,
    tipoDescuento: null,
  });

  /* ==========================================================
     🔹 Cargar catálogo de tipos de descuento
     ========================================================== */
  useEffect(() => {
    const cargarTipos = async () => {
      try {
        const res = await axios.get('/api/catalogos/tipo_descuento');
        setTiposDescuento(res.data || []);
      } catch (err) {
        console.error('Error cargando tipos de descuento:', err);
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los descuentos.',
          life: 3000,
        });
      }
    };
    cargarTipos();
  }, []);

  /* ==========================================================
     🧮 Calcular edad exacta
     ========================================================== */
  const calcularEdad = (fechaNacimiento?: string | null): number => {
    if (!fechaNacimiento) return 0;
    const nacimiento = new Date(fechaNacimiento);
    if (isNaN(nacimiento.getTime())) return 0;
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  };

  /* ==========================================================
     ⚡ Cargar datos iniciales del boleto/encomienda
     ========================================================== */
  useEffect(() => {
    if (!boleto) return;

    const precio = Number(boleto.precio) || Number((boleto as any).Precio_Total) || 0;
    const fechaNacimiento =
      (boleto as any).fechaNacimiento ||
      (boleto as any).FechaNacimiento ||
      null;
    const edad = calcularEdad(fechaNacimiento);

    const isv = +(precio * 0.15).toFixed(2);
    const total = +(precio + isv).toFixed(2);

    setForm((prev) => ({
      ...prev,
      edadCliente: edad,
      descuentoBase: 0,
      descuentoEdad: 0,
      descuentoTotal: 0,
      isv,
      total,
    }));
  }, [boleto]);

  /* ==========================================================
     🔄 Recalcular al cambiar tipo de descuento
     ========================================================== */
  const aplicarDescuento = (idTipo: number) => {
    const tipo = tiposDescuento.find((t) => t.id_Tipo_Descuento === idTipo);
    if (!tipo || !boleto) return;

    // 👇 Guardamos la condición del descuento (p. ej. “No aplica si...”)
    setCondicionDescuento(tipo.Condicion_Aplica || 'No aplica');

    const precio = Number(boleto.precio) || 0;
    const descuento = +(precio * (Number(tipo.Porcentaje_Descuento) / 100)).toFixed(2);
    const subtotal = precio - descuento;
    const isv = +(subtotal * 0.15).toFixed(2);
    const total = +(subtotal + isv).toFixed(2);

    setForm((prev) => ({
      ...prev,
      tipoDescuento: tipo.Nombre_Descuento as any,
      descuentoEdad: descuento,
      descuentoTotal: descuento,
      isv,
      total,
    }));
  };

  /* ==========================================================
     💾 Crear factura
     ========================================================== */
  const crearFactura = async () => {
    if (!boleto) return;
    setLoading(true);
    try {
      const Id_Producto_FK = boleto.id;
      const Id_Cliente_FK = boleto.Id_Cliente_FK ?? boleto.Id_ClienteGeneral_FK ?? null;

      const payload = {
        Id_Producto_FK,
        Id_TipoProducto_FK: boleto.tipoVenta === 'boleto' ? 1 : 2,
        Subtotal: boleto.precio,
        Descuento: form.descuentoTotal,
        ISV: form.isv,
        Total: form.total,
        Id_MetodoPago_FK: boleto.Id_MetodoPago_FK || 1,
        Id_Empleado_FK: form.empleado || 1,
        Id_Cliente_FK,
        Id_Tipo_Descuento_FK:
          tiposDescuento.find((t) => t.Nombre_Descuento === form.tipoDescuento)
            ?.id_Tipo_Descuento || null,
      };

      console.log('🧾 Payload enviado a /api/facturas:', payload);
      const res = await axios.post('/api/facturas', payload);

      toast.current?.show({
        severity: 'success',
        summary: 'Factura creada',
        detail: `Factura ${res.data.factura?.Codigo_Factura || ''} generada correctamente.`,
        life: 3000,
      });

      setTimeout(() => {
        onSave?.(res.data.factura);
        onHide();
      }, 1000);
    } catch (err: any) {
      console.error('Error al crear factura:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err?.response?.data?.error || 'No se pudo crear la factura.',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex justify-content-end gap-2">
      <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onHide} disabled={loading} />
      <Button label="Crear Factura" icon="pi pi-check" loading={loading} onClick={crearFactura} />
    </div>
  );

  return (
    <Dialog visible={visible} header="🧾 Crear Factura" style={{ width: '35rem' }} modal footer={footer} onHide={onHide}>
      <Toast ref={toast} />

      {!boleto ? (
        <p className="text-center text-gray-500 my-4">No se seleccionó ningún boleto o encomienda.</p>
      ) : (
        <div className="p-fluid formgrid grid">
          {/* Cliente + tipo descuento */}
          <div className="field col-6">
            <label>Cliente</label>
<InputText
  value={isBoleto(boleto) ? boleto.cliente : (boleto as Encomienda).remitente}
  disabled
/>
          </div>

          <div className="field col-6">
            <label>Tipo de descuento</label>
            <Dropdown
              value={tiposDescuento.find((t) => t.Nombre_Descuento === form.tipoDescuento)?.id_Tipo_Descuento || null}
              options={tiposDescuento.map((t) => ({
                label: `${t.Nombre_Descuento} (${t.Porcentaje_Descuento}%)`,
                value: t.id_Tipo_Descuento,
              }))}
              onChange={(e) => aplicarDescuento(e.value)}
              placeholder="Seleccione tipo"
            />
          </div>

          {/* 👇 Mostrar condición del descuento */}
          {condicionDescuento && (
            <div className="field col-12">
              <small className="text-gray-600 italic">
                Condición: {condicionDescuento}
              </small>
            </div>
          )}

          {/* Subtotal / Descuento */}
          <div className="field col-6">
            <label>Subtotal</label>
            <InputNumber value={boleto.precio} mode="currency" currency="HNL" locale="es-HN" disabled />
          </div>

          <div className="field col-6">
            <label>Descuento aplicado</label>
            <InputNumber value={form.descuentoEdad} mode="currency" currency="HNL" locale="es-HN" disabled />
          </div>

          {/* ISV / Total */}
          <div className="field col-6">
            <label>ISV (15%)</label>
            <InputNumber value={form.isv} mode="currency" currency="HNL" locale="es-HN" disabled />
          </div>

          <div className="field col-6">
            <label>Total</label>
            <InputNumber value={form.total} mode="currency" currency="HNL" locale="es-HN" disabled />
          </div>

          {/* Info general */}
          <div className="field col-12 text-sm text-gray-600 mt-2">
            <small>
              Tipo de venta: {boleto.tipoVenta === 'boleto' ? 'Boleto' : 'Encomienda'} | Edad del cliente:{' '}
              {form.edadCliente > 0 ? `${form.edadCliente} años` : 'N/D'}
            </small>
          </div>
        </div>
      )}
    </Dialog>
  );
}

