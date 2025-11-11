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
// 🔹 Departamentos y Municipios de Honduras
const departamentosHonduras = [
  {
    label: 'Atlántida', value: 'Atlántida', municipios: [
      'La Ceiba', 'El Porvenir', 'Esparta', 'Jutiapa', 'La Masica', 'San Francisco', 'Tela'
    ]
  },
  {
    label: 'Choluteca', value: 'Choluteca', municipios: [
      'Choluteca', 'Apacilagua', 'Concepción de María', 'Duyure', 'El Corpus', 'El Triunfo', 'Marcovia', 'Morolica', 'Namasigüe', 'Orocuina', 'Pespire', 'San Antonio de Flores', 'San Isidro', 'San José', 'San Marcos de Colón', 'Santa Ana de Yusguare'
    ]
  },
  {
    label: 'Colón', value: 'Colón', municipios: [
      'Trujillo', 'Balfate', 'Iriona', 'Limón', 'Sabá', 'Santa Fe', 'Santa Rosa de Aguán', 'Sonaguera', 'Tocoa'
    ]
  },
  {
    label: 'Comayagua', value: 'Comayagua', municipios: [
      'Comayagua', 'Ajuterique', 'El Rosario', 'Esquías', 'Humuya', 'La Libertad', 'Lamaní', 'La Trinidad', 'Lejamaní', 'Meámbar', 'Minas de Oro', 'Ojos de Agua', 'San Jerónimo', 'San José de Comayagua', 'San José del Potrero', 'San Luis', 'San Sebastián', 'Siguatepeque', 'Taulabé', 'Villa de San Antonio'
    ]
  },
  {
    label: 'Copán', value: 'Copán', municipios: [
      'Santa Rosa de Copán', 'Cabañas', 'Concepción', 'Corquín', 'Cucuyagua', 'Dolores', 'Dulce Nombre', 'El Paraíso', 'Florida', 'La Jigua', 'La Unión', 'Nueva Arcadia', 'San Agustín', 'San Antonio', 'San Jerónimo', 'San José', 'San Juan de Opoa', 'San Nicolás', 'San Pedro', 'Santa Rita', 'Trinidad', 'Veracruz'
    ]
  },
  {
    label: 'Cortés', value: 'Cortés', municipios: [
      'San Pedro Sula', 'Choloma', 'La Lima', 'Omoa', 'Pimienta', 'Potrerillos', 'Puerto Cortés', 'San Antonio de Cortés', 'San Francisco de Yojoa', 'San Manuel', 'Santa Cruz de Yojoa', 'Villanueva'
    ]
  },
  {
    label: 'El Paraíso', value: 'El Paraíso', municipios: [
      'Yuscarán', 'Alauca', 'Danlí', 'El Paraíso', 'Güinope', 'Jacaleapa', 'Liure', 'Morocelí', 'Oropolí', 'San Antonio de Flores', 'San Lucas', 'San Matías', 'Soledad', 'Teupasenti', 'Texiguat', 'Vado Ancho', 'Yauyupe', 'Trojes'
    ]
  },
  {
    label: 'Francisco Morazán', value: 'Francisco Morazán', municipios: [
      'Tegucigalpa', 'Alubarén', 'Cedros', 'Curarén', 'El Porvenir', 'Guaimaca', 'La Libertad', 'La Venta', 'Lepaterique', 'Maraita', 'Marale', 'Nueva Armenia', 'Ojojona', 'Orica', 'Reitoca', 'Sabanagrande', 'San Antonio de Oriente', 'San Buenaventura', 'San Ignacio', 'San Juan de Flores', 'San Miguelito', 'Santa Ana', 'Santa Lucía', 'Talanga', 'Tatumbla', 'Valle de Ángeles', 'Villa de San Francisco', 'Vallecillo'
    ]
  },
  {
    label: 'Gracias a Dios', value: 'Gracias a Dios', municipios: [
      'Puerto Lempira', 'Brus Laguna', 'Ahuas', 'Juan Francisco Bulnes', 'Ramón Villeda Morales', 'Wampusirpi'
    ]
  },
  {
    label: 'Intibucá', value: 'Intibucá', municipios: [
      'La Esperanza', 'Camasca', 'Colomoncagua', 'Concepción', 'Dolores', 'Intibucá', 'Jesús de Otoro', 'Magdalena', 'Masaguara', 'San Antonio', 'San Isidro', 'San Juan', 'San Marcos de la Sierra', 'San Miguelito', 'Santa Lucía', 'Yamaranguila'
    ]
  },
  {
    label: 'Islas de la Bahía', value: 'Islas de la Bahía', municipios: [
      'Roatán', 'Guanaja', 'José Santos Guardiola', 'Utila'
    ]
  },
  {
    label: 'La Paz', value: 'La Paz', municipios: ['La Paz', 'Aguanqueterique', 'Cabañas', 'Cane', 'Chinacla', 'Guajiquiro', 'Lauterique', 'Marcala', 'Mercedes de Oriente', 'Opatoro', 'San Antonio del Norte', 'San José', 'San Juan', 'San Pedro de Tutule', 'Santa Ana', 'Santa Elena', 'Santa María', 'Santiago de Puringla', 'Yarula']
  },
  {
    label: 'Lempira', value: 'Lempira', municipios: ['Gracias', 'Belén', 'Candelaria', 'Cololaca', 'Erandique', 'Gualcince', 'Guarita', 'La Campa', 'La Iguala', 'Las Flores', 'La Unión', 'Lepaera', 'Mapulaca', 'San Andrés', 'San Francisco', 'San Juan Guarita', 'San Manuel Colohete', 'San Rafael', 'San Sebastián', 'Santa Cruz', 'Talgua', 'Tambla', 'Tomalá', 'Valladolid', 'Virginia']
  },
  {
    label: 'Ocotepeque', value: 'Ocotepeque', municipios: [
      'Nueva Ocotepeque', 'Belén Gualcho', 'Concepción', 'Dolores Merendón', 'Fraternidad', 'La Encarnación', 'La Labor', 'Lucerna', 'Mercedes', 'San Fernando', 'San Francisco del Valle', 'San Jorge', 'San Marcos', 'Santa Fe', 'Sensenti', 'Sinuapa'
    ]
  },
  {
    label: 'Olancho', value: 'Olancho', municipios: [
      'Juticalpa', 'Campamento', 'Catacamas', 'Concordia', 'El Rosario', 'Esquipulas del Norte', 'Gualaco', 'Guarizama', 'Guata', 'Guayape', 'Jano', 'La Unión', 'Mangulile', 'Manto', 'Salamá', 'San Esteban', 'San Francisco de Becerra', 'San Francisco de la Paz', 'Santa María del Real', 'Silca', 'Yocón'
    ]
  },
  {
    label: 'Santa Bárbara', value: 'Santa Bárbara', municipios: [
      'Santa Bárbara', 'Arada', 'Atima', 'Azacualpa', 'Ceguaca', 'Concepción del Sur', 'Gualala', 'Ilama', 'Las Vegas', 'Macuelizo', 'Naranjito', 'Nuevo Celilac', 'Petoa', 'Protección', 'Quimistán', 'San Francisco de Ojuera', 'San José de Colinas', 'San Luis', 'San Marcos', 'San Nicolás', 'San Pedro Zacapa', 'San Vicente Centenario', 'Santa Rita', 'Trinidad'
    ]
  },
  {
    label: 'Valle', value: 'Valle', municipios: [
      'Nacaome', 'Alianza', 'Amapala', 'Aramecina', 'Caridad', 'Goascorán', 'Langue', 'San Francisco de Coray', 'San Lorenzo'
    ]
  },
  {
    label: 'Yoro', value: 'Yoro', municipios: [
      'Yoro', 'Arenal', 'El Negrito', 'El Progreso', 'Jocón', 'Morazán', 'Olanchito', 'Santa Rita', 'Sulaco', 'Victoria', 'Yorito'
    ]
  }
];

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

  const municipiosPorDepto =
  departamentosHonduras.find((d) => d.value === persona.Departamento)?.municipios || [];


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
  <Dropdown
    id="departamento"
    value={persona.Departamento}
    options={departamentosHonduras}
    optionLabel="label"
    optionValue="value"
    placeholder="Seleccione un departamento"
    onChange={(e) =>
      setPersona({ ...persona, Departamento: e.value, Municipio: '' })
    }
    className={submitted && !persona.Departamento ? 'p-invalid' : ''}
  />
  {submitted && !persona.Departamento && (
    <small className="p-error">Campo obligatorio</small>
  )}
</div>

{/* Municipio */}
<div className="field col-12 md:col-6">
  <label htmlFor="municipio">Municipio</label>
  <Dropdown
    id="municipio"
    value={persona.Municipio}
    options={municipiosPorDepto.map((m) => ({ label: m, value: m }))}
    placeholder="Seleccione un municipio"
    onChange={(e) =>
      setPersona({ ...persona, Municipio: e.value })
    }
    disabled={!persona.Departamento}
    className={submitted && !persona.Municipio ? 'p-invalid' : ''}
  />
  {submitted && !persona.Municipio && (
    <small className="p-error">Campo obligatorio</small>
  )}
</div>

      </div>
    </Dialog>
  );
}
