'use client';

import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';

const RegistroUsuario = () => {
    const router = useRouter();
    const [form, setForm] = useState({
        nombres: '',
        dni: '',
        correo: '',
        telefono: '',
        genero: null,
        fechaNacimiento: null,
        contrasena: '',
        repetirContrasena: ''
    });

    const generos = [
        { label: 'Masculino', value: 1 },
        { label: 'Femenino', value: 2 },
        { label: 'Otro', value: 3 }
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | DropdownChangeEvent, field: string) => {
        const value = e && e.target ? e.target.value : e;
        setForm({ ...form, [field]: value });
    };

    const handleSubmit = () => {
        console.log('Datos del formulario:', form);
        router.push('/login');
    };

    return (
        <div className="flex justify-content-center align-items-center min-h-screen bg-gray-100 p-4">
            <div className="surface-card p-5 shadow-2 border-round w-full md:w-10 bg-white" style={{ maxWidth: '1200px' }}>
               <div className="flex justify-content-center mb-4">
                    <img
                        src="/demo/images/login/LOGO-SIGMOT.png"
                        alt="Logo SIGMOT"
                        style={{ width: '130px', height: 'auto' }}
                     />
                </div>

                <h2 className="text-center text-3xl font-bold mb-5 w-full">Registro SIGMOT</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2 font-medium">Nombres y Apellidos</label>
                        <InputText value={form.nombres} onChange={(e) => handleChange(e, 'nombres')} className="w-full" />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">DNI</label>
                        <InputText value={form.dni} onChange={(e) => handleChange(e, 'dni')} className="w-full" />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Correo Electrónico</label>
                        <InputText type="email" value={form.correo} onChange={(e) => handleChange(e, 'correo')} className="w-full" />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Teléfono</label>
                        <InputText value={form.telefono} onChange={(e) => handleChange(e, 'telefono')} className="w-full" />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Género</label>
                        <Dropdown value={form.genero} options={generos} onChange={(e) => handleChange(e, 'genero')} placeholder="Seleccione género" className="w-full" />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Fecha de Nacimiento</label>
                        <Calendar value={form.fechaNacimiento} onChange={(e) => handleChange(e, 'fechaNacimiento')} dateFormat="dd/mm/yy" showIcon className="w-full" />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Contraseña</label>
                        <Password value={form.contrasena} onChange={(e) => handleChange(e, 'contrasena')} toggleMask className="w-full" />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Repetir Contraseña</label>
                        <Password value={form.repetirContrasena} onChange={(e) => handleChange(e, 'repetirContrasena')} toggleMask feedback={false} className="w-full" />
                    </div>
                </div>

                <div className="mt-5 flex flex-column md:flex-row justify-content-between gap-3">
                    <Button label="Registrarse" icon="pi pi-user-plus" className="w-full md:w-auto" onClick={() => router.push('/auth/login')} />
                    <Button label="¿Ya tienes cuenta? Inicia sesión" link className="w-full md:w-auto" onClick={() => router.push('/auth/login')} />
                </div>
            </div>
        </div>
    );
};

export default RegistroUsuario;
