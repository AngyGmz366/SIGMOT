"use client";
import { useEffect, useRef, useState } from "react"; // 🆕 (agregado useEffect + unificación de imports)
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
   🆕 Helpers mínimos HTTP
   - No rompen tu UI actual.
   - Sirven para llamar a tus endpoints sin cambiar componentes.
======================= */
async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" }); // 🆕 evita cache para ver datos recién insertados
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
async function apiDelete(url: string): Promise<void> {
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

export default function ReservacionesPage() {
  const [reservaciones, setReservaciones] = useState<ReservacionBase[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const toast = useRef<Toast>(null);

  /* =======================
     🆕 Carga inicial desde /api/reservas
     - Solo añade el fetching; si falla, tu tabla queda como antes (vacía) y tu UI actual no se rompe.
  ======================= */
  useEffect(() => {
    (async () => {
      try {
        // El endpoint devuelve { items: ReservacionBase[] }
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

  const handleSave = (data: ReservacionBase) => {
    // ✅ Se deja igual para NO afectar lo que ya funciona en tu frontend.
    if (editingId) {
      // Actualizar reservación existente (solo en memoria por ahora)
      setReservaciones((prev) => prev.map((r) => (r.id === editingId ? data : r)));
      showSuccess("Reservación actualizada correctamente");
    } else {
      // Crear nueva reservación (solo en memoria por ahora)
      const newReservation = {
        ...data,
        id: Date.now().toString(),
      };
      setReservaciones((prev) => [...prev, newReservation]);
      showSuccess("Reservación creada correctamente");
    }
    setShowForm(false);
  };

  /* =======================
     🆕 Eliminar contra API con fallback local
     - Intenta DELETE /api/reservas/:id
     - Si algo falla, elimina en memoria como ya lo hacías (no rompe tu flujo actual)
  ======================= */
  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/api/reservas/${encodeURIComponent(id)}`); // 🆕 llamada real a la API
      setReservaciones((prev) => prev.filter((r) => r.id !== id));
      showSuccess("Reservación eliminada correctamente");
    } catch (err) {
      console.error("Error eliminando en API, aplicando fallback local:", err);
      // 🔁 Fallback: mantiene tu comportamiento previo para no bloquear la UI
      setReservaciones((prev) => prev.filter((r) => r.id !== id));
      toast.current?.show({
        severity: "warn",
        summary: "Aviso",
        detail: "No se pudo eliminar en el servidor. Se aplicó eliminación local.",
        life: 3000,
      });
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
        onEdit={(id) => {
          setEditingId(id);
          setShowForm(true);
        }}
        onDelete={handleDelete} // 🆕 ahora intenta eliminar en API y mantiene fallback local
        onAdd={() => {
          setEditingId(null);
          setShowForm(true);
        }}
      />

      <Dialog
        visible={showForm}
        onHide={() => setShowForm(false)}
        header={editingId ? "Editar Reservación" : "Nueva Reservación"}
        style={{ width: "50vw" }}
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
      >
        <FormReservacion
          initialData={editingId ? reservaciones.find((r) => r.id === editingId) : undefined}
          onSave={handleSave} // ✅ sin cambios: conserva tu flujo actual
          onCancel={() => setShowForm(false)}
        />
      </Dialog>
    </div>
  );
}
