'use client';

import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { ReservacionBase, ReservacionViaje, ReservacionEncomienda } from './types';
import { useEffect, useState } from 'react';
import './FormReservacion.css';

/* Helper API */
async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

type ReservacionFormData = Partial<ReservacionViaje | ReservacionEncomienda>;

type FormProps = {
  initialData?: ReservacionBase;
  onSave: (data: ReservacionBase) => void;
  onCancel: () => void;
};

export default function FormReservacion({ initialData, onSave, onCancel }: FormProps) {
  const [formData, setFormData] = useState<Partial<ReservacionBase>>(
  initialData || { tipo: 'viaje', estado: 'pendiente', fecha: new Date(), dni: '' }
);

  const [rutasOptions, setRutasOptions] = useState<{ label: string; value: number }[]>([]);
  const [rutaSeleccionadaId, setRutaSeleccionadaId] = useState<number | null>(null);
  const [viajesOptions, setViajesOptions] = useState<{ label: string; value: number }[]>([]);
  const [viajeSeleccionadoId, setViajeSeleccionadoId] = useState<number | null>(null);
  const [asientosOptions, setAsientosOptions] = useState<{ label: string; value: number }[]>([]);
  const [asientoSeleccionadoId, setAsientoSeleccionadoId] = useState<number | null>(null);

  /* 🆕 Reaccionar a cambios de initialData */
  useEffect(() => {
    if (!initialData) return;
    setFormData({
      ...initialData,
      fecha: initialData.fecha ? new Date(initialData.fecha) : new Date(),
    });
  }, [initialData]);

  /* 🟩 Cargar rutas activas */
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

  /* 🟨 Cargar viajes por ruta */
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
        console.error('No se pudieron cargar las unidades por ruta:', err);
        setViajesOptions([]);
      }
    })();
  }, [rutaSeleccionadaId]);

  /* 🟦 Cargar asientos por viaje */
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

  /* 🧾 Guardar formulario */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.tipo === 'viaje' && !asientoSeleccionadoId) {
      alert('Debe seleccionar un asiento disponible.');
      return;
    }
    if (formData.tipo === 'encomienda' && !(formData as ReservacionEncomienda).costo) {
      alert('Debe ingresar el costo de la encomienda.');
      return;
    }
    if (!formData.dni) {
      alert('Debe ingresar el DNI de la persona.');
      return;
    }

    const payload = {
      dni: formData.dni,
      tipo: formData.tipo,
      id_viaje: viajeSeleccionadoId,
      id_asiento: asientoSeleccionadoId,
      id_encomienda: (formData as ReservacionEncomienda).id_encomienda ?? null,
      costo: (formData as ReservacionEncomienda).costo ?? null,
      fecha: formData.fecha,
      estado: formData.estado,
    };
    onSave(payload as ReservacionBase);
  };

  return (
    <form onSubmit={handleSubmit} className="p-fluid grid gap-3">
      <div className="col-12 md:col-6">
        <Dropdown
        value={formData.tipo}
        options={[
        { label: 'Viaje', value: 'viaje' },
        { label: 'Encomienda', value: 'encomienda' },
        ]}
        onChange={(e) => {
        const newTipo = e.value as 'viaje' | 'encomienda';
        if (newTipo === 'viaje') {
        setFormData({
        ...formData,
        tipo: newTipo,
        id_encomienda: null,
        costo: null,
      });
    } else {
      setFormData({
        ...formData,
        tipo: newTipo,
        id_viaje: null,
        id_asiento: null,
      });
    }
    setAsientosOptions([]);
    setAsientoSeleccionadoId(null);
  }}
  placeholder="Tipo de reservación"
  className="w-full"
/>

      </div>

      <div className="col-12 md:col-6">
        <InputText
          value={formData.dni || ''}
          onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
          placeholder="DNI de la persona"
          required
          className="w-full"
        />
      </div>

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

      {formData.tipo === 'encomienda' && (
        <div className="col-12 md:col-6">
          <InputText
            value={
              (formData as ReservacionEncomienda).costo
                ? String((formData as ReservacionEncomienda).costo)
                : ''
            }
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

      <div className="col-12 flex justify-content-end gap-2">
        <Button label="Cancelar" icon="pi pi-times" onClick={onCancel} type="button" className="custom-button" />
        <Button label="Guardar" icon="pi pi-check" type="submit" className="custom-button" />
      </div>
    </form>
  );
}
