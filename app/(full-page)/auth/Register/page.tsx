'use client';

import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

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

        // Mensaje visual de registro exitoso
        Swal.fire({
            icon: 'success',
            title: 'Usuario registrado',
            text: 'Tu cuenta ha sido creada correctamente.',
            confirmButtonColor: '#6c5ce7',
            confirmButtonText: 'Continuar'
        }).then(() => {
            router.push('/auth/login');
        });
    };

    return (
        <div className="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
            <div className="flex flex-column align-items-center justify-content-center">
                <div
                    style={{
                        borderRadius: '40px',
                        padding: '0.2rem',
                        background: 'linear-gradient(to bottom, #6366f1 5%, transparent 10%)'
                    }}
                >
                    <div
                        className="py-6 px-4 sm:px-6"
                        style={{
                            borderRadius: '40px',
                            backgroundColor: '#ffffff',
                            maxWidth: '500px',
                            width: '100%'
                        }}
                    >
                        <div className="text-center mb-4">
                            <div className="text-900 text-2xl font-semibold mb-2">Crear cuenta</div>
                        </div>

                        <div className="mb-3">
                            <label className="block mb-1 text-sm font-medium text-gray-700">Nombre completo</label>
                            <InputText value={form.nombres} onChange={(e) => handleChange(e, 'nombres')} className="w-full" />
                        </div>

                        <div className="mb-3">
                            <label className="block mb-1 text-sm font-medium text-gray-700">Teléfono</label>
                            <InputText value={form.telefono} onChange={(e) => handleChange(e, 'telefono')} className="w-full" />
                        </div>

                        <div className="mb-3">
                            <label className="block mb-1 text-sm font-medium text-gray-700">Género</label>
                            <Dropdown
                                value={form.genero}
                                options={generos}
                                onChange={(e) => handleChange(e, 'genero')}
                                placeholder="Seleccione género"
                                className="w-full"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block mb-1 text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                            <Calendar
                                value={form.fechaNacimiento}
                                onChange={(e) => handleChange(e, 'fechaNacimiento')}
                                dateFormat="dd/mm/yy"
                                showIcon
                                className="w-full"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block mb-1 text-sm font-medium text-gray-700">Correo Electrónico</label>
                            <InputText type="email" value={form.correo} onChange={(e) => handleChange(e, 'correo')} className="w-full" />
                        </div>

                        <div className="mb-3">
                            <label className="block mb-1 text-sm font-medium text-gray-700">Contraseña</label>
                            <Password value={form.contrasena} onChange={(e) => handleChange(e, 'contrasena')} toggleMask className="w-full" />
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-medium text-gray-700">Repetir Contraseña</label>
                            <Password value={form.repetirContrasena} onChange={(e) => handleChange(e, 'repetirContrasena')} toggleMask feedback={false} className="w-full" />
                        </div>

                        <Button
                            label="Registrarse"
                            icon="pi pi-user-plus"
                            className="w-full p-2 text-base mb-3"
                            style={{
                                backgroundColor: '#6c5ce7',
                                border: 'none',
                                color: '#fff',
                                fontWeight: 'bold'
                            }}
                            onClick={handleSubmit}
                        />

                        <Button
                            label="¿Ya tienes cuenta? Inicia sesión"
                            className="w-full p-2 text-base p-button-outlined"
                            onClick={() => router.push('/auth/login')}
                            style={{
                                border: '1px solid #6c5ce7',
                                color: '#6c5ce7',
                                fontWeight: 'bold',
                                backgroundColor: 'white'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistroUsuario;
