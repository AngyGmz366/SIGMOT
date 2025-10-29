'use client';
import { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import AsientosBus from './AsientoSelector';
import Swal from 'sweetalert2';
import './FormReservacion.css';

type Option = {
  label: string;
  value: number | string;
};

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

//Cargar unidades
useEffect(() => {
  const cargarUnidades = async () => {
    if (!formData.ruta?.value) return;

    try {
      const res = await fetch(`/api/unidades-por-rutas/${formData.ruta.value}`);
      if (!res.ok) throw new Error('No se pudieron cargar las unidades.');

      const data = await res.json();
      if (!data.items) return;

      // 🧩 Normalizar los datos devueltos por la API
      const opciones = data.items.map((u: any) => {
        // Acepta diferentes nombres de campos según la API o SP
        const idViaje =
          u.idViaje ?? u.idviaje ?? u.Id_Viaje_PK ?? u.Id_Viaje ?? null;
        const unidad =
          u.unidad ??
          u.Unidad ??
          `${u.Numero_Placa ?? ''} - ${u.Marca_Unidad ?? ''}`.trim();
        const horaSalida =
          u.horaSalida ??
          u.Hora_Salida ??
          u.hora_salida ??
          '—';

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

// 🔹 Cargar asientos cuando cambia la unidad seleccionada
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
      if (!data.items) return;

      // Mapear resultados en formato { label, value }
      const opciones = data.items.map((a: any) => ({
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

    // ✅ Formato de fecha compatible con MySQL
    const fechaSQL = new Date(formData.fecha)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    const payload = {
      idViaje: formData.unidad.value,
      idAsiento: formData.asiento.value,
      fecha: fechaSQL,
    };

    const res = await fetch('/api/clientes/reservas/viaje', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Error al crear la reservación');

    // ✅ Mostrar mensaje bonito de éxito
    Swal.fire({
      icon: 'success',
      title: '¡Reservación confirmada!',
      text: 'Tu reservación ha sido creada con éxito. Puedes consultarla en "Mis reservaciones".',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#6366F1',
      backdrop: `
        rgba(0,0,0,0.4)
        url("/assets/confetti.gif")
        center top
        no-repeat
      `,
    });

    // Limpiar datos
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

  const handleCancelar = () => setShowConfirmDialog(false);

  // 🚌 Mapa ilustrativo (solo se muestra si tipo = viaje)
  const asientosDemo = Array.from({ length: 20 }, (_, i) => ({
    numero: i + 1,
    ocupado: i % 4 === 0, // algunos aleatorios "ocupados"
  }));

  return (
    <div className="form-wrapper">
      {/* 🟣 Encabezado */}
      <div className="header-reservacion">
        <i className="pi pi-calendar-plus text-indigo-500 text-3xl mr-2" />
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 m-0">
            Nueva Reservación
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Complete los datos para registrar un viaje o una encomienda
          </p>
        </div>
      </div>

      {/* 🧩 Contenido dividido en dos columnas */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Columna izquierda: Formulario */}
        <div className="md:col-span-2">
          <div className="card-form">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tipo */}
                <div>
                  <Dropdown
                    value={formData.tipo}
                    options={[
                      { label: 'Viaje', value: 'viaje' },
                      { label: 'Encomienda', value: 'encomienda' },
                    ]}
                    onChange={(e) => {
                      const tipo = e.value as FormData['tipo'];
                      setFormData({
                        ...formData,
                        tipo,
                        asiento: tipo === 'encomienda' ? null : formData.asiento,
                      });
                    }}
                    placeholder="Tipo de reservación"
                    className="w-full input-std"
                  />
                </div>

                {/* Ruta (preseleccionada y bloqueada) */}
              <div>
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
                  className="w-full input-std"
                  disabled={!formData.ruta}
                />
            </div>

            {/* Precio (solo lectura) */}
            <div>
              <label className="text-gray-700 text-sm font-medium block mb-1">Precio del boleto</label>
              <input
                type="text"
                value={formData.precio ? `L. ${formData.precio.toFixed(2)}` : 'No disponible'}
                readOnly
                className="input-precio"
                />
            </div>

                {/* Unidad */}
                <div>
                  <Dropdown
                  value={formData.unidad?.value ?? null}
                  options={unidadOptions}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Unidad"
                  className="w-full input-std"
                  onChange={(e) => {
                  const selectedOption = unidadOptions.find(opt => opt.value === e.value);
                  setFormData({
                  ...formData,
                  unidad: selectedOption || null,
                  asiento: null,
                  });
                  }}
                  disabled={!formData.ruta}
                />

              </div>

                {/* Asiento (solo si tipo = viaje) */}
                {formData.tipo === 'viaje' && (
              <div>
                <Dropdown
                value={formData.asiento?.value ?? null}
                options={asientoOptions}
                optionLabel="label"
                optionValue="value"
                placeholder="Asiento disponible"
                className="w-full input-std"
                onChange={(e) => {
                const selectedOption = asientoOptions.find(opt => opt.value === e.value);
                setFormData({
                ...formData,
                asiento: selectedOption || null, // ✅ guarda el objeto completo
                });
                }}
                disabled={!formData.unidad}
                />
              </div>
              )}
              </div>

              {/* Botón continuar */}
              <div className="flex justify-end mt-4">
                <Button
                  label="Continuar"
                  type="submit"
                  className="custom-button"
                  disabled={!formData.ruta}
                />
              </div>
            </form>
          </div>

          {/* 🟤 Bloque de políticas */}
          <div className="politicas mt-6">
            <h3 className="text-gray-700 font-semibold text-sm mb-2">
              Políticas y recordatorios
            </h3>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>
                Las reservaciones deben confirmarse al menos 24 horas antes del
                viaje.
              </li>
              <li>
                El cliente debe presentarse 30 minutos antes de la hora de salida.
              </li>
              <li>
                Encomiendas no deben superar los 30 kg y deben estar debidamente
                embaladas.
              </li>
              <li>
                La empresa no se hace responsable por artículos frágiles sin
                aviso previo.
              </li>
            </ul>
          </div>
        </div>

        {/* 🟣 Columna derecha: Mapa del bus (solo ilustrativo) */}
        <div className="panel-lateral">
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
  <div className="p-3 space-y-2">
    <p>
      <b>Tipo:</b> {formData.tipo === 'viaje' ? 'Viaje' : 'Encomienda'}
    </p>
    <p>
      <b>Ruta:</b> {formData.ruta?.label ?? 'No seleccionada'}
    </p>
    <p>
      <b>Unidad:</b> {formData.unidad?.label ?? 'No seleccionada'}
    </p>
    {formData.tipo === 'viaje' && (
      <p>
        <b>Asiento:</b> {formData.asiento?.label ?? 'No seleccionado'}
      </p>
    )}
      <p>
        <b>Precio:</b>{' '}
        {formData.precio ? `L. ${formData.precio.toFixed(2)}` : 'No disponible'}
      </p>

    <p>
      <b>Fecha:</b>{' '}
      {formData.fecha
        ? new Date(formData.fecha).toLocaleDateString()
        : 'Sin fecha'}
    </p>
  </div>

  <div className="flex justify-end gap-3 mt-4">
    <Button
      label="Cancelar"
      icon="pi pi-times"
      className="custom-button"
      onClick={handleCancelar}
    />
    <Button
      label="Reservar"
      icon="pi pi-check"
      className="custom-button"
      onClick={handleReservar}
    />
  </div>
</Dialog>

    </div>
  );
}
