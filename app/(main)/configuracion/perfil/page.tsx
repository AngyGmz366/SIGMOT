'use client';

import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import axios from 'axios';

const Perfil = () => {
    const toast = useRef<Toast>(null);

    const [perfil, setPerfil] = useState({
        nombre: '',
        apellido: '',
        correo: '',
        telefono: '',
        direccion: '',
        departamento: '',
        municipio: '',
        genero: '',
        foto: ''
    });

    const [loading, setLoading] = useState(true);

    const generos = [
        { label: 'Masculino', value: 'Masculino' },
        { label: 'Femenino', value: 'Femenino' },
        { label: 'Otro', value: 'Otro' },
    ];

    // 🔹 1. Cargar datos desde el backend
    useEffect(() => {
        const idUsuario = localStorage.getItem('idUsuario');
        if (!idUsuario) {
            toast.current?.show({ severity: 'warn', summary: 'Usuario no encontrado', life: 3000 });
            setLoading(false);
            return;
        }

        axios.get(`/api/usuarios/${idUsuario}`)
            .then(res => {
                if (res.data.ok) {
                    setPerfil({
                        nombre: res.data.data.nombre || '',
                        apellido: res.data.data.apellido || '',
                        correo: res.data.data.correo || '',
                        telefono: res.data.data.telefono || '',
                        direccion: res.data.data.direccion || '',
                        departamento: res.data.data.departamento || '',
                        municipio: res.data.data.municipio || '',
                        genero: res.data.data.genero || '',
                        foto: res.data.data.fotoPerfil || '/demo/images/avatar/stephenshaw.png'
                    });
                } else {
                    toast.current?.show({ severity: 'error', summary: 'No se encontró el perfil', life: 3000 });
                }
            })
            .catch(err => {
                console.error('Error al cargar perfil:', err);
                toast.current?.show({ severity: 'error', summary: 'Error al cargar perfil', life: 3000 });
            })
            .finally(() => setLoading(false));
    }, []);

    // 🔹 2. Cambiar foto localmente
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

    // 🔹 3. Actualizar perfil en la base
    const actualizarPerfil = async () => {
        try {
            const idUsuario = localStorage.getItem('idUsuario');
            if (!idUsuario) return;

            // ✅ Body ajustado para coincidir con el backend
            const body = {
                nombre: perfil.nombre,
                apellido: perfil.apellido,
                telefono: perfil.telefono,
                genero: perfil.genero,
                foto: perfil.foto,
                departamento: perfil.departamento,
                municipio: perfil.municipio
            };

            const res = await axios.put(`/api/usuarios/${idUsuario}`, body);

            if (res.data.ok) {
                toast.current?.show({ severity: 'success', summary: 'Perfil actualizado correctamente', life: 3000 });
            } else {
                toast.current?.show({ severity: 'warn', summary: res.data.error || 'No se pudo actualizar', life: 3000 });
            }
        } catch (error) {
            console.error(error);
            toast.current?.show({ severity: 'error', summary: 'Error al actualizar perfil', life: 3000 });
        }
    };

    if (loading) return <p>Cargando datos...</p>;

    return (
        <div className="card">
            <Toast ref={toast} />
            <h2 className="text-2xl font-bold mb-4">Mi Perfil</h2>

            {/* 📸 Foto de perfil */}
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

            {/* 🧾 Datos del perfil */}
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

                {/* 🏠 Campos nuevos para dirección */}
                <div className="field col-12 md:col-6">
                    <label htmlFor="departamento">Departamento</label>
                    <InputText id="departamento" value={perfil.departamento} onChange={(e) => setPerfil({ ...perfil, departamento: e.target.value })} />
                </div>
                <div className="field col-12 md:col-6">
                    <label htmlFor="municipio">Municipio</label>
                    <InputText id="municipio" value={perfil.municipio} onChange={(e) => setPerfil({ ...perfil, municipio: e.target.value })} />
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
