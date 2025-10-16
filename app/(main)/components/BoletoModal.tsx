'use client';

import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';

import { classNames } from 'primereact/utils';

import { Boleto } from '@/types/ventas';
import {
  getClientes,
  getViajes,
  getUnidadesPorRuta,
  getAsientos,
  getMetodosPago,
  getEstadosTicket,
} from '@/modulos/boletos/servicios/ventas.servicios';

type Opcion = { label: string; value: number | string; disabled?: boolean };

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
  const [optDestinos, setOptDestinos] = useState<Opcion[]>([]);
  const [optAutobuses, setOptAutobuses] = useState<Opcion[]>([]);
  const [optAsientos, setOptAsientos] = useState<Opcion[]>([]);
  const [optMetodosPago, setOptMetodosPago] = useState<Opcion[]>([]);
  const [optEstados, setOptEstados] = useState<Opcion[]>([]);
  const [saving, setSaving] = useState(false);

  // Cargar catálogos cuando se abre el modal
useEffect(() => {
  if (!visible) return;
  (async () => {
    try {
      const [clientes, destinos, autobuses, metodos, estados] = await Promise.all([
        getClientes(),
        getViajes(),
        getUnidadesPorRuta(1), // carga unidades de la ruta 1 por defecto
        getMetodosPago(),
        getEstadosTicket(),
      ]);

      setOptClientes(clientes);
      setOptDestinos(destinos);
      setOptAutobuses(autobuses);
      setOptMetodosPago(metodos);
      setOptEstados(estados);

      // 🔹 Si el boleto tiene una unidad seleccionada, carga sus asientos también
      if (boleto.Id_Unidad_FK) {
        const asientos = await getAsientos(boleto.Id_Unidad_FK);
        setOptAsientos(asientos);
      }
    } catch (err) {
      console.error('❌ Error cargando catálogos:', err);
    }
  })();
}, [visible, boleto.Id_Unidad_FK]);



// Cargar unidades cuando cambia la ruta

useEffect(() => {
  if (boleto.Id_Viaje_FK) {
    // Cuando cambie la ruta seleccionada, recargamos las unidades
    getUnidadesPorRuta(boleto.Id_Viaje_FK).then((unidades) => {
      setOptAutobuses(unidades);
    });
  }
}, [boleto.Id_Viaje_FK]);  // Dependemos de la ruta seleccionada





  // Cargar asientos cuando cambia la unidad (y cuando se abre el modal con unidad ya seleccionada)
  useEffect(() => {
    const loadAsientos = async () => {
      if (!visible) return;
      if (boleto.Id_Unidad_FK) {
        try {
          const asientos = await getAsientos(boleto.Id_Unidad_FK);
          setOptAsientos(asientos);
        } catch (err) {
          console.error('❌ Error cargando asientos:', err);
          setOptAsientos([]);
        }
      } else {
        setOptAsientos([]);
      }
    };
    loadAsientos();
  }, [visible, boleto.Id_Unidad_FK]);

  // Helpers
  const calcularTotal = () => {
    const precio = Number(boleto.precio) || 0;
    const descuento = Number(boleto.descuento || 0);
    const total = precio - descuento;
    return total < 0 ? 0 : total;
  };

const handleChangeRuta = (idRuta: number) => {
  setBoleto({ ...boleto, Id_Viaje_FK: idRuta });
  getUnidadesPorRuta(idRuta).then((unidades) => {
    setOptAutobuses(unidades);
  });
};

  // Footer
  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onHide} type="button" />
      <Button
        label={saving ? 'Guardando...' : 'Guardar'}
        icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
        onClick={async () => {
          setSaving(true);
          await onSave(boleto);
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
          <label htmlFor="cliente" className="font-bold">
            Cliente *
          </label>
          <Dropdown
            id="cliente"
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
{/* Origen y Destino (Viaje) */}
<div className="col-12 md:col-6">
  <label htmlFor="viaje" className="font-bold">
    Origen y Destino *
  </label>
  <Dropdown
    id="viaje"
    value={boleto.Id_Viaje_FK ?? null}
    options={optDestinos} // ✅ ya trae el label “Origen → Destino”
    optionLabel="label"
    optionValue="value"
    onChange={(e) =>
      setBoleto({
        ...boleto,
        Id_Viaje_FK: e.value ?? null,
      })
    }
    placeholder="Seleccionar ruta"
    filter
    showClear
  />
</div>



{/* Fecha de Compra (automática, no editable) */}
<div className="col-12 md:col-6">
  <label htmlFor="fecha" className="font-bold">
    Fecha de Compra
  </label>
  <InputText
    id="fecha"
    value={
      boleto.fecha
        ? new Date(boleto.fecha).toLocaleDateString('es-HN')
        : new Date().toLocaleDateString('es-HN')
    }
    disabled
    className="bg-gray-100 text-gray-600"
  />
</div>


        {/* Autobús */}
        <div className="col-12 md:col-6">
          <label htmlFor="autobus" className="font-bold">
            Autobús
          </label>
         <Dropdown
  id="autobus"
  value={boleto.Id_Unidad_FK ?? null}
  options={optAutobuses}
  optionLabel="label"
  optionValue="value"
  onChange={(e) => {
    const newUnidad = e.value ?? null;
    setBoleto({ ...boleto, Id_Unidad_FK: newUnidad });
    handleChangeRuta(newUnidad); // carga asientos
  }}
  placeholder="Seleccionar autobús"
  filter
  showClear
/>

        </div>

        {/* Asiento */}
        <div className="col-12 md:col-6">
          <label htmlFor="asiento" className="font-bold">
            Asiento
          </label>
          <Dropdown
            id="asiento"
            value={boleto.Id_Asiento_FK ?? null}
            options={optAsientos}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => setBoleto({ ...boleto, Id_Asiento_FK: e.value ?? null })}
            placeholder="Seleccionar asiento"
            filter
            showClear
            disabled={!boleto.Id_Unidad_FK}
          />
        </div>

        {/* Precio / Descuento / Total */}
        <div className="col-12 md:col-4">
          <label htmlFor="precio" className="font-bold">
            Precio *
          </label>
          <InputNumber
            id="precio"
            value={boleto.precio ?? 0}
            onValueChange={(e) => setBoleto({ ...boleto, precio: e.value ?? 0 })}
            mode="currency"
            currency="HNL"
            locale="es-HN"
          />
        </div>

        <div className="col-12 md:col-4">
          <label htmlFor="descuento" className="font-bold">
            Descuento
          </label>
          <InputNumber
            id="descuento"
            value={boleto.descuento ?? 0}
            onValueChange={(e) => setBoleto({ ...boleto, descuento: e.value ?? 0 })}
            mode="currency"
            currency="HNL"
            locale="es-HN"
          />
        </div>

        <div className="col-12 md:col-4">
          <label htmlFor="total" className="font-bold">
            Total
          </label>
          <InputNumber id="total" value={calcularTotal()} mode="currency" currency="HNL" locale="es-HN" disabled />
        </div>

        {/* Método de pago */}
        <div className="col-12 md:col-6">
          <label htmlFor="metodoPago" className="font-bold">
            Método de Pago *
          </label>
          <Dropdown
            id="metodoPago"
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
          <label htmlFor="estado" className="font-bold">
            Estado
          </label>
         <Dropdown
  id="estado"
  value={boleto.Id_EstadoTicket_FK ?? 1} // 1 = Pendiente por defecto
  options={optEstados.filter(
    (e) =>
      !['cancelado', 'reembolsado', 'usado'].includes(
        (e.label || '').toLowerCase().trim()
      )
  )}
  optionLabel="label"
  optionValue="value"
  onChange={(e) =>
    setBoleto({
      ...boleto,
      Id_EstadoTicket_FK: e.value ?? null,
    })
  }
  placeholder="Seleccione estado"
  filter
  showClear={false} // 🚫 No permitir limpiar el estado
/>
        </div>
      </div>
    </Dialog>
  );
};

export default BoletoDialog;
