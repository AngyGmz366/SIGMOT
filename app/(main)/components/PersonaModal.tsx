'use client';
import React from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Persona } from '@/types/persona';

interface Props {
  visible: boolean;
  onHide: () => void;
  onSave: () => void;
  persona: Persona;
  setPersona: React.Dispatch<React.SetStateAction<Persona>>; // ✅ corregido
  submitted: boolean;
}

export default function PersonaModal({
  visible,
  onHide,
  onSave,
  persona,
  setPersona,
  submitted,
}: Props) {
// 🔹 Géneros reales (IDs según tu tabla TBL_MS_GENERO)
const generos = [
  { label: 'Masculino', value: 1 },
  { label: 'Femenino', value: 2 },
  { label: 'Otro', value: 3 },
  { label: 'Prefiero no decir', value: 4 },
];
// 🔹 Tipos de persona

 const tiposPersona = [
  { label: 'Cliente', value: 1 },
  { label: 'Empleado', value: 2 },
];


  return (
    <Dialog
      visible={visible}
      header="Datos de la Persona"
      modal
      className="w-4"
      onHide={onHide}
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Cancelar" icon="pi pi-times" outlined onClick={onHide} />
          <Button label="Guardar" icon="pi pi-check" onClick={onSave} />
        </div>
      }
    >
      <div className="p-fluid formgrid grid">
        {/* 🔹 Nombres */}
        <div className="field col-12 md:col-6">
          <label htmlFor="nombres">Nombres</label>
          <InputText
            id="nombres"
            value={persona.Nombres}
            onChange={(e) => setPersona({ ...persona, Nombres: e.target.value })}
            required
            autoFocus
            className={submitted && !persona.Nombres ? 'p-invalid' : ''}
          />
          {submitted && !persona.Nombres && <small className="p-error">Campo obligatorio</small>}
        </div>

        {/* 🔹 Apellidos */}
        <div className="field col-12 md:col-6">
          <label htmlFor="apellidos">Apellidos</label>
          <InputText
            id="apellidos"
            value={persona.Apellidos}
            onChange={(e) => setPersona({ ...persona, Apellidos: e.target.value })}
            required
            className={submitted && !persona.Apellidos ? 'p-invalid' : ''}
          />
          {submitted && !persona.Apellidos && <small className="p-error">Campo obligatorio</small>}
        </div>

        {/* 🔹 DNI */}
        <div className="field col-12 md:col-6">
          <label htmlFor="dni">DNI</label>
          <InputText
            id="dni"
            value={persona.DNI}
            onChange={(e) => setPersona({ ...persona, DNI: e.target.value })}
          />
        </div>

        {/* 🔹 Teléfono */}
        <div className="field col-12 md:col-6">
          <label htmlFor="telefono">Teléfono</label>
          <InputText
            id="telefono"
            value={persona.Telefono}
            onChange={(e) => setPersona({ ...persona, Telefono: e.target.value })}
          />
        </div>

        {/* 🔹 Fecha Nacimiento */}
        <div className="field col-12 md:col-6">
          <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
          <Calendar
            id="fechaNacimiento"
            value={persona.Fecha_Nacimiento ? new Date(persona.Fecha_Nacimiento) : undefined}
            onChange={(e) =>
              setPersona({
                ...persona,
                Fecha_Nacimiento: e.value ? e.value.toISOString().split('T')[0] : '',
              })
            }
            dateFormat="yy-mm-dd"
            showIcon
          />
        </div>

        {/* 🔹 Género */}
<div className="field col-12 md:col-6">
  <label htmlFor="genero">Género</label>
  <Dropdown
    id="genero"
    value={persona.Genero}
    options={[
      { label: 'Masculino', value: 1 },
      { label: 'Femenino', value: 2 },
      { label: 'Otro', value: 3 },
      { label: 'Prefiero no decir', value: 4 },
    ]}
    optionLabel="label"
    optionValue="value"  // 👈🔹 AGREGA ESTA LÍNEA
    placeholder="Seleccione un género"
    onChange={(e) => setPersona({ ...persona, Genero: e.value })} // 👈🔹 e.value
    className={submitted && !persona.Genero ? 'p-invalid' : ''}
  />
  {submitted && !persona.Genero && (
    <small className="p-error">Campo obligatorio</small>
  )}
</div>



        {/* 🔹 Tipo Persona */}
        <div className="field col-12 md:col-6">
          <label htmlFor="tipoPersona">Tipo de Persona</label>
         <Dropdown
  id="tipoPersona"
  value={persona.TipoPersona}
  options={tiposPersona}
  onChange={(e) => setPersona({ ...persona, TipoPersona: e.value })}
  placeholder="Seleccione tipo"
/>

        </div>

        {/* 🔹 Correo Electrónico */}
        <div className="field col-12 md:col-6">
          <label htmlFor="correo">Correo Electrónico</label>
        <InputText
  id="correo"
  value={persona.Correo}
  onChange={(e) => setPersona({ ...persona, Correo: e.target.value })}
  required
  className={submitted && !persona.Correo ? 'p-invalid' : ''}
/>
{submitted && !persona.Correo && <small className="p-error">Correo obligatorio</small>}
c
        </div>

        {/* 🔹 Departamento */}
        <div className="field col-12 md:col-6">
          <label htmlFor="departamento">Departamento</label>
          <InputText
            id="departamento"
            value={persona.Departamento}
            onChange={(e) => setPersona({ ...persona, Departamento: e.target.value })}
          />
        </div>

        {/* 🔹 Municipio */}
        <div className="field col-12 md:col-6">
          <label htmlFor="municipio">Municipio</label>
          <InputText
            id="municipio"
            value={persona.Municipio}
            onChange={(e) => setPersona({ ...persona, Municipio: e.target.value })}
          />
        </div>
      </div>
    </Dialog>
  );
}
