// app/(main)/admin/rutas-admin/components/FormularioRuta.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputTextarea } from "primereact/inputtextarea";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { RutaUI, UnidadAsignada } from "./types";

type Localidad = {
  id: number;
  nombre: string;
  departamento?: string | null;
  lat: number;
  lng: number;
};

interface FormularioRutaProps {
  ruta: RutaUI | null;
  onGuardar: (ruta: RutaUI) => void;
  onCerrar: () => void;
  loading?: boolean;
  unidadesDisponibles: { id: number; nombre: string }[];
  unidadesAsignadas: number[];
}

const FormularioRuta: React.FC<FormularioRutaProps> = ({
  ruta,
  onGuardar,
  onCerrar,
  loading,
  unidadesDisponibles,
}) => {
  // ---------- Estado base ----------
  const [formData, setFormData] = useState<RutaUI>({
    id: 0,
    origen: "",
    destino: "",
    estado: "activo",
    tiempoEstimado: "00:00:00",
    distancia: null,
    descripcion: "",
    precio: 0,
    horarios: [],
    coordenadas: [],
    unidades: [],
  });

  // 3 slots fijos de unidad+horario
  const [asignaciones, setAsignaciones] = useState<UnidadAsignada[]>([
    { unidadId: 0, horario: "", nombreUnidad: "Seleccione unidad", index: 0 },
    { unidadId: 0, horario: "", nombreUnidad: "Seleccione unidad", index: 1 },
    { unidadId: 0, horario: "", nombreUnidad: "Seleccione unidad", index: 2 },
  ]);

  // Localidades (Honduras)
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const opcionesLocalidades = useMemo(
    () =>
      localidades.map((l) => ({
        label: l.departamento ? `${l.nombre} — ${l.departamento}` : l.nombre,
        value: l.nombre, // guardamos el nombre en Origen/Destino (como ya usas en BD)
      })),
    [localidades]
  );

  // ---------- Carga inicial ----------
 // En FormularioRuta.tsx - CORREGIDO
useEffect(() => {
  (async () => {
    try {
      const res = await fetch("/api/localidades");
      const data = await res.json();
      
      if (data.ok && Array.isArray(data.items)) {
        setLocalidades(data.items);
      } else {
        console.warn("Formato de respuesta inesperado:", data);
        setLocalidades([]);
      }
    } catch (error) {
      console.error("Error cargando localidades:", error);
      setLocalidades([]);
    }
  })();
}, []);

  // Cargar datos en modo edición
  useEffect(() => {
    if (!ruta) return;

    const parsed: RutaUI = {
      ...ruta,
      horarios: Array.isArray(ruta.horarios) ? ruta.horarios : [],
      coordenadas: Array.isArray(ruta.coordenadas) ? ruta.coordenadas : [],
      unidades: ruta.unidades ?? [],
    };

    setFormData(parsed);

    // Reconstruir asignaciones desde unidades + horarios
if ((parsed.unidades && parsed.unidades.length > 0) || (parsed.horarios && parsed.horarios.length > 0)) {

      const nuevas: UnidadAsignada[] = [];
      for (let i = 0; i < 3; i++) {
        const unidadId = parsed.unidades ? parsed.unidades[i] || 0 : 0;
        const horario = parsed.horarios ? parsed.horarios[i] || "" : "";

        const unidad = unidadesDisponibles.find((u) => u.id === unidadId);
        nuevas.push({
          unidadId,
          horario,
          nombreUnidad: unidad ? unidad.nombre : unidadId ? `Unidad ${unidadId}` : "Seleccione unidad",
          index: i,
        });
      }
      setAsignaciones(nuevas);
    }
  }, [ruta, unidadesDisponibles]);

  // ---------- Helpers ----------
  const getLocalidad = (nombre: string) =>
    localidades.find((l) => l.nombre.toLowerCase() === (nombre || "").toLowerCase());

  const recomputarCoordenadas = (origenNombre: string, destinoNombre: string) => {
    const locO = getLocalidad(origenNombre);
    const locD = getLocalidad(destinoNombre);

    if (locO && locD) {
      const coords = [
        { lat: Number(locO.lat), lng: Number(locO.lng) },
        { lat: Number(locD.lat), lng: Number(locD.lng) },
      ];
      setFormData((prev) => ({ ...prev, coordenadas: coords }));
    } else {
      setFormData((prev) => ({ ...prev, coordenadas: [] }));
    }
  };

  // ---------- Handlers UI ----------
  const handleText = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleEstadoChange = (e: DropdownChangeEvent) => {
    setFormData((p) => ({ ...p, estado: e.value as "activo" | "inactivo" }));
  };

  const handleOrigen = (e: DropdownChangeEvent) => {
    const origen = e.value as string;
    setFormData((p) => ({ ...p, origen }));
    recomputarCoordenadas(origen, formData.destino);
  };

  const handleDestino = (e: DropdownChangeEvent) => {
    const destino = e.value as string;
    setFormData((p) => ({ ...p, destino }));
    recomputarCoordenadas(formData.origen, destino);
  };

  // ----- Asignaciones (unidades + horarios) -----
  const actualizarAsignacionUnidad = (index: number, unidadId: number) => {
    const nuevas = [...asignaciones];
    const unidad = unidadesDisponibles.find((u) => u.id === unidadId);
    nuevas[index] = {
      ...nuevas[index],
      unidadId,
      nombreUnidad: unidad ? unidad.nombre : unidadId ? `Unidad ${unidadId}` : "Seleccione unidad",
    };
    setAsignaciones(nuevas);
    syncAsignacionesToForm(nuevas);
  };

  const actualizarAsignacionHorario = (index: number, horario: string) => {
    const nuevas = [...asignaciones];
    nuevas[index] = { ...nuevas[index], horario };
    setAsignaciones(nuevas);
    syncAsignacionesToForm(nuevas);
  };

  const syncAsignacionesToForm = (nuevas: UnidadAsignada[]) => {
    setFormData((prev) => ({
      ...prev,
      unidades: nuevas.map((a) => a.unidadId),
      horarios: nuevas.map((a) => a.horario),
    }));
  };

  // Unidades disponibles por slot (evitar duplicadas)
  const getUnidadesParaSlot = (index: number) => {
    const ocupadas = asignaciones.filter((_, i) => i !== index).map((a) => a.unidadId).filter(Boolean);
    return [{ id: 0, nombre: "Seleccione unidad" }, ...unidadesDisponibles.filter((u) => !ocupadas.includes(u.id))];
  };

  const asignacionesCompletas = asignaciones.every(
    (a) => a.unidadId !== 0 && a.horario !== "" && /^\d{2}:\d{2}$/.test(a.horario)
  );

  // ---------- Submit ----------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.origen?.trim() || !formData.destino?.trim()) {
      alert("⚠️ Origen y destino son obligatorios.");
      return;
    }

    if (!asignacionesCompletas) {
      alert("⚠️ Debe asignar las 3 unidades con sus respectivos horarios (formato HH:mm)");
      return;
    }

    const horarios = asignaciones.map((a) => a.horario);
    if (new Set(horarios).size !== horarios.length) {
      alert("⚠️ No puede haber horarios duplicados");
      return;
    }

    const unidades = asignaciones.map((a) => a.unidadId);
    if (new Set(unidades).size !== unidades.length) {
      alert("⚠️ No puede asignar la misma unidad múltiples veces");
      return;
    }

    onGuardar({
      ...formData,
      origen: formData.origen.trim(),
      destino: formData.destino.trim(),
      precio: Number(formData.precio) || 0,
    });
  };

  // ---------- Render ----------
  return (
    <Card title={ruta && ruta.id !== 0 ? "Editar Ruta" : "Nueva Ruta"} className="shadow-2 border-round-xl">
      <form onSubmit={handleSubmit} className="p-fluid grid formgrid">
        {ruta && ruta.id !== 0 && (
          <div className="field col-12 md:col-6">
            <label>ID</label>
            <InputText value={String(formData.id)} disabled />
          </div>
        )}

        {/* Origen/Destino (Dropdown de localidades) */}
        <div className="field col-12 md:col-6">
          <label className="font-medium">Origen</label>
          <Dropdown
            value={formData.origen || null}
            options={opcionesLocalidades}
            onChange={handleOrigen}
            placeholder="Seleccione una ciudad"
            filter
            showClear
            className="w-full"
          />
        </div>

        <div className="field col-12 md:col-6">
          <label className="font-medium">Destino</label>
          <Dropdown
            value={formData.destino || null}
            options={opcionesLocalidades}
            onChange={handleDestino}
            placeholder="Seleccione destino"
            filter
            showClear
            className="w-full"
          />
        </div>

        <div className="field col-12 md:col-6">
          <label className="font-medium">Estado</label>
          <Dropdown
            value={formData.estado}
            options={[
              { label: "Activo", value: "activo" },
              { label: "Inactivo", value: "inactivo" },
            ]}
            onChange={handleEstadoChange}
            className="w-full"
          />
        </div>

        <div className="field col-12 md:col-6">
          <label className="font-medium">Tiempo estimado (HH:mm:ss)</label>
          <InputText
            id="tiempoEstimado"
            name="tiempoEstimado"
            value={formData.tiempoEstimado || ""}
            onChange={handleText}
            placeholder="04:30:00"
          />
        </div>

        <div className="field col-12 md:col-6">
          <label className="font-medium">Precio (Lps)</label>
          <InputText
            id="precio"
            name="precio"
            value={formData.precio?.toString() ?? ""}
            onChange={handleText}
            placeholder="250.00"
          />
        </div>

        <div className="field col-12">
          <label className="font-medium">Descripción</label>
          <InputTextarea
            id="descripcion"
            name="descripcion"
            rows={2}
            value={formData.descripcion ?? ""}
            onChange={handleText}
            placeholder="Descripción de la ruta"
          />
        </div>

        {/* ====== ASIGNACIÓN DE UNIDADES CON HORARIOS (3 slots) ====== */}
        <div className="field col-12">
          <label className="font-medium text-lg">Asignación de Unidades con Horarios</label>
          <div className="flex align-items-center gap-2 mb-3">
            <Tag value="3 UNIDADES REQUERIDAS" severity="info" />
            <small className="text-gray-600">Asigne 1 unidad diferente para cada horario</small>
          </div>

          {asignaciones.map((a, index) => (
            <div key={index} className="grid mt-2 p-3 border-1 border-round" style={{ backgroundColor: "#f8f9fa" }}>
              <div className="col-12 md:col-1 flex align-items-center justify-content-center">
                <Tag value={`#${index + 1}`} />
              </div>

              <div className="col-12 md:col-5">
                <label className="font-medium">Unidad</label>
                <Dropdown
                  value={a.unidadId || 0}
                  options={getUnidadesParaSlot(index)}
                  optionLabel="nombre"
                  optionValue="id"
                  onChange={(e) => actualizarAsignacionUnidad(index, e.value)}
                  className="w-full"
                  placeholder="Seleccione unidad"
                />
              </div>

              <div className="col-12 md:col-5">
                <label className="font-medium">Horario (HH:mm)</label>
                <InputText
                  value={a.horario}
                  onChange={(e) => actualizarAsignacionHorario(index, e.target.value)}
                  placeholder="06:00"
                  className="w-full"
                />
              </div>

              <div className="col-12 md:col-1 flex align-items-center justify-content-center">
                {a.unidadId !== 0 && a.horario && /^\d{2}:\d{2}$/.test(a.horario) && (
                  <i className="pi pi-check text-green-500"></i>
                )}
              </div>
            </div>
          ))}

          {asignaciones.some((x) => x.unidadId !== 0) && (
            <div className="mt-3">
              <h4 className="font-medium mb-2">Resumen de Asignaciones</h4>
              <DataTable value={asignaciones.filter((x) => x.unidadId !== 0)} className="p-datatable-sm" size="small">
                <Column header="#" body={(d) => d.index + 1} />
                <Column header="Unidad" body={(d: UnidadAsignada) => d.nombreUnidad} />
                <Column field="horario" header="Horario" />
                <Column
                  header="Estado"
                  body={(d: UnidadAsignada) =>
                    d.unidadId !== 0 && d.horario && /^\d{2}:\d{2}$/.test(d.horario) ? (
                      <Tag value="Completo" severity="success" />
                    ) : (
                      <Tag value="Incompleto" severity="warning" />
                    )
                  }
                />
              </DataTable>
            </div>
          )}
        </div>

        {/* Coordenadas generadas automáticamente */}
        <div className="field col-12">
          <label className="font-medium">Coordenadas (auto)</label>
          <InputTextarea
            id="coordenadas"
            name="coordenadas"
            rows={3}
            value={
              Array.isArray(formData.coordenadas) && formData.coordenadas.length > 0
                ? JSON.stringify(formData.coordenadas, null, 2)
                : "Selecciona origen y destino para generar coordenadas"
            }
            onChange={handleText}
          />
        </div>

        {/* Validación final */}
        <div className="col-12">
          {asignacionesCompletas ? (
            <div className="p-3 border-round bg-green-50 border-1 border-green-200">
              <div className="flex align-items-center gap-2">
                <i className="pi pi-check-circle text-green-500"></i>
                <span className="text-green-700 font-medium">✓ Todas las asignaciones están completas</span>
              </div>
            </div>
          ) : (
            <div className="p-3 border-round bg-yellow-50 border-1 border-yellow-200">
              <div className="flex align-items-center gap-2">
                <i className="pi pi-exclamation-triangle text-yellow-500"></i>
                <span className="text-yellow-700">Complete las 3 asignaciones de unidades y horarios</span>
              </div>
            </div>
          )}
        </div>

        <div className="col-12 flex justify-end gap-2 mt-3">
          <Button type="button" label="Cancelar" icon="pi pi-times" className="p-button-secondary p-button-sm" onClick={onCerrar} disabled={loading} />
          <Button type="submit" label="Guardar" icon="pi pi-check" className="p-button-primary p-button-sm" loading={loading} disabled={!asignacionesCompletas} />
        </div>
      </form>
    </Card>
  );
};

export default FormularioRuta;
