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
  const [localidades, setLocalidades] = useState<any[]>([]);
  const toast = useRef<Toast>(null);

  // ✅ Toast helpers
  const showOk = (detail: string) =>
    toast.current?.show({ severity: "success", summary: "Éxito", detail, life: 3000 });
  const showErr = (detail: string) =>
    toast.current?.show({ severity: "error", summary: "Error", detail, life: 4000 });

  // ✅ Cargar rutas
  const cargarRutas = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/rutas");
      const data = await res.json();

      if (!data.ok) throw new Error(data.error || "Error al cargar rutas");

      const rutasData = data.data || [];
      
      setRutas(
        rutasData.map((r: any) => ({
          id: r.Id_Ruta_PK || r.id,
          origen: r.Origen || r.origen,
          destino: r.Destino || r.destino,
          estado: (r.Estado === "ACTIVA" ? "activo" : "inactivo") as "activo" | "inactivo",
          tiempoEstimado: r.Tiempo_Estimado || r.tiempoEstimado,
          distancia: r.Distancia ? Number(r.Distancia) : null,
          descripcion: r.Descripcion ?? "",
          precio: Number(r.Precio ?? 0),
          horarios: Array.isArray(r.Horarios) ? r.Horarios : 
                   (typeof r.Horarios === 'string' ? JSON.parse(r.Horarios) : []),
          coordenadas: Array.isArray(r.Coordenadas) ? r.Coordenadas : 
                      (typeof r.Coordenadas === 'string' ? JSON.parse(r.Coordenadas) : []),
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

  // ✅ Cargar unidades
  const cargarUnidades = async () => {
    try {
      const res = await fetch("/api/unidades");
      const data = await res.json();
      const unidadesFormateadas = (data || [])
        .map((u: any) => ({
          id: u.Id_Unidad_PK || u.id,
          nombre: u.Numero_Placa || u.nombre || `Unidad ${u.Id_Unidad_PK}`,
        }))
        .filter((u: any) => u.id);
      setUnidadesDisponibles(unidadesFormateadas);
    } catch (error) {
      console.error("Error al cargar unidades:", error);
      setUnidadesDisponibles([
        { id: 3, nombre: "HND5123" },
        { id: 11, nombre: "HND5060" },
        { id: 12, nombre: "HND2030" },
      ]);
    }
  };

  // ✅ Cargar localidades - CORREGIDO
  const cargarLocalidades = async () => {
    try {
      const res = await fetch("/api/localidades");
      const data = await res.json();

      if (!data.ok) throw new Error(data.error || "Error en API localidades");

      const lista = data.items || [];
      
      if (lista.length > 0) {
        setLocalidades(lista);
      } else {
        throw new Error("No se encontraron localidades");
      }
    } catch (e: any) {
      console.error("⚠️ No se pudieron cargar localidades:", e);
      
      // Datos de fallback
      setLocalidades([
        { id: 1, nombre: "Tegucigalpa", departamento: "Francisco Morazán", lat: 14.0818, lng: -87.2068 },
        { id: 2, nombre: "San Pedro Sula", departamento: "Cortés", lat: 15.5000, lng: -88.0333 },
        { id: 3, nombre: "La Ceiba", departamento: "Atlántida", lat: 15.7833, lng: -86.8000 }
      ]);
      
      showErr("Error al cargar localidades - Usando datos de demostración");
    }
  };

  // ✅ Cargar datos iniciales - CORREGIDO (sin cambios extras)
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setLoading(true);
        await cargarRutas();
        await cargarUnidades();
        await cargarLocalidades();
      } catch (error) {
        console.error("Error cargando datos iniciales:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  // ✅ Cambiar estado
  const cambiarEstado = async (id: number, nuevoEstado: "activo" | "inactivo") => {
    try {
      setLoading(true);
      const estadoEnMayusculas = nuevoEstado === "activo" ? "ACTIVA" : "INACTIVA";
      const res = await fetch(`/api/rutas/${id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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

  // ✅ Crear ruta
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

  // ✅ Guardar ruta - CORREGIDO (solo el payload necesario)
 
const onGuardar = async (val: RutaUI) => {
  try {
    setLoading(true);

    if (!val.origen?.trim() || !val.destino?.trim()) {
      showErr("Origen y destino son obligatorios");
      return;
    }

    const payload = {
      distancia: val.distancia || 0,
      tiempo_estimado: val.tiempoEstimado || "00:00:00",
      origen: val.origen.trim(),
      destino: val.destino.trim(),
      descripcion: val.descripcion || "",
      estado: val.estado === "activo" ? "ACTIVA" : "INACTIVA",
      precio: val.precio || 0,
      horarios: val.horarios || [],
      unidades: val.unidades || [], // ✅ AGREGAR unidades al payload
    };

    console.log("📤 Enviando payload CON UNIDADES:", payload);

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

    const text = await res.text();
    const data = JSON.parse(text);

    if (!res.ok || !data.ok) {
      throw new Error(data.error || "Error al guardar la ruta");
    }

    showOk(val.id ? "Ruta actualizada correctamente" : "Ruta creada correctamente");
    setMostrarModal(false);
    await cargarRutas();
  } catch (e: any) {
    console.error("❌ Error guardando ruta:", e);
    showErr(e.message || "Error al guardar la ruta");
  } finally {
    setLoading(false);
  }
};
  // ✅ Editar ruta
  const onEditarRuta = (ruta: RutaUI) => {
    setRutaSeleccionada(ruta);
    setMostrarModal(true);
  };

  const cerrarFormulario = () => {
    setMostrarModal(false);
    setRutaSeleccionada(null);
  };

  // ✅ Render (sin cambios)
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
        header={
          rutaSeleccionada && rutaSeleccionada.id !== 0
            ? "Editar Ruta"
            : "Nueva Ruta"
        }
        visible={mostrarModal}
        onHide={cerrarFormulario}
        style={{ width: "60vw" }}
        breakpoints={{ "960px": "80vw", "640px": "100vw" }}
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