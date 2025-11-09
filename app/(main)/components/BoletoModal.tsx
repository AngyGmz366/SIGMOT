'use client';

import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Boleto } from '@/types/ventas';
import { apiGet } from '@/lib/http';
import axios from 'axios';
import { useCatalogos } from '@/lib/catalogos'; 

type Props = {
  visible: boolean;
  onHide: () => void;
  boleto: Boleto;
  setBoleto: React.Dispatch<React.SetStateAction<Boleto>>;
  onSave: (b: Boleto) => void | Promise<void>;
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
  // ✅ Cargar catálogos base desde el hook global
  const {
    clientes: optClientes,
    metodosPago: optMetodosPago,
    estados: optEstados,
    rutas: optRutas,
    cargando,
  } = useCatalogos();

  // Catálogos dependientes
  const [optViajes, setOptViajes] = useState<{ label: string; value: number }[]>([]);
  const [optAsientos, setOptAsientos] = useState<{ label: string; value: number }[]>([]);
  const [optHorarios, setOptHorarios] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Selecciones
  const [rutaSeleccionadaId, setRutaSeleccionadaId] = useState<number | null>(null);
  const [viajeSeleccionadoId, setViajeSeleccionadoId] = useState<number | null>(null);

  /* 🟩 Cargar viajes por ruta */
  useEffect(() => {
    if (!rutaSeleccionadaId) {
      setOptViajes([]);
      setViajeSeleccionadoId(null);
      return;
    }
    (async () => {
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
    if (!viajeSeleccionadoId) {
      setOptAsientos([]);
      return;
    }
    (async () => {
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


useEffect(() => {
  if (!visible || !boleto?.id || cargando) return;

  const syncData = async () => {
    try {
      if (boleto.Id_Viaje_FK) {
        const { data } = await axios.get(`/api/rutas_viaje/${boleto.Id_Viaje_FK}`);
        const rutaId = data?.Id_Ruta_FK ?? null;

        if (rutaId) {
          setRutaSeleccionadaId(rutaId);
          setViajeSeleccionadoId(Number(boleto.Id_Viaje_FK));
        }

        // Asegúrate de asignar correctamente los valores de autobus y asiento aquí
setBoleto((prev: Boleto) => ({
  ...prev,
  autobus: data?.autobus || '',
  asiento: data?.asiento || '',
}));

      }
    } catch (err) {
      console.error("❌ Error sincronizando datos del boleto:", err);
    }
  };

  syncData();
}, [visible, cargando, boleto]); // Reagregar 'boleto' en las dependencias



  // 🔘 Footer
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
            placeholder={cargando ? 'Cargando...' : 'Seleccionar cliente'}
            filter
            showClear
            disabled={cargando}
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
                const { data } = await axios.get(`/api/boletos/rutas_precio/${rutaId}`);
                setBoleto({ ...boleto, precio: data.precio ?? 0 });
                setOptHorarios(data.horarios ?? []);
              } catch (err) {
                console.error('❌ Error obteniendo precio de ruta:', err);
              }
            }}
            placeholder={cargando ? 'Cargando...' : 'Seleccionar ruta'}
            filter
            showClear
            disabled={cargando}
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

        {/* Viaje */}
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
            disabled={cargando}
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
            disabled={cargando}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default BoletoDialog;
