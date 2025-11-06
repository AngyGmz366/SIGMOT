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

/* Helpers HTTP */
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
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error al guardar");
  return json;
}
async function apiPut<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error al actualizar");
  return json;
}

/* Componente principal */
export default function ReservacionesPage() {
  const [reservaciones, setReservaciones] = useState<ReservacionBase[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReserva, setEditingReserva] = useState<ReservacionBase | null>(null);
  const toast = useRef<Toast>(null);

  /* 🔁 Función para recargar la lista */
  const cargarReservaciones = async () => {
    try {
      const data = await apiGet<{ items: ReservacionBase[] }>("/api/reservas?limit=50");
      setReservaciones(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      console.error("Error cargando reservaciones:", err);
      showToast("warn", "No se pudieron cargar las reservaciones.");
    }
  };

  useEffect(() => {
    cargarReservaciones();
  }, []);

  /* Guardar */
  const handleSave = async (data: ReservacionBase) => {
    try {
      if (!data.tipo) data.tipo = "viaje";
      if (!data.dni) throw new Error("El DNI es obligatorio");

      const cleanData = {
        ...data,
        fecha: data.fecha ? new Date(data.fecha).toISOString() : new Date().toISOString(),
      };

      if (editingReserva && editingReserva.id) {
        await apiPut(`/api/reservas/${encodeURIComponent(editingReserva.id)}`, cleanData);
        showToast("success", "Reservación actualizada correctamente");
      } else {
        await apiPost("/api/reservas", cleanData);
        showToast("success", "Reservación creada correctamente");
      }

      await cargarReservaciones();
    } catch (err: any) {
      console.error("Error guardando reservación:", err);
      showToast("error", err.message || "No se pudo guardar la reservación.");
    } finally {
      setShowForm(false);
      setEditingReserva(null);
    }
  };

  /* Eliminar */
  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/api/reservas/${encodeURIComponent(id)}`);
      showToast("success", "Reservación eliminada correctamente");
      await cargarReservaciones();
    } catch (err: any) {
      console.error("Error eliminando reservación:", err);
      showToast("error", err.message || "No se pudo eliminar la reservación.");
    }
  };

  const showToast = (severity: "success" | "error" | "warn", message: string) => {
    toast.current?.show({ severity, summary: severity.toUpperCase(), detail: message, life: 3000 });
  };

  return (
    <div className="p-3 md:p-5 w-full">
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mb-3 flex-column md:flex-row gap-3">
        <h2 className="text-center md:text-left text-xl md:text-2xl font-semibold">
          Gestión de Reservaciones
        </h2>
      </div>

      <TablaReservaciones
        reservaciones={reservaciones}
        onDelete={handleDelete}
        onAdd={async (reserva) => {
          if (reserva) {
            try {
              const full = await apiGet<ReservacionBase>(`/api/reservas/${reserva.id}`);
              setEditingReserva(full);
              setShowForm(true);
            } catch {
              showToast("error", "No se pudo obtener el detalle de la reserva.");
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
        style={{ width: "50vw", maxWidth: "800px" }}
        breakpoints={{ "960px": "75vw", "640px": "95vw" }}
      >
        <FormReservacion
          initialData={editingReserva ?? undefined}
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
