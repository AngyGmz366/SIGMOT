"use client";

import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputTextarea } from "primereact/inputtextarea";

type EstadoUI = "activo" | "inactivo";

export type RutaUI = {
  id: number;
  origen: string;
  destino: string;
  estado: EstadoUI;
  tiempoEstimado?: string | null;
  distancia?: number | null;
  descripcion?: string | null;
  precio?: number | null;
  horarios?: string[] | string;
  coordenadas?: { lat: number; lng: number }[] | string;
  unidades?: number[]; // Campo para las unidades
};

interface FormularioRutaProps {
  ruta: RutaUI | null;
  onGuardar: (ruta: RutaUI) => void;
  onCerrar: () => void;
  loading?: boolean;
}

const FormularioRuta: React.FC<FormularioRutaProps> = ({
  ruta,
  onGuardar,
  onCerrar,
  loading,
}) => {
  const [formData, setFormData] = useState<RutaUI>({
    id: 0,
    origen: "",
    destino: "",
    estado: "activo",
    tiempoEstimado: "00:00:00",
    distancia: 0,
    descripcion: "",
    precio: 0,
    horarios: [],
    coordenadas: [],
    unidades: [], // Inicializamos las unidades como array vacío
  });

  useEffect(() => {
    if (ruta) {
      // Si viene con JSON stringificados los parsea
      const parsed = {
        ...ruta,
        horarios:
          typeof ruta.horarios === "string"
            ? JSON.parse(ruta.horarios)
            : ruta.horarios ?? [],
        coordenadas:
          typeof ruta.coordenadas === "string"
            ? JSON.parse(ruta.coordenadas)
            : ruta.coordenadas ?? [],
        unidades: ruta.unidades ?? [], // Asignamos las unidades
      };
      setFormData(parsed);
    }
  }, [ruta]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEstadoChange = (e: DropdownChangeEvent) => {
    setFormData((prev) => ({ ...prev, estado: e.value as EstadoUI }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.origen?.trim() || !formData.destino?.trim()) {
      alert("⚠️ Origen y destino son obligatorios.");
      return;
    }

    if (
      formData.tiempoEstimado &&
      !/^\d{2}:\d{2}:\d{2}$/.test(formData.tiempoEstimado)
    ) {
      alert("⚠️ El tiempo estimado debe tener formato HH:mm:ss");
      return;
    }

    // 🕒 Procesar horarios
    const horarios =
      typeof formData.horarios === "string"
        ? formData.horarios
            .split(",")
            .map((h) => h.trim())
            .filter((h) => h.length > 0)
        : Array.isArray(formData.horarios)
        ? formData.horarios
        : [];

    // 📍 Procesar coordenadas
    let coordenadas: { lat: number; lng: number }[] = [];
    try {
      if (typeof formData.coordenadas === "string") {
        const parsed = JSON.parse(formData.coordenadas);
        if (!Array.isArray(parsed)) throw new Error("Formato inválido");
        coordenadas = parsed.map((p: any) => ({
          lat: Number(p.lat),
          lng: Number(p.lng),
        }));
      } else {
        coordenadas = Array.isArray(formData.coordenadas)
          ? formData.coordenadas.map((p) => ({
              lat: Number(p.lat),
              lng: Number(p.lng),
            }))
          : [];
      }
    } catch {
      alert(
        "⚠️ Formato inválido de coordenadas.\nUsa JSON como: [{\"lat\":14.07,\"lng\":-87.19}]"
      );
      return;
    }

    // 💰 Validar precio
    const precioNum = Number(formData.precio) || 0;
    if (precioNum < 0) {
      alert("⚠️ El precio no puede ser negativo.");
      return;
    }

    onGuardar({
      ...formData,
      origen: formData.origen.trim(),
      destino: formData.destino.trim(),
      precio: precioNum,
      horarios,
      coordenadas,
    });
  };

  return (
    <Card
      title={ruta && ruta.id !== 0 ? "Editar Ruta" : "Nueva Ruta"}
      className="shadow-2 border-round-xl"
    >
      <form onSubmit={handleSubmit} className="p-fluid grid formgrid">
        {ruta && ruta.id !== 0 && (
          <div className="field col-12 md:col-6">
            <label>ID</label>
            <InputText value={String(formData.id)} disabled />
          </div>
        )}

        {/* 🏁 Origen */}
        <div className="field col-12 md:col-6">
          <label htmlFor="origen" className="font-medium">
            Origen
          </label>
          <InputText
            id="origen"
            name="origen"
            value={formData.origen}
            onChange={handleChange}
            required
          />
        </div>

        {/* 🛣️ Destino */}
        <div className="field col-12 md:col-6">
          <label htmlFor="destino" className="font-medium">
            Destino
          </label>
          <InputText
            id="destino"
            name="destino"
            value={formData.destino}
            onChange={handleChange}
            required
          />
        </div>

        {/* ⚙️ Estado */}
        <div className="field col-12 md:col-6">
          <label htmlFor="estado" className="font-medium">
            Estado
          </label>
          <Dropdown
            id="estado"
            value={formData.estado}
            options={[
              { label: "Activo", value: "activo" },
              { label: "Inactivo", value: "inactivo" },
            ]}
            onChange={handleEstadoChange}
            className="w-full"
          />
        </div>

        {/* ⏱ Tiempo estimado */}
        <div className="field col-12 md:col-6">
          <label htmlFor="tiempoEstimado" className="font-medium">
            Tiempo estimado (HH:mm:ss)
          </label>
          <InputText
            id="tiempoEstimado"
            name="tiempoEstimado"
            value={formData.tiempoEstimado || ""}
            onChange={handleChange}
          />
        </div>

        {/* 📏 Distancia */}
        <div className="field col-12 md:col-6">
          <label htmlFor="distancia" className="font-medium">
            Distancia (km)
          </label>
          <InputText
            id="distancia"
            name="distancia"
            value={formData.distancia?.toString() ?? ""}
            onChange={handleChange}
            placeholder="Ej: 280"
          />
        </div>

        {/* 💰 Precio */}
        <div className="field col-12 md:col-6">
          <label htmlFor="precio" className="font-medium">
            Precio (Lps)
          </label>
          <InputText
            id="precio"
            name="precio"
            value={formData.precio?.toString() ?? ""}
            onChange={handleChange}
            placeholder="Ej: 250.00"
          />
        </div>

        {/* 📝 Descripción */}
        <div className="field col-12">
          <label htmlFor="descripcion" className="font-medium">
            Descripción
          </label>
          <InputTextarea
            id="descripcion"
            name="descripcion"
            rows={2}
            value={formData.descripcion ?? ""}
            onChange={handleChange}
            placeholder="Descripción breve (opcional)"
          />
        </div>

        {/* 🕓 Horarios */}
        <div className="field col-12">
          <label htmlFor="horarios" className="font-medium">
            Horarios (separados por coma)
          </label>
          <InputText
            id="horarios"
            name="horarios"
            value={
              Array.isArray(formData.horarios)
                ? formData.horarios.join(", ")
                : formData.horarios ?? ""
            }
            onChange={handleChange}
            placeholder="Ej: 06:00, 12:00, 18:00"
          />
        </div>

        {/* 📍 Coordenadas */}
        <div className="field col-12">
          <label htmlFor="coordenadas" className="font-medium">
            Coordenadas (JSON)
          </label>
          <InputTextarea
            id="coordenadas"
            name="coordenadas"
            rows={3}
            value={
              Array.isArray(formData.coordenadas)
                ? JSON.stringify(formData.coordenadas)
                : formData.coordenadas ?? ""
            }
            onChange={handleChange}
            placeholder='Ej: [{"lat":14.07,"lng":-87.19},{"lat":15.50,"lng":-88.02}]'
          />
        </div>

        {/* Unidades */}
        <div className="field col-12">
          <label htmlFor="unidades" className="font-medium">
            Unidades (IDs JSON)
          </label>
          <InputTextarea
            id="unidades"
            name="unidades"
            rows={3}
            value={JSON.stringify(formData.unidades ?? [])}
            onChange={handleChange}
            placeholder='Ej: [1,2,3]'
          />
        </div>

        <div className="col-12 flex justify-end gap-2 mt-3">
          <Button
            type="button"
            label="Cancelar"
            icon="pi pi-times"
            className="p-button-secondary p-button-sm"
            onClick={onCerrar}
            disabled={loading}
          />
          <Button
            type="submit"
            label="Guardar"
            icon="pi pi-check"
            className="p-button-primary p-button-sm"
            loading={loading}
          />
        </div>
      </form>
    </Card>
  );
};

export default FormularioRuta;
