'use client';

import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

const Perfil = () => {
    const toast = React.useRef<Toast>(null);
    const [perfil, setPerfil] = useState({
        nombre: '',
        apellido: '',
        correo: '',
        telefono: '',
        direccion: '',
        genero: '',
        contrasena: '',
        foto: ''
    });

    const generos = [
        { label: 'Masculino', value: 'M' },
        { label: 'Femenino', value: 'F' },
        { label: 'Otro', value: 'O' },
    ];

    useEffect(() => {
        const datosEjemplo = {
            nombre: 'Juan',
            apellido: 'Pérez',
            correo: 'juanperez@gmail.com',
            telefono: '98765432',
            direccion: 'Col. Miraflores, Tegucigalpa',
            genero: 'M',
            contrasena: '',
            foto: '/demo/images/avatar/stephenshaw.png' // 📌 Foto por defecto
        };
        setPerfil(datosEjemplo);
    }, []);

    const actualizarPerfil = () => {
        toast.current?.show({ severity: 'success', summary: 'Perfil actualizado', life: 3000 });
        console.log(perfil);
    };

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => {
                setPerfil({ ...perfil, foto: ev.target?.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <h2 className="text-2xl font-bold mb-4">Mi Perfil</h2>

            {/* Foto de perfil */}
            <div className="flex flex-column align-items-center mb-4">
                {perfil.foto && (
                    <img
                        src={perfil.foto}
                        alt="Foto de perfil"
                        className="border-circle"
                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    />
                )}

                <input
                    type="file"
                    accept="image/*"
                    id="fotoPerfil"
                    style={{ display: 'none' }}
                    onChange={handleFotoChange}
                />
                <label htmlFor="fotoPerfil">
                    <Button
                        label="Cambiar foto"
                        icon="pi pi-upload"
                        className="p-button-text mt-2"
                        type="button"
                        onClick={() => document.getElementById('fotoPerfil')?.click()}
                    />
                </label>
            </div>

            {/* Datos de perfil */}
            <div className="p-fluid grid formgrid">
                <div className="field col-12 md:col-6">
                    <label htmlFor="nombre">Nombre</label>
                    <InputText id="nombre" value={perfil.nombre} onChange={(e) => setPerfil({ ...perfil, nombre: e.target.value })} />
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="apellido">Apellido</label>
                    <InputText id="apellido" value={perfil.apellido} onChange={(e) => setPerfil({ ...perfil, apellido: e.target.value })} />
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="correo">Correo electrónico</label>
                    <InputText id="correo" value={perfil.correo} disabled />
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="telefono">Teléfono</label>
                    <InputText id="telefono" value={perfil.telefono} onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })} />
                </div>
                <div className="field col-12">
                    <label htmlFor="direccion">Dirección</label>
                    <InputText id="direccion" value={perfil.direccion} onChange={(e) => setPerfil({ ...perfil, direccion: e.target.value })} />
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="genero">Género</label>
                    <Dropdown id="genero" value={perfil.genero} options={generos} onChange={(e) => setPerfil({ ...perfil, genero: e.value })} placeholder="Seleccione" />
                </div>
               
            </div>

            <div className="mt-4">
                <Button label="Actualizar perfil" icon="pi pi-save" className="p-button-success" onClick={actualizarPerfil} />
            </div>
        </div>
    );
};

export default Perfil;
