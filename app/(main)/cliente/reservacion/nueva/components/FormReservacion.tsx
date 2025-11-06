'use client';
import { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import AsientosBus from './AsientoSelector';
import Swal from 'sweetalert2';
import './FormReservacion.css';

type Option = { label: string; value: number | string };

interface FormData {
  tipo: 'viaje' | 'encomienda';
  ruta: Option | null;
  unidad: Option | null;
  fecha: Date;
  asiento: Option | null;
  peso?: number | null;
  precio?: number | null;
}

export default function FormReservacion() {
  const [formData, setFormData] = useState<FormData>({
    tipo: 'viaje',
    ruta: null,
    unidad: null,
    fecha: new Date(),
    asiento: null,
    peso: null,
    precio: null,
  });

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [unidadOptions, setUnidadOptions] = useState<Option[]>([]);
  const [asientoOptions, setAsientoOptions] = useState<Option[]>([]);

  // 🔹 Mantener ruta seleccionada
  useEffect(() => {
    const storedRuta = localStorage.getItem('rutaSeleccionada');
    if (storedRuta) {
      const ruta = JSON.parse(storedRuta);
      setFormData((prev) => ({
        ...prev,
        ruta: { label: ruta.nombre, value: ruta.idRuta },
        precio: ruta.precio || 0,
      }));
    }
  }, []);

  // 🔹 Cargar unidades
  useEffect(() => {
    const cargarUnidades = async () => {
      if (!formData.ruta?.value) return;
      try {
        const res = await fetch(`/api/unidades-por-rutas/${formData.ruta.value}`);
        if (!res.ok) throw new Error('No se pudieron cargar las unidades.');
        const data = await res.json();
        const opciones = (data.items || []).map((u: any) => {
          const idViaje =
            u.idViaje ?? u.idviaje ?? u.Id_Viaje_PK ?? u.Id_Viaje ?? null;
          const unidad =
            u.unidad ??
            u.Unidad ??
            `${u.Numero_Placa ?? ''} - ${u.Marca_Unidad ?? ''}`.trim();
          const horaSalida = u.horaSalida ?? u.Hora_Salida ?? u.hora_salida ?? '—';
          return {
            label: `${unidad}${horaSalida ? ` · salida ${horaSalida}` : ''}`,
            value: idViaje,
          };
        });
        setUnidadOptions(opciones);
      } catch (error) {
        console.error('❌ Error cargando unidades:', error);
        setUnidadOptions([]);
      }
    };
    cargarUnidades();
  }, [formData.ruta?.value]);

  // 🔹 Cargar asientos
  useEffect(() => {
    const cargarAsientos = async () => {
      if (!formData.unidad?.value) {
        setAsientoOptions([]);
        return;
      }
      try {
        const res = await fetch(`/api/asientos-por-viaje/${formData.unidad.value}`);
        if (!res.ok) throw new Error('No se pudieron cargar los asientos.');
        const data = await res.json();
        const opciones = (data.items || []).map((a: any) => ({
          label: `Asiento ${a.numero}`,
          value: a.id,
        }));
        setAsientoOptions(opciones);
      } catch (error) {
        console.error('❌ Error cargando asientos:', error);
        setAsientoOptions([]);
      }
    };
    cargarAsientos();
  }, [formData.unidad?.value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ruta) return alert('Debe seleccionar una ruta.');
    setShowConfirmDialog(true);
  };

  const handleCancelar = () => setShowConfirmDialog(false);

  // 🚌 Ejemplo de asientos
  const asientosDemo = Array.from({ length: 20 }, (_, i) => ({
    numero: i + 1,
    ocupado: i % 4 === 0,
  }));

  // 🔹 Reservar viaje
  const handleReservar = async () => {
    try {
      if (!formData.unidad?.value || !formData.asiento?.value) {
        Swal.fire({
          icon: 'warning',
          title: 'Faltan datos',
          text: 'Debes seleccionar una unidad y un asiento antes de continuar.',
          confirmButtonColor: '#6366F1',
        });
        return;
      }

      const fechaSQL = new Date(formData.fecha)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

      const payload = {
        idViaje: formData.unidad.value,
        idAsiento: formData.asiento.value,
        fecha: fechaSQL,
      };

      let headers: Record<string, string> = { 'Content-Type': 'application/json' };
      try {
        const { getAuth } = await import('firebase/auth');
        const firebaseAuth = getAuth();
        const user = firebaseAuth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (e) {
        console.warn('⚠️ No se pudo obtener token Firebase', e);
      }

      const res = await fetch('/api/clientes/reservas/viaje', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la reservación');

      Swal.fire({
        icon: 'success',
        title: '¡Reservación confirmada!',
        text: 'Tu reservación ha sido creada con éxito. Puedes consultarla en "Mis reservaciones".',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#6366F1',
      });

      setShowConfirmDialog(false);
      localStorage.removeItem('rutaSeleccionada');
      setFormData({
        tipo: 'viaje',
        ruta: null,
        unidad: null,
        fecha: new Date(),
        asiento: null,
        peso: null,
        precio: null,
      });
    } catch (err: any) {
      console.error('❌ Error en la reservación:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Ocurrió un error al reservar.',
        confirmButtonColor: '#6366F1',
      });
    }
  };

  return (
    <div className="form-wrapper">
      {/* 🟣 Encabezado */}
      <div className="header-reservacion flex flex-column sm:flex-row align-items-center gap-3 mb-5">
        <i className="pi pi-calendar-plus text-indigo-500 text-3xl" />
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 m-0 text-center sm:text-left">
            Nueva Reservación
          </h2>
          <p className="text-gray-500 text-sm mt-1 text-center sm:text-left">
            Complete los datos para registrar un viaje o una encomienda
          </p>
        </div>
      </div>

      {/* 🧩 Contenido dividido en columnas (ajustable) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 🟢 Columna izquierda (formulario) */}
        <div className="md:col-span-2">
          <div className="card-form p-3 md:p-5 border-round-xl shadow-2 bg-white">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Tipo */}
                <Dropdown
                  value={formData.tipo}
                  options={[
                    { label: 'Viaje', value: 'viaje' },
                    { label: 'Encomienda', value: 'encomienda' },
                  ]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tipo: e.value,
                      asiento: e.value === 'encomienda' ? null : formData.asiento,
                    })
                  }
                  placeholder="Tipo de reservación"
                  className="w-full"
                />

                {/* Ruta (bloqueada) */}
                <Dropdown
                  value={formData.ruta?.value ?? null}
                  options={
                    formData.ruta
                      ? [{ label: formData.ruta.label, value: formData.ruta.value }]
                      : []
                  }
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Ruta"
                  className="w-full"
                  disabled={!formData.ruta}
                />

                {/* Precio */}
                <div>
                  <label className="text-gray-700 text-sm font-medium block mb-1">
                    Precio del boleto
                  </label>
                  <input
                    type="text"
                    value={
                      formData.precio ? `L. ${formData.precio.toFixed(2)}` : 'No disponible'
                    }
                    readOnly
                    className="input-precio w-full"
                  />
                </div>

                {/* Unidad */}
                <Dropdown
                  value={formData.unidad?.value ?? null}
                  options={unidadOptions}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Unidad"
                  className="w-full"
                  onChange={(e) => {
                    const selectedOption = unidadOptions.find((opt) => opt.value === e.value);
                    setFormData({
                      ...formData,
                      unidad: selectedOption || null,
                      asiento: null,
                    });
                  }}
                  disabled={!formData.ruta}
                />

                {/* Asiento */}
                {formData.tipo === 'viaje' && (
                  <Dropdown
                    value={formData.asiento?.value ?? null}
                    options={asientoOptions}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Asiento disponible"
                    className="w-full"
                    onChange={(e) => {
                      const selectedOption = asientoOptions.find((opt) => opt.value === e.value);
                      setFormData({
                        ...formData,
                        asiento: selectedOption || null,
                      });
                    }}
                    disabled={!formData.unidad}
                  />
                )}
              </div>

              {/* Botón */}
              <div className="flex flex-column sm:flex-row justify-end gap-3 mt-4">
                <Button
                  label="Continuar"
                  type="submit"
                  className="custom-button p-button-sm w-full sm:w-auto"
                  disabled={!formData.ruta}
                />
              </div>
            </form>
          </div>

          {/* Políticas */}
          <div className="politicas mt-6 bg-gray-50 p-4 border-round-xl">
            <h3 className="text-gray-700 font-semibold text-sm mb-2">
              Políticas y recordatorios
            </h3>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>Confirmar reservación al menos 24 h antes del viaje.</li>
              <li>Presentarse 30 min antes de la salida.</li>
              <li>Encomiendas ≤ 30 kg, bien embaladas.</li>
              <li>La empresa no se responsabiliza por artículos frágiles.</li>
            </ul>
          </div>
        </div>

        {/* 🔵 Columna derecha (mapa o ilustración) */}
        <div className="panel-lateral p-3 md:p-0">
          {formData.tipo === 'viaje' ? (
            <AsientosBus asientos={asientosDemo} />
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-gray-500">
              <i className="pi pi-box text-5xl mb-3 text-indigo-400"></i>
              <p className="text-center text-sm px-4">
                Encomiendas no requieren selección de asientos.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 💬 Diálogo de confirmación */}
      <Dialog
        header="Confirmar reservación"
        visible={showConfirmDialog}
        style={{ width: '90%', maxWidth: '500px' }}
        modal
        onHide={() => setShowConfirmDialog(false)}
      >
        <div className="p-3 space-y-2 text-sm">
          <p><b>Tipo:</b> {formData.tipo === 'viaje' ? 'Viaje' : 'Encomienda'}</p>
          <p><b>Ruta:</b> {formData.ruta?.label ?? 'No seleccionada'}</p>
          <p><b>Unidad:</b> {formData.unidad?.label ?? 'No seleccionada'}</p>
          {formData.tipo === 'viaje' && (
            <p><b>Asiento:</b> {formData.asiento?.label ?? 'No seleccionado'}</p>
          )}
          <p><b>Precio:</b> {formData.precio ? `L. ${formData.precio.toFixed(2)}` : 'No disponible'}</p>
          <p><b>Fecha:</b> {new Date(formData.fecha).toLocaleDateString()}</p>
        </div>

        <div className="flex flex-column sm:flex-row justify-end gap-3 mt-4">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            className="custom-button p-button-sm w-full sm:w-auto"
            onClick={handleCancelar}
          />
          <Button
            label="Reservar"
            icon="pi pi-check"
            className="custom-button p-button-sm w-full sm:w-auto"
            onClick={handleReservar}
          />
        </div>
      </Dialog>
    </div>
  );
}
