'use client';

import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Persona } from '@/types/persona';

interface Props {
  visible: boolean;
  onHide: () => void;
  onSave: () => void;
  persona: Persona;
  setPersona: (p: Persona) => void;
  submitted: boolean;
}

// Ejemplo listas para selects, pueden venir de API o props
const generos = [
  { label: 'Masculino', value: 'M' },
  { label: 'Femenino', value: 'F' },

];

const tiposPersona = [
  { label: 'Cliente', value: 'cliente' },
  { label: 'Empleado', value: 'empleado' },
  { label: 'Proveedor', value: 'proveedor' }
];

// Para direcciones y usuarios, ejemplo simple:
const direcciones = [
  { label: 'Dirección 1', value: 'dir1' },
  { label: 'Dirección 2', value: 'dir2' },
    { label: 'Col. Kennedy', value: 'ken' },
  { label: 'Col. Miraflores', value: 'mir' }
  
];

const usuarios = [
  { label: 'Usuario 1', value: 'usr1' },
  { label: 'Usuario 2', value: 'usr2' },
    { label: 'Usuario 3', value: 'usr3 ' },
  { label: 'Usuario 4', value: 'usr4' }
];

export default function PersonaModal({ visible, onHide, onSave, persona, setPersona, submitted }: Props) {

  return (
    <Dialog
      header="Persona"
      visible={visible}
      modal
      style={{ width: '600px' }}
      onHide={onHide}
      className="p-fluid"
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Cancelar" icon="pi pi-times" onClick={onHide} outlined />
          <Button label="Guardar" icon="pi pi-check" onClick={onSave} />
        </div>
      }
    >
      <div className="formgrid grid">
        {/* Primera fila: Nombre y Apellido */}
        <div className="field col-12 md:col-6">
          <label htmlFor="nombre" className="font-semibold">Nombre*</label>
          <InputText
            id="nombre"
            value={persona.nombre}
            onChange={e => setPersona({ ...persona, nombre: e.target.value })}
            className={submitted && !persona.nombre ? 'p-invalid' : ''}
            autoFocus
          />
          {submitted && !persona.nombre && <small className="p-error">Nombre es requerido.</small>}
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor="apellido" className="font-semibold">Apellido*</label>
          <InputText
            id="apellido"
            value={persona.apellido}
            onChange={e => setPersona({ ...persona, apellido: e.target.value })}
            className={submitted && !persona.apellido ? 'p-invalid' : ''}
          />
          {submitted && !persona.apellido && <small className="p-error">Apellido es requerido.</small>}
        </div>

        {/* Segunda fila: DNI y Fecha de nacimiento */}
        <div className="field col-12 md:col-6">
          <label htmlFor="dni" className="font-semibold">DNI*</label>
          <InputText
            id="dni"
            value={persona.dni}
            onChange={e => setPersona({ ...persona, dni: e.target.value })}
            className={submitted && !persona.dni ? 'p-invalid' : ''}
          />
          {submitted && !persona.dni && <small className="p-error">DNI es requerido.</small>}
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor="fechaNacimiento" className="font-semibold">Fecha de nacimiento</label>
          <Calendar
            id="fechaNacimiento"
            value={persona.fechaNacimiento ? new Date(persona.fechaNacimiento) : null}
            onChange={e =>
              setPersona({
                ...persona,
                fechaNacimiento: e.value ? (e.value as Date).toISOString().substring(0, 10) : ''
              })
            }
            dateFormat="yy-mm-dd"
            showIcon
            placeholder="YYYY-MM-DD"
          />
        </div>

        {/* Tercera fila: Correo */}
        <div className="field col-12">
          <label htmlFor="correo" className="font-semibold">Correo electrónico*</label>
          <InputText
            id="correo"
            type="email"
            value={persona.correo}
            onChange={e => setPersona({ ...persona, correo: e.target.value })}
            className={submitted && !persona.correo ? 'p-invalid' : ''}
            placeholder="ejemplo@correo.com"
          />
          {submitted && !persona.correo && <small className="p-error">Correo es requerido.</small>}
        </div>

        {/* Cuarta fila: Teléfono y Género */}
        <div className="field col-12 md:col-6">
          <label htmlFor="telefono" className="font-semibold">Teléfono*</label>
          <InputText
            id="telefono"
            value={persona.telefono}
            onChange={e => setPersona({ ...persona, telefono: e.target.value })}
            className={submitted && !persona.telefono ? 'p-invalid' : ''}
          />
          {submitted && !persona.telefono && <small className="p-error">Teléfono es requerido.</small>}
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor="genero" className="font-semibold">Género*</label>
          <Dropdown
            id="genero"
            value={persona.idGenero}
            options={generos}
            onChange={e => setPersona({ ...persona, idGenero: e.value })}
            placeholder="Selecciona un género"
            className={submitted && !persona.idGenero ? 'p-invalid' : ''}
          />
          {submitted && !persona.idGenero && <small className="p-error">Género es requerido.</small>}
        </div>

        {/* Quinta fila: Tipo de persona y Dirección */}
        <div className="field col-12 md:col-6">
          <label htmlFor="tipoPersona" className="font-semibold">Tipo de persona*</label>
          <Dropdown
            id="tipoPersona"
            value={persona.idTipoPersona}
            options={tiposPersona}
            onChange={e => setPersona({ ...persona, idTipoPersona: e.value })}
            placeholder="Selecciona tipo persona"
            className={submitted && !persona.idTipoPersona ? 'p-invalid' : ''}
          />
          {submitted && !persona.idTipoPersona && <small className="p-error">Tipo de persona es requerido.</small>}
        </div>

        <div className="field col-12 md:col-6">
          <label htmlFor="direccion" className="font-semibold">Dirección*</label>
          <Dropdown
            id="direccion"
            value={persona.idDireccion}
            options={direcciones}
            onChange={e => setPersona({ ...persona, idDireccion: e.value })}
            placeholder="Selecciona dirección"
            className={submitted && !persona.idDireccion ? 'p-invalid' : ''}
          />
          {submitted && !persona.idDireccion && <small className="p-error">Dirección es requerida.</small>}
        </div>

        {/* Sexta fila: Usuario */}
        <div className="field col-12">
          <label htmlFor="usuario" className="font-semibold">Usuario (opcional)</label>
          <Dropdown
            id="usuario"
            value={persona.idUsuario}
            options={usuarios}
            onChange={e => setPersona({ ...persona, idUsuario: e.value })}
            placeholder="Selecciona usuario"
            filter
            showClear
          />
        </div>
      </div>
    </Dialog>
  );
}