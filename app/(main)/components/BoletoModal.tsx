'use client';

import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Boleto } from '@/types/ventas';
import { classNames } from 'primereact/utils';
import { apiGet } from '@/lib/http'; 
import axios from "axios"; 

import {
  getClientes,
  getMetodosPago,
  getEstadosTicket,
  
} from '@/modulos/boletos/servicios/ventas.servicios';

import type { Opcion } from '@/modulos/boletos/servicios/ventas.servicios';




type Props = {
  visible: boolean;
  onHide: () => void;
  boleto: Boleto;
  setBoleto: (b: Boleto) => void;
  onSave: (boleto: Boleto) => void | Promise<void>;
  submitted?: boolean;
};

const BoletoDialog: React.FC<Props> = ({
  visible,
  onHide,
  boleto,
  setBoleto,
  onSave,
  submitted = false,
}) => {
  // Catálogos
  const [optClientes, setOptClientes] = useState<Opcion[]>([]);
  const [optRutas, setOptRutas] = useState<Opcion[]>([]);
  const [optViajes, setOptViajes] = useState<Opcion[]>([]);
  const [optAsientos, setOptAsientos] = useState<Opcion[]>([]);
  const [optMetodosPago, setOptMetodosPago] = useState<Opcion[]>([]);
  const [optEstados, setOptEstados] = useState<Opcion[]>([]);
  const [saving, setSaving] = useState(false);


// 🟨 Horarios
const [optHorarios, setOptHorarios] = useState<string[]>([]);

  const [rutaSeleccionadaId, setRutaSeleccionadaId] = useState<number | null>(null);
  const [viajeSeleccionadoId, setViajeSeleccionadoId] = useState<number | null>(null);

  /* 🟩 Cargar rutas activas */
  useEffect(() => {
    if (!visible) return;
    (async () => {
      try {
        const data = await apiGet<{ items: { id: number; label: string; value: number }[] }>(
          '/api/rutas-activas'
        );
        const opts = (data.items || []).map((r) => ({
          label: r.label,
          value: r.id ?? r.value,
        }));
        setOptRutas(opts);
      } catch (err) {
        console.error('❌ Error cargando rutas activas:', err);
        setOptRutas([]);
      }
    })();
  }, [visible]);









  

  /* 🟨 Cargar viajes (unidades) por ruta */
  useEffect(() => {
    (async () => {
      if (!rutaSeleccionadaId) {
        setOptViajes([]);
        setViajeSeleccionadoId(null);
        return;
      }
      try {
        const data = await apiGet<{
          items: { idViaje: number; unidad: string; fecha: string; horaSalida: string }[];
        }>(`/api/unidades-por-rutas/${encodeURIComponent(String(rutaSeleccionadaId))}`);

        const opts = (data.items || []).map((u) => ({
          label: `${u.unidad} · salida ${String(u.horaSalida).slice(0, 5)}`,
          value: u.idViaje,
        }));
        setOptViajes(opts);
      } catch (err) {
        console.error('❌ Error cargando unidades por ruta:', err);
        setOptViajes([]);
      }
    })();
  }, [rutaSeleccionadaId]);

  /* 🟦 Cargar asientos por viaje */
  useEffect(() => {
    (async () => {
      if (!viajeSeleccionadoId) {
        setOptAsientos([]);
        return;
      }
      try {
        const data = await apiGet<{ items: { id: number; numero: number }[] }>(
          `/api/asientos-por-viaje/${encodeURIComponent(String(viajeSeleccionadoId))}`
        );
        const opts = (data.items || []).map((a) => ({
          label: `Asiento ${a.numero}`,
          value: a.id,
        }));
        setOptAsientos(opts);
      } catch (err) {
        console.error('❌ Error cargando asientos disponibles:', err);
        setOptAsientos([]);
      }
    })();
  }, [viajeSeleccionadoId]);

  /* 🟧 Cargar clientes, métodos de pago y estados */
  useEffect(() => {
    if (!visible) return;
    (async () => {
      try {
        const [clientes, metodos, estados] = await Promise.all([
          getClientes(),
          getMetodosPago(),
          getEstadosTicket(),
        ]);
        setOptClientes(clientes);
        setOptMetodosPago(metodos);
        setOptEstados(estados);
      } catch (err) {
        console.error('❌ Error cargando catálogos base:', err);
      }
    })();
  }, [visible]);

  const calcularTotal = () => {
    const precio = Number(boleto.precio) || 0;
    const descuento = Number(boleto.descuento || 0);
    const total = precio - descuento;
    return total < 0 ? 0 : total;
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onHide} />
      <Button
        label={saving ? 'Guardando...' : 'Guardar'}
        icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
        onClick={async () => {
          setSaving(true);
          await onSave({
            ...boleto,
            Id_Viaje_FK: viajeSeleccionadoId ?? boleto.Id_Viaje_FK,
          });
          setSaving(false);
        }}
        disabled={saving}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      style={{ width: '70rem' }}
      header={boleto.id ? 'Editar Boleto' : 'Nuevo Boleto'}
      modal
      className="p-fluid"
      footer={dialogFooter}
      onHide={onHide}
    >
      <div className="grid formgrid">
        {/* Cliente */}
        <div className="col-12 md:col-6">
          <label className="font-bold">Cliente *</label>
          <Dropdown
            value={boleto.Id_Cliente_FK ?? null}
            options={optClientes}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => setBoleto({ ...boleto, Id_Cliente_FK: e.value ?? null })}
            placeholder="Seleccionar cliente"
            filter
            showClear
          />
        </div>



{/* Ruta */}
<div className="col-12 md:col-6">
  <label className="font-bold">Ruta *</label>
  <Dropdown
    value={rutaSeleccionadaId ?? null}
    options={optRutas}
    optionLabel="label"
    optionValue="value"
    onChange={async (e) => {
      const rutaId = e.value ?? null;

      setRutaSeleccionadaId(rutaId);
      setViajeSeleccionadoId(null);
      setOptViajes([]);
      setOptAsientos([]);

      if (!rutaId) return;

      try {
        // 🔹 Llamada a la API local de boletos
        const { data } = await axios.get(`/api/boletos/rutas_precio/${rutaId}`);

        // ✅ Asigna el precio automáticamente
        setBoleto({
          ...boleto,
          precio: data.precio ?? 0,
        });

        // ✅ Carga horarios si existen
        setOptHorarios(data.horarios ?? []);
      } catch (err) {
        console.error("❌ Error obteniendo precio de ruta:", err);
      }
    }}
    placeholder="Seleccionar ruta"
    filter
    showClear
  />

  {optHorarios.length > 0 && (
    <div className="mt-3">
      <label htmlFor="horario" className="font-bold">
        Horario disponible
      </label>
      <Dropdown
        id="horario"
        value={boleto.horario ?? null}
        options={optHorarios.map((h) => ({ label: h, value: h }))}
        onChange={(e) => setBoleto({ ...boleto, horario: e.value })}
        placeholder="Seleccionar horario"
        showClear
      />
    </div>
  )}
</div>


        {/* Viaje / Unidad */}
        <div className="col-12 md:col-6">
          <label className="font-bold">Unidad (Viaje) *</label>
          <Dropdown
            value={viajeSeleccionadoId ?? null}
            options={optViajes}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => {
              setViajeSeleccionadoId(e.value ?? null);
              setBoleto({ ...boleto, Id_Viaje_FK: e.value ?? null });
            }}
            placeholder="Seleccionar unidad"
            filter
            showClear
            disabled={!rutaSeleccionadaId}
          />
        </div>

        {/* Asiento */}
        <div className="col-12 md:col-6">
          <label className="font-bold">Asiento *</label>
          <Dropdown
            value={boleto.Id_Asiento_FK ?? null}
            options={optAsientos}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => setBoleto({ ...boleto, Id_Asiento_FK: e.value ?? null })}
            placeholder="Seleccionar asiento"
            filter
            showClear
            disabled={!viajeSeleccionadoId}
          />
        </div>

        {/* Precio / Descuento / Total */}
     <div className="col-12 md:col-4">
  <label className="font-bold">Precio *</label>
  <InputNumber
    value={boleto.precio ?? 0}
    onValueChange={(e) => setBoleto({ ...boleto, precio: e.value ?? 0 })}
    mode="currency"
    currency="HNL"
    locale="es-HN"
    disabled  // 💡 si quieres que sea solo lectura (precio fijo de ruta)
  />
</div>


        <div className="col-12 md:col-4">
          <label className="font-bold">Descuento</label>
          <InputNumber
            value={boleto.descuento ?? 0}
            onValueChange={(e) => setBoleto({ ...boleto, descuento: e.value ?? 0 })}
            mode="currency"
            currency="HNL"
            locale="es-HN"
          />
        </div>

        <div className="col-12 md:col-4">
          <label className="font-bold">Total</label>
          <InputNumber value={calcularTotal()} mode="currency" currency="HNL" locale="es-HN" disabled />
        </div>

        {/* Método de Pago */}
        <div className="col-12 md:col-6">
          <label className="font-bold">Método de Pago *</label>
          <Dropdown
            value={boleto.Id_MetodoPago_FK ?? null}
            options={optMetodosPago}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => setBoleto({ ...boleto, Id_MetodoPago_FK: e.value ?? null })}
            placeholder="Seleccione método"
            filter
            showClear
          />
        </div>

        {/* Estado */}
        <div className="col-12 md:col-6">
          <label className="font-bold">Estado *</label>
          <Dropdown
            value={boleto.Id_EstadoTicket_FK ?? 1}
            options={optEstados.filter(
              (e) =>
                !['cancelado', 'reembolsado', 'usado'].includes(
                  (e.label || '').toLowerCase().trim()
                )
            )}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => setBoleto({ ...boleto, Id_EstadoTicket_FK: e.value ?? null })}
            placeholder="Seleccione estado"
            filter
            showClear={false}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default BoletoDialog;
