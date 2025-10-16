// app/(main)/admin/rutas-admin/components/FormularioRuta.tsx
"use client";

import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputTextarea } from "primereact/inputtextarea";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { RutaUI, UnidadAsignada } from "./types";

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
  unidadesAsignadas,
}) => {
// En FormularioRuta.tsx, actualiza el estado inicial:
const [formData, setFormData] = useState<RutaUI>({
  id: 0,
  origen: "",
  destino: "",
  estado: "activo",
  tiempoEstimado: "00:00:00",
  distancia: null, // Agregar distancia
  descripcion: "",
  precio: 0,
  horarios: [],
  coordenadas: [],
  unidades: [],
});
  // Inicializar con 3 slots para unidades-horarios
  const [asignaciones, setAsignaciones] = useState<UnidadAsignada[]>([
    { unidadId: 0, horario: "", nombreUnidad: "Seleccione unidad", index: 0 },
    { unidadId: 0, horario: "", nombreUnidad: "Seleccione unidad", index: 1 },
    { unidadId: 0, horario: "", nombreUnidad: "Seleccione unidad", index: 2 }
  ]);

  /* Cargar datos en modo edición */
  useEffect(() => {
    if (ruta) {
      const parsed = {
        ...ruta,
        horarios: Array.isArray(ruta.horarios) ? ruta.horarios : [],
        coordenadas: Array.isArray(ruta.coordenadas) ? ruta.coordenadas : [],
        unidades: ruta.unidades ?? [],
      };
      setFormData(parsed);
      
      // Reconstruir asignaciones desde unidades y horarios
      if (ruta.unidades && ruta.unidades.length > 0 && ruta.horarios && ruta.horarios.length > 0) {
        const nuevasAsignaciones: UnidadAsignada[] = [];
        
        // Para cada uno de los 3 slots
        for (let i = 0; i < 3; i++) {
          const unidadId = ruta.unidades[i] || 0;
          const horario = ruta.horarios[i] || "";
          const unidadEncontrada = unidadesDisponibles.find(u => u.id === unidadId);
          const nombreUnidad = unidadEncontrada ? unidadEncontrada.nombre : (unidadId ? `Unidad ${unidadId}` : "Seleccione unidad");
          
          nuevasAsignaciones.push({
            unidadId,
            horario,
            nombreUnidad,
            index: i
          });
        }
        
        setAsignaciones(nuevasAsignaciones);
      }
    }
  }, [ruta, unidadesDisponibles]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEstadoChange = (e: DropdownChangeEvent) => {
    setFormData((prev) => ({ ...prev, estado: e.value as "activo" | "inactivo" }));
  };

  // Actualizar asignación de unidad
  const actualizarAsignacionUnidad = (index: number, unidadId: number) => {
    const nuevasAsignaciones = [...asignaciones];
    const unidadEncontrada = unidadesDisponibles.find(u => u.id === unidadId);
    const nombreUnidad = unidadEncontrada ? unidadEncontrada.nombre : (unidadId ? `Unidad ${unidadId}` : "Seleccione unidad");
    
    nuevasAsignaciones[index] = {
      ...nuevasAsignaciones[index],
      unidadId,
      nombreUnidad
    };
    
    setAsignaciones(nuevasAsignaciones);
    actualizarFormData(nuevasAsignaciones);
  };

  // Actualizar asignación de horario
  const actualizarAsignacionHorario = (index: number, horario: string) => {
    const nuevasAsignaciones = [...asignaciones];
    nuevasAsignaciones[index] = {
      ...nuevasAsignaciones[index],
      horario
    };
    
    setAsignaciones(nuevasAsignaciones);
    actualizarFormData(nuevasAsignaciones);
  };

  // Actualizar formData con los cambios
  const actualizarFormData = (nuevasAsignaciones: UnidadAsignada[]) => {
    const nuevasUnidades = nuevasAsignaciones.map(a => a.unidadId);
    const nuevosHorarios = nuevasAsignaciones.map(a => a.horario);
    
    setFormData(prev => ({
      ...prev,
      unidades: nuevasUnidades,
      horarios: nuevosHorarios
    }));
  };

  // Obtener unidades disponibles para un slot específico
  const getUnidadesDisponiblesParaSlot = (index: number) => {
    const unidadesOcupadas = asignaciones
      .filter((_, i) => i !== index) // Excluir el slot actual
      .map(a => a.unidadId)
      .filter(id => id !== 0); // Excluir las no seleccionadas
    
    return [
      { id: 0, nombre: "Seleccione unidad" },
      ...unidadesDisponibles.filter(u => !unidadesOcupadas.includes(u.id))
    ];
  };

  // Validar si todas las asignaciones están completas
  const asignacionesCompletas = asignaciones.every(a => 
    a.unidadId !== 0 && a.horario !== "" && /^\d{2}:\d{2}$/.test(a.horario)
  );

  // Obtener nombre de unidad para mostrar
  const getNombreUnidadParaMostrar = (unidadId: number) => {
    if (unidadId === 0) return "Seleccione unidad";
    const unidad = unidadesDisponibles.find(u => u.id === unidadId);
    return unidad ? unidad.nombre : `Unidad ${unidadId}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.origen?.trim() || !formData.destino?.trim()) {
      alert("⚠️ Origen y destino son obligatorios.");
      return;
    }

    // Validar que las 3 asignaciones estén completas
    if (!asignacionesCompletas) {
      alert("⚠️ Debe asignar las 3 unidades con sus respectivos horarios (formato HH:mm)");
      return;
    }

    // Validar que no haya horarios duplicados
    const horarios = asignaciones.map(a => a.horario);
    const horariosUnicos = new Set(horarios);
    if (horariosUnicos.size !== horarios.length) {
      alert("⚠️ No puede haber horarios duplicados");
      return;
    }

    // Validar que no haya unidades duplicadas
    const unidades = asignaciones.map(a => a.unidadId);
    const unidadesUnicas = new Set(unidades);
    if (unidadesUnicas.size !== unidades.length) {
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

        {/* Campos básicos de la ruta */}
        <div className="field col-12 md:col-6">
          <label htmlFor="origen" className="font-medium">Origen</label>
          <InputText
            id="origen"
            name="origen"
            value={formData.origen}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor="destino" className="font-medium">Destino</label>
          <InputText
            id="destino"
            name="destino"
            value={formData.destino}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor="estado" className="font-medium">Estado</label>
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

        <div className="field col-12 md:col-6">
          <label htmlFor="tiempoEstimado" className="font-medium">
            Tiempo estimado (HH:mm:ss)
          </label>
          <InputText
            id="tiempoEstimado"
            name="tiempoEstimado"
            value={formData.tiempoEstimado || ""}
            onChange={handleChange}
            placeholder="04:30:00"
          />
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor="precio" className="font-medium">Precio (Lps)</label>
          <InputText
            id="precio"
            name="precio"
            value={formData.precio?.toString() ?? ""}
            onChange={handleChange}
            placeholder="250.00"
          />
        </div>

        <div className="field col-12">
          <label htmlFor="descripcion" className="font-medium">Descripción</label>
          <InputTextarea
            id="descripcion"
            name="descripcion"
            rows={2}
            value={formData.descripcion ?? ""}
            onChange={handleChange}
            placeholder="Descripción de la ruta"
          />
        </div>

        {/* SECCIÓN ASIGNACIÓN UNIDADES CON HORARIOS - 3 SLOTS FIJOS */}
        <div className="field col-12">
          <label className="font-medium text-lg">Asignación de Unidades con Horarios</label>
          <div className="flex align-items-center gap-2 mb-3">
            <Tag value="3 UNIDADES REQUERIDAS" severity="info" />
            <small className="text-gray-600">
              Asigne 1 unidad diferente para cada horario
            </small>
          </div>
          
          {/* 3 Slots para unidades-horarios */}
          {asignaciones.map((asignacion, index) => (
            <div key={index} className="grid mt-2 p-3 border-1 border-round" style={{backgroundColor: '#f8f9fa'}}>
              <div className="col-12 md:col-1 flex align-items-center justify-content-center">
                <Tag value={`#${index + 1}`} />
              </div>
              
              <div className="col-12 md:col-5">
                <label className="font-medium">Unidad</label>
                <Dropdown
                  value={asignacion.unidadId || 0}
                  options={getUnidadesDisponiblesParaSlot(index)}
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
                  value={asignacion.horario}
                  onChange={(e) => actualizarAsignacionHorario(index, e.target.value)}
                  placeholder="06:00"
                  className="w-full"
                />
              </div>
              
              <div className="col-12 md:col-1 flex align-items-center justify-content-center">
                {asignacion.unidadId !== 0 && asignacion.horario && /^\d{2}:\d{2}$/.test(asignacion.horario) && (
                  <i className="pi pi-check text-green-500"></i>
                )}
              </div>
            </div>
          ))}

          {/* Resumen de asignaciones */}
          {asignaciones.some(a => a.unidadId !== 0) && (
            <div className="mt-3">
              <h4 className="font-medium mb-2">Resumen de Asignaciones</h4>
              <DataTable value={asignaciones.filter(a => a.unidadId !== 0)} className="p-datatable-sm" size="small">
                <Column header="#" body={(data) => data.index + 1}></Column>
                <Column 
                  header="Unidad" 
                  body={(data: UnidadAsignada) => getNombreUnidadParaMostrar(data.unidadId)}
                ></Column>
                <Column field="horario" header="Horario"></Column>
                <Column 
                  header="Estado" 
                  body={(data: UnidadAsignada) => (
                    data.unidadId !== 0 && data.horario && /^\d{2}:\d{2}$/.test(data.horario) ? 
                    <Tag value="Completo" severity="success" /> : 
                    <Tag value="Incompleto" severity="warning" />
                  )}
                ></Column>
              </DataTable>
            </div>
          )}
        </div>

        {/* Coordenadas */}
        <div className="field col-12">
          <label htmlFor="coordenadas" className="font-medium">
            Coordenadas (JSON)
          </label>
          <InputTextarea
            id="coordenadas"
            name="coordenadas"
            rows={3}
            value={Array.isArray(formData.coordenadas) ? JSON.stringify(formData.coordenadas, null, 2) : (formData.coordenadas || "")}
            onChange={handleChange}
            placeholder='[{"lat":14.07,"lng":-87.19},{"lat":15.50,"lng":-88.02}]'
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
            disabled={!asignacionesCompletas}
          />
        </div>
      </form>
    </Card>
  );
};

export default FormularioRuta;