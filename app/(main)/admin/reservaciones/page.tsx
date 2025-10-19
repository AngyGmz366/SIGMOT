"use client";
import { useEffect, useRef, useState } from "react";
import TablaReservaciones from "./components/TablaReservaciones";
import FormReservacion from "./components/FormReservacion";
import { Dialog } from "primereact/dialog";
import { ReservacionBase } from "./components/types";
import { Toast } from "primereact/toast";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

/* =======================
   🔗 Helpers HTTP
======================= */
async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiDelete(url: string): Promise<void> {
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

async function apiPost<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPut<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* =======================
   🌐 Componente principal
======================= */
export default function ReservacionesPage() {
  const [reservaciones, setReservaciones] = useState<ReservacionBase[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReserva, setEditingReserva] = useState<ReservacionBase | null>(null);
  const toast = useRef<Toast>(null);

  /* 🟢 Carga inicial */
  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<{ items: ReservacionBase[] }>("/api/reservas?limit=50");
        setReservaciones(Array.isArray(data?.items) ? data.items : []);
      } catch (err) {
        console.error("Error cargando reservaciones:", err);
        toast.current?.show({
          severity: "warn",
          summary: "Aviso",
          detail: "No se pudieron cargar las reservaciones desde el servidor.",
          life: 3000,
        });
      }
    })();
  }, []);

  /* 🟡 Crear o editar */
  const handleSave = async (data: ReservacionBase) => {
    try {

      if (data.tipo === 'viaje') {
      data.id_encomienda = null;
      data.costo = null;
    } else if (data.tipo === 'encomienda') {
      data.id_viaje = null;
      data.id_asiento = null;
    }

      if (editingReserva && editingReserva.id && !data.dni) {
      data.dni = editingReserva.dni;
    }

    // 'id_encomienda' is not declared on ReservacionBase; use a narrow any-cast only for that property access
    if (editingReserva && editingReserva.id && data.tipo === 'encomienda' && !(data as any).id_encomienda) {
      (data as any).id_encomienda = (editingReserva as any).id_encomienda ?? editingReserva.id;
    }

      if (editingReserva && editingReserva.id) {
        // 🔁 Actualizar
        await apiPut(`/api/reservas/${encodeURIComponent(editingReserva.id)}`, data);
        setReservaciones((prev) =>
          prev.map((r) => (r.id === editingReserva.id ? { ...r, ...data } : r))
        );
        showSuccess("Reservación actualizada correctamente");
      } else {
        // 🆕 Crear
        const res = await apiPost<{ id: string }>("/api/reservas", data);
        const nueva = { ...data, id: res.id || Date.now().toString() };
        setReservaciones((prev) => [...prev, nueva]);
        showSuccess("Reservación creada correctamente");
      }
    } catch (err) {
      console.error("Error guardando reservación:", err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo guardar la reservación. Verifique los datos.",
        life: 3000,
      });
    } finally {
      setShowForm(false);
      setEditingReserva(null); // 🔹 Limpia modo edición
    }
  };

  /* 🔴 Eliminar */
  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/api/reservas/${encodeURIComponent(id)}`);
      setReservaciones((prev) => prev.filter((r) => r.id !== id));
      showSuccess("Reservación eliminada correctamente");
    } catch (err) {
      console.error("Error eliminando en API:", err);
      toast.current?.show({
        severity: "warn",
        summary: "Aviso",
        detail: "No se pudo eliminar en el servidor. Se eliminó localmente.",
        life: 3000,
      });
      setReservaciones((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const showSuccess = (message: string) => {
    toast.current?.show({
      severity: "success",
      summary: "Éxito",
      detail: message,
      life: 3000,
    });
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />

      <TablaReservaciones
        reservaciones={reservaciones}
        onDelete={handleDelete}
        onAdd={async (reserva) => {
  if (reserva) {
    try {
      // 🔹 Llama al detalle para obtener todos los datos (dni, ids, etc.)
      const full = await apiGet<ReservacionBase>(`/api/reservas/${reserva.id}`);
      setEditingReserva(full); // 👈 aquí guardas la versión completa
      setShowForm(true);
    } catch (err) {
      console.error('Error obteniendo detalle de la reserva:', err);
    }
  } else {
    setEditingReserva(null);
    setShowForm(true);
  }
}}

      />

      <Dialog
        visible={showForm}
        onHide={() => {
          setShowForm(false);
          setEditingReserva(null);
        }}
        header={editingReserva ? "Editar Reservación" : "Nueva Reservación"}
        style={{ width: "50vw" }}
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
      >
        <FormReservacion
          initialData={editingReserva ?? undefined} // 👈 pasa la reserva completa
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingReserva(null);
          }}
        />
      </Dialog>
    </div>
  );
}
