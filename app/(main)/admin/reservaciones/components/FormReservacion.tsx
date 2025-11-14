'use client';

import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { ReservacionBase, ReservacionEncomienda } from './types';
import { useEffect, useState } from 'react';
import './FormReservacion.css';

type FormProps = {
  initialData?: ReservacionBase;
  onSave: (data: ReservacionBase) => void;
  onCancel: () => void;
};

export default function FormReservacion({ initialData, onSave, onCancel }: FormProps) {
  const [formData, setFormData] = useState<Partial<ReservacionBase>>(
    initialData && Object.keys(initialData).length > 0
      ? { ...initialData , fecha: initialData.fecha ? new Date(initialData.fecha) : new Date(),  }
      : { tipo: 'viaje', estado: 'pendiente', fecha: new Date(), dni: '', correo: ''  }
  );

  const [rutasOptions, setRutasOptions] = useState<{ label: string; value: number }[]>([]);
  const [rutaSeleccionadaId, setRutaSeleccionadaId] = useState<number | null>(null);
  const [viajesOptions, setViajesOptions] = useState<{ label: string; value: number }[]>([]);
  const [viajeSeleccionadoId, setViajeSeleccionadoId] = useState<number | null>(null);
  const [asientosOptions, setAsientosOptions] = useState<{ label: string; value: number }[]>([]);
  const [asientoSeleccionadoId, setAsientoSeleccionadoId] = useState<number | null>(null);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        ...initialData,
        fecha: initialData.fecha ? new Date(initialData.fecha) : new Date(),
      });
    }
  }, [initialData]);

  async function apiGet<T>(url: string): Promise<T> {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<{ items: { id: number; label: string; value: number }[] }>('/api/rutas-activas');
        const opts = (data.items || []).map((r) => ({ label: r.label, value: r.id ?? r.value }));
        setRutasOptions(opts);
      } catch (err) {
        console.error('No se pudieron cargar las rutas activas:', err);
        setRutasOptions([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!rutaSeleccionadaId) {
        setViajesOptions([]);
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
        setViajesOptions(opts);
      } catch (err) {
        console.error('No se pudieron cargar los viajes:', err);
        setViajesOptions([]);
      }
    })();
  }, [rutaSeleccionadaId]);

  useEffect(() => {
    (async () => {
      if (!viajeSeleccionadoId || formData.tipo !== 'viaje') {
        setAsientosOptions([]);
        setAsientoSeleccionadoId(null);
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
        setAsientosOptions(opts);
      } catch (err) {
        console.error('No se pudieron cargar los asientos disponibles:', err);
        setAsientosOptions([]);
      }
    })();
  }, [viajeSeleccionadoId, formData.tipo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.dni && !formData.correo) return alert('Debe ingresar el DNI o correo de la persona.');

    if (!formData.tipo) return alert('Debe seleccionar el tipo de reservación.');

    if (formData.tipo === 'viaje' && !asientoSeleccionadoId)
      return alert('Debe seleccionar un asiento disponible.');

    if (formData.tipo === 'encomienda' && !(formData as ReservacionEncomienda).costo)
      return alert('Debe ingresar el costo de la encomienda.');

    const payload: ReservacionBase = {
      dni: formData.dni,
      correo: formData.correo || null,
      tipo: formData.tipo,
      id_viaje: viajeSeleccionadoId ?? null,
      id_asiento: asientoSeleccionadoId ?? null,
      id_encomienda: (formData as ReservacionEncomienda).id_encomienda ?? null,
      costo: (formData as ReservacionEncomienda).costo ?? null,
      fecha: formData.fecha ? new Date(formData.fecha).toISOString() : new Date().toISOString(),
      estado: formData.estado ?? 'pendiente',
    };

    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="p-fluid grid gap-3">
      {/* Tipo */}
      <div className="col-12 md:col-6">
        <Dropdown
          value={formData.tipo ?? 'viaje'}
          options={[
            { label: 'Viaje', value: 'viaje' },
            { label: 'Encomienda', value: 'encomienda' },
          ]}
          onChange={(e) => {
            const newTipo = e.value as 'viaje' | 'encomienda';
            if (newTipo === 'viaje') {
              setFormData({ ...formData, tipo: newTipo, id_encomienda: null, costo: null });
            } else {
              setFormData({ ...formData, tipo: newTipo, id_asiento: null, id_encomienda: null });
            }
            setAsientosOptions([]);
            setAsientoSeleccionadoId(null);
          }}
          placeholder="Tipo de reservación"
          className="w-full"
        />
      </div>

      {/* DNI */}
      <div className="col-12 md:col-6">
        <InputText
          value={formData.dni || ''}
          onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
          placeholder="DNI de la persona"
          className="w-full"
        />
      </div>

      {/* Correo */}
      <div className="col-12 md:col-6">
        <InputText
        value={formData.correo || ''}
        onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
        placeholder="Correo de la persona"
        className="w-full"
        />
      </div>

      {/* Ruta */}
      <div className="col-12 md:col-6">
        <Dropdown
          value={rutaSeleccionadaId ?? null}
          options={rutasOptions}
          onChange={(e) => {
            setRutaSeleccionadaId(e.value as number);
            setViajeSeleccionadoId(null);
            setAsientoSeleccionadoId(null);
          }}
          placeholder="Ruta"
          className="w-full"
          required
        />
      </div>

      {/* Unidad / Viaje */}
      <div className="col-12 md:col-6">
        <Dropdown
          value={viajeSeleccionadoId ?? undefined}
          options={viajesOptions}
          onChange={(e) => {
            setViajeSeleccionadoId(e.value as number);
            setAsientoSeleccionadoId(null);
          }}
          placeholder="Unidad / viaje"
          className="w-full"
          required
          disabled={!rutaSeleccionadaId}
        />
      </div>

      {/* Asientos (solo viaje) */}
      {formData.tipo === 'viaje' && (
        <div className="col-12 md:col-6">
          <Dropdown
            value={asientoSeleccionadoId ?? null}
            options={asientosOptions}
            onChange={(e) => setAsientoSeleccionadoId(e.value as number)}
            placeholder="Asiento disponible"
            className="w-full"
            required
            disabled={!viajeSeleccionadoId}
          />
        </div>
      )}

      {/* Costo (solo encomienda) */}
      {formData.tipo === 'encomienda' && (
        <div className="col-12 md:col-6">
          <InputText
            value={String((formData as ReservacionEncomienda).costo ?? '')}
            onChange={(e) =>
              setFormData({
                ...(formData as ReservacionEncomienda),
                costo: Number(e.target.value),
              })
            }
            placeholder="Costo (Lps)"
            className="w-full"
            type="number"
            min="0"
            step="0.01"
            required
          />
        </div>
      )}

      {/* Fecha */}
      <div className="col-12 md:col-6">
        <Calendar
          value={formData.fecha ? new Date(formData.fecha) : new Date()}
          onChange={(e) => setFormData({ ...formData, fecha: e.value as Date })}
          dateFormat="dd/mm/yy"
          placeholder="Fecha"
          className="w-full"
          required
        />
      </div>

      {/* Botones */}
      <div className="col-12 flex flex-column md:flex-row justify-content-end gap-2 mt-3">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          onClick={onCancel}
          type="button"
          className="custom-button p-button-sm w-full md:w-auto"
        />
        <Button
          label="Guardar"
          icon="pi pi-check"
          type="submit"
          className="custom-button p-button-sm w-full md:w-auto"
        />
      </div>
    </form>
  );
}
