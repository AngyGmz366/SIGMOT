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
  setPersona: React.Dispatch<React.SetStateAction<Persona>>;
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
  const estadosPersona = [
    { label: 'Activo', value: 1 },
    { label: 'Eliminado', value: 2 },
  ];

  const generos = [
    { label: 'Masculino', value: 1 },
    { label: 'Femenino', value: 2 },
  ];

  const tiposPersona = [
    { label: 'Cliente', value: 1 },
    { label: 'Empleado', value: 2 },
  ];

  /* 🔹 Validadores Honduras */
  const validarDNI = (dni: string) => /^\d{13}$/.test(dni);
  const validarTelefono = (tel: string) => /^[2389]\d{7}$/.test(tel);
  const validarCorreo = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  const validarTexto = (txt: string) => /^[A-Za-zÀ-ÿ\s]*$/.test(txt);

  const fechaInvalida =
    persona.Fecha_Nacimiento &&
    new Date(persona.Fecha_Nacimiento) > new Date();

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
        {/* Nombres */}
        <div className="field col-12 md:col-6">
          <label htmlFor="nombres">Nombres</label>
          <InputText
            id="nombres"
            value={persona.Nombres}
            onChange={(e) => setPersona({ ...persona, Nombres: e.target.value })}
            required
            autoFocus
            className={
              submitted &&
              (!persona.Nombres || !validarTexto(persona.Nombres))
                ? 'p-invalid'
                : ''
            }
          />
          {submitted && !persona.Nombres && (
            <small className="p-error">Campo obligatorio</small>
          )}
          {persona.Nombres && !validarTexto(persona.Nombres) && (
            <small className="p-error">Solo letras y espacios</small>
          )}
        </div>

        {/* Apellidos */}
        <div className="field col-12 md:col-6">
          <label htmlFor="apellidos">Apellidos</label>
          <InputText
            id="apellidos"
            value={persona.Apellidos}
            onChange={(e) => setPersona({ ...persona, Apellidos: e.target.value })}
            required
            className={
              submitted &&
              (!persona.Apellidos || !validarTexto(persona.Apellidos))
                ? 'p-invalid'
                : ''
            }
          />
          {submitted && !persona.Apellidos && (
            <small className="p-error">Campo obligatorio</small>
          )}
          {persona.Apellidos && !validarTexto(persona.Apellidos) && (
            <small className="p-error">Solo letras y espacios</small>
          )}
        </div>

        {/* DNI */}
        <div className="field col-12 md:col-6">
          <label htmlFor="dni">DNI</label>
          <InputText
            id="dni"
            value={persona.DNI}
            onChange={(e) => setPersona({ ...persona, DNI: e.target.value })}
            maxLength={13}
            className={
              persona.DNI && !validarDNI(persona.DNI) ? 'p-invalid' : ''
            }
          />
          {persona.DNI && !validarDNI(persona.DNI) && (
            <small className="p-error">
              El DNI debe tener 13 dígitos (ej. 0801199901234)
            </small>
          )}
        </div>

        {/* Teléfono */}
        <div className="field col-12 md:col-6">
          <label htmlFor="telefono">Teléfono</label>
          <InputText
            id="telefono"
            value={persona.Telefono}
            onChange={(e) =>
              setPersona({ ...persona, Telefono: e.target.value })
            }
            maxLength={8}
            className={
              persona.Telefono && !validarTelefono(persona.Telefono)
                ? 'p-invalid'
                : ''
            }
          />
          {persona.Telefono && !validarTelefono(persona.Telefono) && (
            <small className="p-error">
              El teléfono debe tener 8 dígitos y comenzar con 2, 3, 8 o 9
            </small>
          )}
        </div>

        {/* Fecha de Nacimiento */}
        <div className="field col-12 md:col-6">
          <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
          <Calendar
            id="fechaNacimiento"
            value={
              persona.Fecha_Nacimiento
                ? new Date(persona.Fecha_Nacimiento)
                : undefined
            }
            onChange={(e) =>
              setPersona({
                ...persona,
                Fecha_Nacimiento: e.value
                  ? e.value.toISOString().split('T')[0]
                  : '',
              })
            }
            dateFormat="yy-mm-dd"
            showIcon
          />
          {fechaInvalida && (
            <small className="p-error">No puede ser una fecha futura</small>
          )}
        </div>

        {/* Género */}
        <div className="field col-12 md:col-6">
          <label htmlFor="genero">Género</label>
          <Dropdown
            id="genero"
            value={persona.Genero}
            options={generos}
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccione un género"
            onChange={(e) => setPersona({ ...persona, Genero: e.value })}
            className={submitted && !persona.Genero ? 'p-invalid' : ''}
          />
          {submitted && !persona.Genero && (
            <small className="p-error">Campo obligatorio</small>
          )}
        </div>

        {/* Tipo Persona */}
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

        {/* Estado */}
        <div className="field col-12 md:col-6">
          <label htmlFor="estadoPersona">Estado</label>
          <Dropdown
            id="estadoPersona"
            value={persona.EstadoPersona}
            options={estadosPersona}
            onChange={(e) =>
              setPersona({ ...persona, EstadoPersona: e.value })
            }
            placeholder="Seleccione el estado"
            className={submitted && !persona.EstadoPersona ? 'p-invalid' : ''}
          />
          {submitted && !persona.EstadoPersona && (
            <small className="p-error">Campo obligatorio</small>
          )}
        </div>

        {/* Correo */}
        <div className="field col-12 md:col-6">
          <label htmlFor="correo">Correo Electrónico</label>
          <InputText
            id="correo"
            value={persona.Correo}
            onChange={(e) => setPersona({ ...persona, Correo: e.target.value })}
            required
            className={
              submitted && !validarCorreo(persona.Correo) ? 'p-invalid' : ''
            }
          />
          {submitted && !persona.Correo && (
            <small className="p-error">Correo obligatorio</small>
          )}
          {persona.Correo &&
            !validarCorreo(persona.Correo) && (
              <small className="p-error">Correo inválido</small>
            )}
        </div>

        {/* Departamento */}
        <div className="field col-12 md:col-6">
          <label htmlFor="departamento">Departamento</label>
          <InputText
            id="departamento"
            value={persona.Departamento}
            onChange={(e) =>
              setPersona({ ...persona, Departamento: e.target.value })
            }
            className={
              persona.Departamento &&
              !validarTexto(persona.Departamento)
                ? 'p-invalid'
                : ''
            }
          />
          {persona.Departamento &&
            !validarTexto(persona.Departamento) && (
              <small className="p-error">Solo letras y espacios</small>
            )}
        </div>

        {/* Municipio */}
        <div className="field col-12 md:col-6">
          <label htmlFor="municipio">Municipio</label>
          <InputText
            id="municipio"
            value={persona.Municipio}
            onChange={(e) =>
              setPersona({ ...persona, Municipio: e.target.value })
            }
            className={
              persona.Municipio && !validarTexto(persona.Municipio)
                ? 'p-invalid'
                : ''
            }
          />
          {persona.Municipio &&
            !validarTexto(persona.Municipio) && (
              <small className="p-error">Solo letras y espacios</small>
            )}
        </div>
      </div>
    </Dialog>
  );
}
