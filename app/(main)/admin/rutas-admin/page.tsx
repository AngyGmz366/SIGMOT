"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";
import dynamic from "next/dynamic";

import RutasAdminTable, { RutaUI } from "./components/RutasAdminTable";
import FormularioRuta from "./components/FormularioRuta";

// ✅ Carga dinámica del mapa (evita errores SSR)
const MapaInteractivo = dynamic(
  () => import("@/app/(main)/cliente/rutas/components/MapaInteractivo"),
  { ssr: false }
);

export default function PageAdminRutas() {
  const [rutas, setRutas] = useState<RutaUI[]>([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<RutaUI | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [loading, setLoading] = useState(false);
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

      // ✅ Transformar datos y evitar errores en JSON
      setRutas(
        (data.items ?? []).map((r: any) => ({
          id: r.id,
          origen: r.origen,
          destino: r.destino,
          estado: r.estado === "ACTIVA" ? "activo" : "inactivo",
          tiempoEstimado: r.tiempoEstimado,
          distancia: r.distancia,
          descripcion: r.descripcion ?? "",
          precio: Number(r.precio ?? 0),
          horarios: Array.isArray(r.horarios)
            ? r.horarios
            : typeof r.horarios === "string"
            ? (() => {
                try {
                  return JSON.parse(r.horarios);
                } catch {
                  return [];
                }
              })()
            : [],
          coordenadas: Array.isArray(r.coordenadas)
            ? r.coordenadas
            : typeof r.coordenadas === "string"
            ? (() => {
                try {
                  return JSON.parse(r.coordenadas);
                } catch {
                  return [];
                }
              })()
            : [],
        }))
      );
    } catch (e: any) {
      showErr(e.message || "No se pudieron cargar las rutas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRutas();
  }, []);

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
    });
    setMostrarModal(true);
  };

  // 🔹 Guardar ruta (crear o actualizar)
  const onGuardar = async (val: RutaUI) => {
    try {
      setLoading(true);

      const payload = {
        origen: val.origen,
        destino: val.destino,
        estado: val.estado === "activo" ? "ACTIVA" : "INACTIVA",
        tiempoEstimado: val.tiempoEstimado ?? "00:00:00",
        distancia: val.distancia ?? 0,
        descripcion: val.descripcion ?? null,
        precio: val.precio ?? 0,
        horarios: val.horarios ?? [],
        coordenadas: val.coordenadas ?? [],
      };

      const res = await fetch("/api/rutas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.ok) throw new Error(data.error || "Error al guardar ruta");
      showOk("Ruta creada correctamente");

      setMostrarModal(false);
      await cargarRutas();
    } catch (e: any) {
      showErr(e.message || "Error al guardar la ruta");
    } finally {
      setLoading(false);
    }
  };

  const cerrarFormulario = () => {
    setMostrarModal(false);
    setRutaSeleccionada(null);
  };

  // === Render principal ===
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
        />
      </div>

      <Card>
        <RutasAdminTable rutas={rutas} loading={loading} />
      </Card>

      {/* 🧭 Modal de creación / edición */}
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
        />

        {/* ✅ Vista previa solo al editar */}
        {rutaSeleccionada && rutaSeleccionada.id !== 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Vista previa en el mapa</h3>
            <MapaInteractivo
              ruta={{
                id: rutaSeleccionada.id,
                nombre: `${rutaSeleccionada.origen} → ${rutaSeleccionada.destino}`,
                origen: rutaSeleccionada.origen,
                destino: rutaSeleccionada.destino,
                estado: "activo",
                tiempoEstimado: rutaSeleccionada.tiempoEstimado ?? "",
                coordenadas: rutaSeleccionada.coordenadas ?? [],
                paradas: [],
              }}
            />
          </div>
        )}
      </Dialog>
    </div>
  );
}
