import React from 'react';
import { Persona } from '@/types/persona';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';  // Agrega esta línea
interface PersonaModalProps {
    visible: boolean;
    onHide: () => void;
    onSave: () => void;
    persona: Persona;
    setPersona: (persona: Persona) => void;
    submitted: boolean;
    generos: { label: string; value: string }[];
    tiposPersona: { label: string; value: string }[];
}

const PersonaModal: React.FC<PersonaModalProps> = ({
    visible,
    onHide,
    onSave,
    persona,
    setPersona,
    submitted,
    generos,
    tiposPersona
}) => {
    return (
        <Dialog 
            visible={visible} 
            style={{ width: '600px' }} 
            header="Detalles de Persona" 
            modal 
            className="p-fluid" 
            onHide={onHide}
            footer={
                <div>
                    <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onHide} />
                    <Button label="Guardar" icon="pi pi-check" onClick={onSave} />
                </div>
            }
        >
            <div className="grid formgrid">
                <div className="field col-12 md:col-6">
                    <label htmlFor="nombre">Nombre</label>
                    <InputText 
                        id="nombre" 
                        value={persona.nombre} 
                        onChange={(e) => setPersona({ ...persona, nombre: e.target.value })} 
                        required 
                        className={submitted && !persona.nombre ? 'p-invalid' : ''} 
                    />
                    {submitted && !persona.nombre && <small className="p-error">Nombre es requerido</small>}
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="apellido">Apellido</label>
                    <InputText 
                        id="apellido" 
                        value={persona.apellido} 
                        onChange={(e) => setPersona({ ...persona, apellido: e.target.value })} 
                        required 
                        className={submitted && !persona.apellido ? 'p-invalid' : ''} 
                    />
                    {submitted && !persona.apellido && <small className="p-error">Apellido es requerido</small>}
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="dni">DNI</label>
                    <InputText 
                        id="dni" 
                        value={persona.dni} 
                        onChange={(e) => setPersona({ ...persona, dni: e.target.value })} 
                        required 
                        className={submitted && !persona.dni ? 'p-invalid' : ''} 
                    />
                    {submitted && !persona.dni && <small className="p-error">DNI es requerido</small>}
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
                    <Calendar 
                        id="fechaNacimiento" 
                        value={persona.fechaNacimiento ? new Date(persona.fechaNacimiento) : null} 
                        onChange={(e) => setPersona({ ...persona, fechaNacimiento: e.value?.toISOString() || '' })} 
                        showIcon 
                        dateFormat="dd/mm/yy" 
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="correo">Correo Electrónico</label>
                    <InputText 
                        id="correo" 
                        value={persona.correo} 
                        onChange={(e) => setPersona({ ...persona, correo: e.target.value })} 
                        required 
                        className={submitted && !persona.correo ? 'p-invalid' : ''} 
                    />
                    {submitted && !persona.correo && <small className="p-error">Correo es requerido</small>}
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="telefono">Teléfono</label>
                    <InputText 
                        id="telefono" 
                        value={persona.telefono} 
                        onChange={(e) => setPersona({ ...persona, telefono: e.target.value })} 
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="idGenero">Género</label>
                    <Dropdown 
                        id="idGenero" 
                        value={persona.idGenero} 
                        options={generos} 
                        onChange={(e) => setPersona({ ...persona, idGenero: e.value })} 
                        placeholder="Seleccione un género" 
                    />
                </div>

                <div className="field col-12 md:col-6">
                    <label htmlFor="idTipoPersona">Tipo de Persona</label>
                    <Dropdown 
                        id="idTipoPersona" 
                        value={persona.idTipoPersona} 
                        options={tiposPersona} 
                        onChange={(e) => setPersona({ ...persona, idTipoPersona: e.value })} 
                        placeholder="Seleccione un tipo" 
                    />
                </div>
            </div>
        </Dialog>
    );
};

export default PersonaModal;