'use client';

import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Persona } from '@/types/persona';

interface Props {
  visible: boolean;
  onHide: () => void;
  onSave: () => void;
  persona: Persona;
  setPersona: (p: Persona) => void;
  submitted: boolean;
}

const generos = [
  { label: 'Masculino', value: 'masculino' },
  { label: 'Femenino', value: 'femenino' },
];

const tiposPersona = [
  { label: 'Cliente', value: 'cliente' },
  { label: 'Empleado', value: 'empleado' },
];

export default function PersonaModal({ visible, onHide, onSave, persona, setPersona, submitted }: Props) {
  return (
    <Dialog
      visible={visible}
      header="Datos de la Persona"
      modal
      className="w-4"
      onHide={onHide}
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Cancelar" icon="pi pi-times" text onClick={onHide} />
          <Button label="Guardar" icon="pi pi-check" text onClick={onSave} />
        </div>
      }
    >
      <div className="formgrid grid p-fluid">
        {/* Nombre */}
        <div className="field col-12 md:col-6">
          <label htmlFor="nombre">Nombre</label>
          <InputText
            id="nombre"
            value={persona.nombre}
            onChange={(e) => setPersona({ ...persona, nombre: e.target.value })}
            className={submitted && !persona.nombre ? 'p-invalid' : ''}
          />
          {submitted && !persona.nombre && <small className="p-error">Requerido.</small>}
        </div>

        {/* Apellido */}
        <div className="field col-12 md:col-6">
          <label htmlFor="apellido">Apellido</label>
          <InputText
            id="apellido"
            value={persona.apellido}
            onChange={(e) => setPersona({ ...persona, apellido: e.target.value })}
            className={submitted && !persona.apellido ? 'p-invalid' : ''}
          />
          {submitted && !persona.apellido && <small className="p-error">Requerido.</small>}
        </div>

        {/* DNI */}
        <div className="field col-12 md:col-6">
          <label htmlFor="dni">DNI</label>
          <InputText
            id="dni"
            value={persona.dni}
            onChange={(e) => setPersona({ ...persona, dni: e.target.value })}
            className={submitted && !persona.dni ? 'p-invalid' : ''}
          />
          {submitted && !persona.dni && <small className="p-error">Requerido.</small>}
        </div>

        {/* Fecha Nacimiento */}
        <div className="field col-12 md:col-6">
          <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
          <Calendar
            id="fechaNacimiento"
            value={persona.fechaNacimiento ? new Date(persona.fechaNacimiento) : undefined}
            onChange={(e) =>
              setPersona({ ...persona, fechaNacimiento: e.value?.toISOString().split('T')[0] ?? '' })
            }
            dateFormat="yy-mm-dd"
            className={submitted && !persona.fechaNacimiento ? 'p-invalid' : ''}
          />
          {submitted && !persona.fechaNacimiento && <small className="p-error">Requerido.</small>}
        </div>

        {/* Correo */}
        <div className="field col-12 md:col-6">
          <label htmlFor="correo">Correo</label>
          <InputText
            id="correo"
            value={persona.correo}
            onChange={(e) => setPersona({ ...persona, correo: e.target.value })}
            className={submitted && !persona.correo ? 'p-invalid' : ''}
          />
          {submitted && !persona.correo && <small className="p-error">Requerido.</small>}
        </div>

        {/* Teléfono */}
        <div className="field col-12 md:col-6">
          <label htmlFor="telefono">Teléfono</label>
          <InputText
            id="telefono"
            value={persona.telefono}
            onChange={(e) => setPersona({ ...persona, telefono: e.target.value })}
            className={submitted && !persona.telefono ? 'p-invalid' : ''}
          />
          {submitted && !persona.telefono && <small className="p-error">Requerido.</small>}
        </div>

        {/* Género */}
        <div className="field col-12 md:col-6">
          <label htmlFor="genero">Género</label>
          <Dropdown
            id="genero"
            value={persona.idGenero}
            options={generos}
            onChange={(e) => setPersona({ ...persona, idGenero: e.value })}
            placeholder="Seleccione género"
            className={submitted && !persona.idGenero ? 'p-invalid' : ''}
          />
          {submitted && !persona.idGenero && <small className="p-error">Requerido.</small>}
        </div>

        {/* Tipo Persona */}
        <div className="field col-12 md:col-6">
          <label htmlFor="tipoPersona">Tipo de Persona</label>
          <Dropdown
            id="tipoPersona"
            value={persona.idTipoPersona}
            options={tiposPersona}
            onChange={(e) => setPersona({ ...persona, idTipoPersona: e.value })}
            placeholder="Seleccione tipo"
            className={submitted && !persona.idTipoPersona ? 'p-invalid' : ''}
          />
          {submitted && !persona.idTipoPersona && <small className="p-error">Requerido.</small>}
        </div>

        {/* Dirección */}
        <div className="field col-12 md:col-6">
          <label htmlFor="direccion">Dirección</label>
          <InputText
            id="direccion"
            value={persona.idDireccion}
            onChange={(e) => setPersona({ ...persona, idDireccion: e.target.value })}
            className={submitted && !persona.idDireccion ? 'p-invalid' : ''}
          />
          {submitted && !persona.idDireccion && <small className="p-error">Requerido.</small>}
        </div>

        {/* Usuario */}
        <div className="field col-12 md:col-6">
          <label htmlFor="usuario">ID Usuario</label>
          <InputText
            id="usuario"
            value={persona.idUsuario}
            onChange={(e) => setPersona({ ...persona, idUsuario: e.target.value })}
          />
        </div>
      </div>
    </Dialog>
  );
}
