"use client";
import { useState } from 'react';
import TablaReservaciones from './components/TablaReservaciones';
import FormReservacion from './components/FormReservacion';
import { Dialog } from 'primereact/dialog';
import { ReservacionBase } from './components/types';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

export default function ReservacionesPage() {
  const [reservaciones, setReservaciones] = useState<ReservacionBase[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const toast = useRef<Toast>(null);

  const handleSave = (data: ReservacionBase) => {
    if (editingId) {
      // Actualizar reservación existente
      setReservaciones(reservaciones.map(r => r.id === editingId ? data : r));
      showSuccess('Reservación actualizada correctamente');
    } else {
      // Crear nueva reservación
      const newReservation = {
        ...data,
        id: Date.now().toString(),
      };
      setReservaciones([...reservaciones, newReservation]);
      showSuccess('Reservación creada correctamente');
    }
    setShowForm(false);
  };


  

  const handleDelete = (id: string) => {
    setReservaciones(reservaciones.filter(r => r.id !== id));
    showSuccess('Reservación eliminada correctamente');
  };

  const showSuccess = (message: string) => {
    toast.current?.show({
      severity: 'success',
      summary: 'Éxito',
      detail: message,
      life: 3000
    });
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <TablaReservaciones
        reservaciones={reservaciones}
        onEdit={(id) => {  
          setEditingId(id);
          setShowForm(true);
        }}
        onDelete={handleDelete}
        onAdd={() => {
          setEditingId(null);
          setShowForm(true);
        }}
      />

      <Dialog
        visible={showForm}
        onHide={() => setShowForm(false)}
        header={editingId ? 'Editar Reservación' : 'Nueva Reservación'}
        style={{ width: '50vw' }}
        breakpoints={{ '960px': '75vw', '640px': '90vw' }}
      >
        <FormReservacion
          initialData={editingId ? reservaciones.find(r => r.id === editingId) : undefined}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      </Dialog>
    </div>
  );
}