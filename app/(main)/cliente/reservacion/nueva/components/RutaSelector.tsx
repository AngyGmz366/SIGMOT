'use client';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';

export default function RutaSelector({ formData, setFormData }: any) {
  const rutas = [
    { label: 'Tegucigalpa → San Pedro Sula', value: 'TGU-SPS' },
    { label: 'San Pedro Sula → Tegucigalpa', value: 'SPS-TGU' }
  ];

  const horas = ['08:00', '10:00', '12:00', '14:00', '16:00'];

  return (
    <>
      <div>
        <label className="block mb-2 font-medium">Ruta</label>
        <Dropdown
          value={formData.ruta}
          options={rutas}
          onChange={(e) => setFormData({...formData, ruta: e.value})}
          placeholder="Seleccione una ruta"
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 font-medium">Fecha</label>
          <Calendar
            value={formData.fecha}
            onChange={(e) => setFormData({...formData, fecha: e.value as Date})}
            className="w-full"
            minDate={new Date()}
            dateFormat="dd/mm/yy"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Hora</label>
          <Dropdown
            value={formData.hora}
            options={horas.map(h => ({label: h, value: h}))}
            onChange={(e) => setFormData({...formData, hora: e.value})}
            placeholder="Seleccione hora"
            className="w-full"
          />
        </div>
      </div>
    </>
  );
}