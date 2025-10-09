// FormReservacion.tsx
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { ReservacionBase } from './types';
import { ReservacionViaje, ReservacionEncomienda } from './types';
import { useEffect, useState } from 'react';
import './FormReservacion.css';

/* 🆕 Helpers HTTP para consumir tus APIs existentes (rutas y unidades) */
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

/* 🗑️ Eliminado: lista de unidades de ejemplo (ya no se usa) */
/*
const unidades = [
  { label: 'BUS-001 - Mercedes Benz', value: 'BUS-001' },
  { label: 'BUS-002 - Volvo', value: 'BUS-002' },
  { label: 'BUS-003 - Scania', value: 'BUS-003' }
];
*/

export default function FormReservacion({ initialData, onSave, onCancel }: FormProps) {
  const [formData, setFormData] = useState<ReservacionFormData>(
    initialData || { tipo: 'viaje', estado: 'pendiente', fecha: new Date() }
  );

  /* 🆕 Estado para opciones dinámicas de rutas y unidades (viajes) */
  const [rutasOptions, setRutasOptions] = useState<{ label: string; value: number }[]>([]);
  const [rutaSeleccionadaId, setRutaSeleccionadaId] = useState<number | null>(null);

  const [unidadesOptions, setUnidadesOptions] = useState<{ label: string; value: number }[]>([]);
  const [viajeSeleccionadoId, setViajeSeleccionadoId] = useState<number | null>(null);

  /* 🆕 Cargar rutas activas desde /api/rutas-activas al montar */
  useEffect(() => {
    (async () => {
      try {
        // Esperado desde tu API: { items: [{ id, label, value, ... }] }
        const data = await apiGet<{ items: { id: number; label: string; value: number }[] }>(
          '/api/rutas-activas'
        );
        const opts = (data.items || []).map((r) => ({ label: r.label, value: r.id ?? r.value }));
        setRutasOptions(opts);
      } catch (err) {
        console.error('No se pudieron cargar las rutas activas:', err);
        setRutasOptions([]);
      }
    })();
  }, []);

  /* 🆕 Cargar unidades disponibles (viajes) cuando cambia la ruta seleccionada */
  useEffect(() => {
    (async () => {
      if (!rutaSeleccionadaId) {
        setUnidadesOptions([]);
        setViajeSeleccionadoId(null);
        return;
      }
      try {
        // Esperado desde tu API: { items: [{ idViaje, idUnidad, unidad, fecha, horaSalida, horaLlegada }] }
        const data = await apiGet<{
          items: { idViaje: number; idUnidad: number; unidad: string; fecha: string; horaSalida: string }[];
        }>(`/api/unidades-por-ruta/${encodeURIComponent(String(rutaSeleccionadaId))}`);

        const opts = (data.items || []).map((u) => ({
          label: `${u.unidad} · salida ${String(u.horaSalida).slice(0, 5)}`,
          value: u.idViaje, // usamos el Id_Viaje_PK para identificar el viaje seleccionado
        }));
        setUnidadesOptions(opts);
        setViajeSeleccionadoId(null); // forzar selección explícita tras cambiar ruta
      } catch (err) {
        console.error('No se pudieron cargar las unidades por ruta:', err);
        setUnidadesOptions([]);
        setViajeSeleccionadoId(null);
      }
    })();
  }, [rutaSeleccionadaId]);

  /* ⬇️ Tu submit se queda igual (NO conectamos aquí a POST todavía, solo validamos que haya unidad) */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.unidad) {
      alert('Debe seleccionar una unidad');
      return;
    }
    onSave(formData as ReservacionBase);
  };

  return (
    <form onSubmit={handleSubmit} className="p-fluid grid gap-3">
      <div className="col-12">
        <Dropdown
          value={formData.tipo}
          options={[
            { label: 'Viaje', value: 'viaje' },
            { label: 'Encomienda', value: 'encomienda' }
          ]}
          onChange={(e) => setFormData({ ...formData, tipo: e.value })}
          placeholder="Tipo"
          className="w-full"
        />
      </div>

      <div className="col-12 md:col-6">
        <InputText
          value={formData.cliente || ''}
          onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
          placeholder="Cliente"
          className="w-full"
          required
        />
      </div>

      {/* 🗑️ Reemplazado: rutas de ejemplo → rutas desde API */}
      <div className="col-12 md:col-6">
        <Dropdown
          value={
            // encontramos el option cuyo label coincide con lo guardado en formData.ruta (para no romper tu UI)
            rutasOptions.find((o) => o.label === formData.ruta)?.value ?? null
          }
          options={rutasOptions}
          onChange={(e) => {
            const opt = rutasOptions.find((o) => o.value === e.value);
            setRutaSeleccionadaId(e.value as number);
            // guardamos el label en formData.ruta para mantener tu representación textual actual
            setFormData({ ...formData, ruta: opt?.label || '' });
            // al cambiar ruta, limpiamos la unidad elegida previamente
            setFormData((fd) => ({ ...fd, unidad: '' }));
            setViajeSeleccionadoId(null);
          }}
          placeholder="Ruta"
          className="w-full"
          required
        />
      </div>

      {/* 🗑️ Reemplazado: unidades de ejemplo → unidades por ruta desde API */}
      <div className="col-12 md:col-6">
        <Dropdown
          value={viajeSeleccionadoId ?? undefined}
          options={unidadesOptions}
          onChange={(e) => {
            const opt = unidadesOptions.find((o) => o.value === e.value);
            setViajeSeleccionadoId(e.value as number);
            // igual que con ruta, guardamos el label legible en formData.unidad (tu UI lo muestra como texto)
            setFormData({ ...formData, unidad: opt?.label || '' });
          }}
          placeholder="Seleccione la unidad"
          className="w-full"
          required
          disabled={!rutaSeleccionadaId || unidadesOptions.length === 0}
        />
      </div>

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

      {formData.tipo === 'viaje' ? (
        <div className="col-12">
          <InputText
            value={(formData as any).asiento || ''}
            onChange={(e) => setFormData({ ...formData, asiento: e.target.value })}
            placeholder="Asiento"
            className="w-full"
          />
        </div>
      ) : (
        <div className="col-12">
          <InputText
            value={
              ((formData as ReservacionEncomienda).peso !== undefined &&
                (formData as ReservacionEncomienda).peso !== null)
                ? String((formData as ReservacionEncomienda).peso)
                : ''
            }
            onChange={(e) =>
              setFormData({
                ...(formData as ReservacionEncomienda),
                peso: Number(e.target.value),
              })
            }
            placeholder="Peso (kg)"
            className="w-full"
            type="number"
          />
        </div>
      )}

      <div className="col-12 flex justify-content-end gap-2">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          onClick={onCancel}
          type="button"
          className="custom-button"
        />
        <Button
          label="Guardar"
          icon="pi pi-check"
          type="submit"
          className="custom-button"
        />
      </div>
    </form>
  );
}

/* ─────────────────────────────────────────────────────────────
   CAMBIOS HECHOS (sin romper lo que ya funciona):
   ✅ Quitadas las opciones de ejemplo de Rutas y Unidades.
   ✅ Añadida carga de RUTAS desde /api/rutas-activas y mapeo al Dropdown.
   ✅ Al seleccionar una ruta, se setea su ID interno para pedir UNIDADES a /api/unidades-por-ruta/:id.
   ✅ Unidades (viajes) se cargan dinámicamente; el value es el Id_Viaje_PK, 
      pero el texto legible se guarda en formData.unidad para mantener tu UI como estaba.
   ✅ No se modificó tu handleSubmit más allá de la validación ya existente.
   ───────────────────────────────────────────────────────────── */
