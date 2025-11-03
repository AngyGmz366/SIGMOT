'use client';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';

export default function RutaSelector({ formData, setFormData }: any) {
  const rutas = [
    { label: 'Tegucigalpa → San Pedro Sula', value: 'TGU-SPS' },
    { label: 'San Pedro Sula → Tegucigalpa', value: 'SPS-TGU' },
  ];

  const horas = ['08:00', '10:00', '12:00', '14:00', '16:00'];

  return (
    <div className="p-3 md:p-5 bg-white border-round-xl shadow-2">
      <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 text-center md:text-left">
        Selecciona tu ruta
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 🟣 Ruta */}
        <div className="col-span-1 sm:col-span-2">
          <label className="block mb-2 text-sm font-medium text-gray-700">Ruta</label>
          <Dropdown
            value={formData.ruta}
            options={rutas}
            onChange={(e) => setFormData({ ...formData, ruta: e.value })}
            placeholder="Seleccione una ruta"
            className="w-full"
          />
        </div>

        {/* 🟢 Fecha */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Fecha</label>
          <Calendar
            value={formData.fecha}
            onChange={(e) => setFormData({ ...formData, fecha: e.value as Date })}
            className="w-full"
            minDate={new Date()}
            dateFormat="dd/mm/yy"
          />
        </div>

        {/* 🔵 Hora */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Hora de salida</label>
          <Dropdown
            value={formData.hora}
            options={horas.map((h) => ({ label: h, value: h }))}
            onChange={(e) => setFormData({ ...formData, hora: e.value })}
            placeholder="Seleccione hora"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
