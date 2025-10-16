// app/(main)/admin/rutas-admin/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";

import RutasAdminTable from "./components/RutasAdminTable";
import FormularioRuta from "./components/FormularioRuta";
import { RutaUI } from "./components/types";

export default function PageAdminRutas() {
  const [rutas, setRutas] = useState<RutaUI[]>([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<RutaUI | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unidadesDisponibles, setUnidadesDisponibles] = useState<
    { id: number; nombre: string }[]
  >([]);
  const toast = useRef<Toast>(null);

  // 🔹 Notificaciones
  const showOk = (detail: string) =>
    toast.current?.show({ severity: "success", summary: "Éxito", detail, life: 3000 });
  const showErr = (detail: string) =>
    toast.current?.show({ severity: "error", summary: "Error", detail, life: 4000 });

  // 🔹 Cargar rutas desde la API
  const cargarRutas = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/rutas");
      const data = await res.json();

      if (!data.ok) throw new Error(data.error || "Error al cargar rutas");

      // Transformar datos - asegurar que horarios nunca sea null
      setRutas(
        (data.items ?? []).map((r: any) => ({
          id: r.id,
          origen: r.origen,
          destino: r.destino,
          estado: r.estado === "ACTIVA" ? "activo" : "inactivo",
          tiempoEstimado: r.tiempoEstimado,
          distancia: r.distancia ? Number(r.distancia) : null,
          descripcion: r.descripcion ?? "",
          precio: Number(r.precio ?? 0),
          horarios: Array.isArray(r.horarios) ? r.horarios : [],
          coordenadas: Array.isArray(r.coordenadas) ? r.coordenadas : [],
          unidades: r.unidades || [],
        }))
      );
    } catch (e: any) {
      console.error("❌ Error cargando rutas:", e);
      showErr(e.message || "No se pudieron cargar las rutas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRutas();
    cargarUnidades();
  }, []);

  // 🔹 Cargar unidades disponibles (adaptando la respuesta existente)
  const cargarUnidades = async () => {
    try {
      const res = await fetch("/api/unidades");
      const data = await res.json();
      
      // Transformar la respuesta al formato que espera el formulario
      const unidadesFormateadas = (data || []).map((u: any) => {
        // El endpoint puede devolver diferentes estructuras, manejamos ambas
        const id = u.Id_Unidad_PK || u.id;
        const nombre = u.Numero_Placa || u.nombre || `Unidad ${id}`;
        
        return {
          id: id,
          nombre: nombre
        };
      }).filter((u: any) => u.id); // Filtrar unidades válidas
      
      console.log("🔄 Unidades cargadas:", unidadesFormateadas);
      
      setUnidadesDisponibles(unidadesFormateadas);
    } catch (error) {
      console.error("Error al cargar unidades:", error);
      // En caso de error, cargar unidades de ejemplo para testing
      setUnidadesDisponibles([
        { id: 3, nombre: "HND5123" },
        { id: 11, nombre: "HND5060" },
        { id: 12, nombre: "HND2030" }
      ]);
    }
  };

  // 🔹 Función para cambiar el estado de una ruta
  const cambiarEstado = async (id: number, nuevoEstado: "activo" | "inactivo") => {
    try {
      setLoading(true);

      // Convertir 'activo' a 'ACTIVA' y 'inactivo' a 'INACTIVA' para la BD
      const estadoEnMayusculas = nuevoEstado === "activo" ? "ACTIVA" : "INACTIVA";

      const res = await fetch(`/api/rutas/${id}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: estadoEnMayusculas }),
      });
      
      const data = await res.json();
      
      if (data.ok) {
        showOk("Estado actualizado correctamente");
        await cargarRutas();
      } else {
        showErr(data.error || "Error al cambiar el estado");
      }
    } catch (error: any) {
      console.error("❌ Error cambiando estado:", error);
      showErr(error.message || "Error al cambiar el estado");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Abrir modal de creación
  const abrirCrear = () => {
    setRutaSeleccionada({
      id: 0,
      origen: "",
      destino: "",
      estado: "activo",
      tiempoEstimado: "00:00:00",
      distancia: null,
      descripcion: "",
      precio: null,
      horarios: [],
      coordenadas: [],
      unidades: [],
    });
    setMostrarModal(true);
  };

  // 🔹 Guardar ruta (crear o actualizar) - MODIFICADO
const onGuardar = async (val: RutaUI) => {
  try {
    setLoading(true);

    // Validar datos antes de enviar
    if (!val.origen?.trim() || !val.destino?.trim()) {
      showErr("Origen y destino son obligatorios");
      return;
    }

    const payload = {
      origen: val.origen.trim(),
      destino: val.destino.trim(),
      estado: val.estado === "activo" ? "ACTIVA" : "INACTIVA",
      tiempoEstimado: val.tiempoEstimado || "00:00:00",
      distancia: val.distancia || 0,
      descripcion: val.descripcion || "",
      precio: val.precio || 0,
      horarios: val.horarios || [],
      coordenadas: val.coordenadas || [],
      unidades: val.unidades || [],
    };

    console.log("📤 Enviando payload:", payload);

    let url = "/api/rutas";
    let method = "POST";

    if (val.id && val.id !== 0) {
      url = `/api/rutas/${val.id}/editar`;
      method = "PATCH";
    }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseText = await res.text();
    console.log("📨 Respuesta del servidor:", responseText);

    if (!responseText) {
      throw new Error("El servidor no respondió");
    }

    const data = JSON.parse(responseText);

    if (!res.ok || !data.ok) {
      throw new Error(data.error || `Error ${res.status}: ${res.statusText}`);
    }

    showOk(val.id ? "Ruta actualizada correctamente" : "Ruta creada correctamente");
    setMostrarModal(false);
    await cargarRutas();
    
  } catch (e: any) {
    console.error("❌ Error guardando ruta:", e);
    
    // Mensajes de error más específicos
    let errorMessage = "Error al guardar la ruta";
    
    if (e.message.includes("JSON")) {
      errorMessage = "Error en la respuesta del servidor";
    } else if (e.message.includes("duplicate") || e.message.includes("duplicad")) {
      errorMessage = "Ya existe una ruta con ese origen y destino";
    } else if (e.message.includes("foreign key") || e.message.includes("Unidad")) {
      errorMessage = "Error con las unidades asignadas - verifique que existan";
    } else {
      errorMessage = e.message;
    }
    
    showErr(errorMessage);
  } finally {
    setLoading(false);
  }
};

  // 🔹 Editar ruta (pasar datos al formulario)
  const onEditarRuta = (ruta: RutaUI) => {
    setRutaSeleccionada(ruta);
    setMostrarModal(true);
  };

  const cerrarFormulario = () => {
    setMostrarModal(false);
    setRutaSeleccionada(null);
  };

  return (
    <div className="p-4 space-y-6">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <h2 className="text-3xl font-bold text-gray-800">Gestión de Rutas</h2>
        <Button
          label="Nueva Ruta"
          icon="pi pi-plus"
          className="p-button-success"
          onClick={abrirCrear}
          disabled={loading}
        />
      </div>

      <Card>
        <RutasAdminTable
          rutas={rutas}
          loading={loading}
          onCambiarEstado={cambiarEstado}
          onEditarRuta={onEditarRuta}
        />
      </Card>

      <Dialog
        header={rutaSeleccionada && rutaSeleccionada.id !== 0 ? "Editar Ruta" : "Nueva Ruta"}
        visible={mostrarModal}
        onHide={cerrarFormulario}
        style={{ width: "50vw" }}
        breakpoints={{ "960px": "75vw", "640px": "100vw" }}
        modal
      >
        <FormularioRuta
          ruta={rutaSeleccionada}
          onCerrar={cerrarFormulario}
          onGuardar={onGuardar}
          loading={loading}
          unidadesDisponibles={unidadesDisponibles}
          unidadesAsignadas={rutaSeleccionada?.unidades ?? []}
        />
      </Dialog>
    </div>
  );
}