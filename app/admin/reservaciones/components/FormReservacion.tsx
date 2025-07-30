import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { ReservacionBase } from './types';
import { ReservacionViaje, ReservacionEncomienda } from './types';
import { useState } from 'react';

type ReservacionFormData = Partial<ReservacionViaje | ReservacionEncomienda>;

type FormProps = {
  initialData?: ReservacionBase;
  onSave: (data: ReservacionBase) => void;
  onCancel: () => void;
};

const unidades = [
  { label: 'BUS-001 - Mercedes Benz', value: 'BUS-001' },
  { label: 'BUS-002 - Volvo', value: 'BUS-002' },
  { label: 'BUS-003 - Scania', value: 'BUS-003' }
];

export default function FormReservacion({ initialData, onSave, onCancel }: FormProps) {
  const [formData, setFormData] = useState<ReservacionFormData>(initialData || {
    tipo: 'viaje',
    estado: 'pendiente',
    fecha: new Date()
  });

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

      <div className="col-12 md:col-6">
        <Dropdown
          value={formData.ruta}
          options={[
          { label: 'Tegucigalpa-San Pedro Sula', value: 'Tegucigalpa-San Pedro Sula' },
          { label: 'San Pedro Sula-Tegucigalpa', value: 'San Pedro Sula-Tegucigalpa' }
          ]}
          onChange={(e) => setFormData({ ...formData, ruta: e.value })}
          placeholder="Ruta"
          className="w-full"
          required
  />
</div>


      <div className="col-12 md:col-6">
        <Dropdown
          value={formData.unidad}
          options={unidades}
          onChange={(e) => setFormData({ ...formData, unidad: e.value })}
          placeholder="Seleccione la unidad"
          className="w-full"
          required
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
            value={(formData as any).peso || ''}
            onChange={(e) => setFormData({ ...formData, peso: Number(e.target.value) })}
            placeholder="Peso (kg)"
            className="w-full"
            type="number"
          />
        </div>
      )}

      <div className="col-12 flex justify-content-end gap-2">

        <Button 
          label="Cancelar" 
          severity="secondary" 
          onClick={onCancel} 
          type="button"
        />
        <Button 
          label="Guardar" 
          type="submit" 
          className="p-button-success"
        />
      </div>
    </form>

        

  );
}