/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useContext, useEffect, useState } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { AppMenuItem } from '@/types';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const [rol, setRol] = useState<string>('');
    const [permisos, setPermisos] = useState<any[]>([]);

    // 🔹 Cargar datos del rol y permisos
    useEffect(() => {
        const cargarDatos = () => {
            const rolStorage = localStorage.getItem('rolUsuario');
            const permisosStorage = localStorage.getItem('permisosUsuario');

            if (rolStorage) setRol(rolStorage);
            if (permisosStorage) {
                try {
                    const nuevos = JSON.parse(permisosStorage);
                    setPermisos(Array.isArray(nuevos) ? nuevos : []);
                    console.log('🟢 Permisos actualizados en AppMenu:', nuevos.length);
                } catch {
                    setPermisos([]);
                }
            }
        };

        cargarDatos();
        window.addEventListener('permisos-actualizados', cargarDatos);

        const interval = setInterval(cargarDatos, 1000);
        return () => {
            window.removeEventListener('permisos-actualizados', cargarDatos);
            clearInterval(interval);
        };
    }, []);

    // 🔹 Helper para validar permisos
    const puedeVer = (objeto: string) => {
        if (!permisos || permisos.length === 0) return false;

        return permisos.some((p) => {
            const nombre = (p.Objeto || '').toString().trim().toLowerCase();
            return nombre === objeto.toLowerCase() && Number(p.Ver) === 1;
        });
        console.log('🔍 Rol actual:', rol);
        console.log('📋 Permisos disponibles:', permisos.map(p => p.Objeto));
        console.log('👀 Prueba puedeVer("clientes"):', puedeVer('clientes'));

    };

    // ===============================
    // 🔹 MENÚS SEGÚN ROL
    // ===============================
    const adminMenu: AppMenuItem[] = [
        {
            label: '',
            items: puedeVer('global')
                ? [{ label: 'Inicio', icon: 'pi pi-fw pi-home', to: '/dashboard' }]
                : [],
        },
        {
            label: 'Administrador',
            icon: 'pi pi-fw pi-cog',
            items: [
                ...(puedeVer('personas') ? [{ label: 'Personas', icon: 'pi pi-fw pi-id-card', to: '/pages/Personas' }] : []),
                ...(puedeVer('clientes') ? [{ label: 'Clientes', icon: 'pi pi-fw pi-users', to: '/pages/Clientes' }] : []),
                ...(puedeVer('boletos') ? [{ label: 'Boletos', icon: 'pi pi-ticket', to: '/pages/Ventas' }] : []),
                ...(puedeVer('unidades') ? [{ label: 'Unidades', icon: 'pi pi-car', to: '/vehiculos' }] : []),
                ...(puedeVer('rutas') ? [{ label: 'Rutas', icon: 'pi pi-map', to: '/admin/rutas-admin' }] : []),
                ...(puedeVer('reportes') ? [{ label: 'Reportes', icon: 'pi pi-chart-line', to: '/reportes' }] : []),

                ...(puedeVer('seguridad') ||
                puedeVer('roles') ||
                puedeVer('usuarios') ||
                puedeVer('bitacora'))
                
                    ? [
                        {
                            label: 'Seguridad',
                            icon: 'pi pi-shield',
                            items: [
                                ...(puedeVer('roles') ? [{ label: 'Roles', icon: 'pi pi-users', to: '/seguridad/roles' }] : []),
                                ...(puedeVer('permisos') ? [{ label: 'Permisos por rol', icon: 'pi pi-lock', to: '/seguridad/permisos' }] : []),
                                ...(puedeVer('usuarios') ? [{ label: 'Usuarios', icon: 'pi pi-id-card', to: '/seguridad/usuario' }] : []),
                                ...(puedeVer('parametros') ? [{ label: 'Parámetros', icon: 'pi pi-cog', to: '/seguridad/parametros' }] : []),
                                ...(puedeVer('objetos') ? [{ label: 'Objetos', icon: 'pi pi-box', to: '/seguridad/objetos' }] : []),
                                ...(puedeVer('bitacora') ? [{ label: 'Bitácora', icon: 'pi pi-history', to: '/seguridad/bitacora' }] : []),
                                ...(puedeVer('respaldo') ? [{ label: 'Respaldo y Restauración', icon: 'pi pi-refresh', to: '/seguridad/respaldo' }] : []),
                            ],
                        },
                    ]
                    : [],

                ...(puedeVer('empleados') ? [{ label: 'Empleados', icon: 'pi pi-briefcase', to: '/pages/Empleados' }] : []),
                ...(puedeVer('mantenimiento') ? [{ label: 'Mantenimiento Transporte', icon: 'pi pi-wrench', to: '/pages/MantenimientoTransporte' }] : []),
                ...(puedeVer('incidencias') ? [{ label: 'Incidencias y Soporte', icon: 'pi pi-exclamation-triangle', to: '/admin/incidencias-sop' }] : []),
                ...(puedeVer('reservaciones') ? [{ label: 'Reservaciones', icon: 'pi pi-calendar', to: '/admin/reservaciones' }] : []),
            ],
        },
        {
            label: 'Cliente',
            icon: 'pi pi-fw pi-users',
            items: [
                ...(puedeVer('rutas') ? [{ label: 'Rutas', icon: 'pi pi-fw pi-map', to: '/cliente/rutas' }] : []),
                ...(puedeVer('reservaciones') ? [{ label: 'Reservación', icon: 'pi pi-fw pi-user', to: '/cliente/reservacion/nueva' }] : []),
                ...(puedeVer('reservaciones') ? [{ label: 'Mis Reservaciones', icon: 'pi pi-file', to: '/cliente/reservacion/mis-reservaciones' }] : []),
                ...(puedeVer('incidencias') ? [{ label: 'Incidencias y Soporte', icon: 'pi pi-fw pi-exclamation-triangle', to: '/cliente/incidencias-soporte' }] : []),
            ],
        },
    ];

    const clienteMenu: AppMenuItem[] = [
        {
            label: 'Cliente',
            icon: 'pi pi-fw pi-users',
            items: [
                { label: 'Rutas', icon: 'pi pi-fw pi-map', to: '/cliente/rutas' },
                { label: 'Nueva Reservación', icon: 'pi pi-fw pi-user', to: '/cliente/reservacion/nueva' },
                { label: 'Mis Reservaciones', icon: 'pi pi-file', to: '/cliente/reservacion/mis-reservaciones' },
                { label: 'Incidencias y Soporte', icon: 'pi pi-fw pi-exclamation-triangle', to: '/cliente/incidencias-soporte' },
            ],
        },
    ];

    const operadorMenu: AppMenuItem[] = [
        {
            label: 'Operador',
            icon: 'pi pi-fw pi-briefcase',
            items: [
                { label: 'Personas', icon: 'pi pi-fw pi-id-card', to: '/pages/Personas' },
                { label: 'Clientes', icon: 'pi pi-fw pi-users', to: '/pages/Clientes' },
                { label: 'Unidades', icon: 'pi pi-car', to: '/vehiculos' },
                { label: 'Rutas', icon: 'pi pi-map', to: '/admin/rutas-admin' },
                { label: 'Boletos', icon: 'pi pi-ticket', to: '/pages/Ventas' },
                { label: 'Reservaciones', icon: 'pi pi-fw pi-calendar', to: '/admin/reservaciones' },
                { label: 'Mantenimiento Transporte', icon: 'pi pi-wrench', to: '/pages/MantenimientoTransporte' },
                { label: 'Incidencias y Soporte', icon: 'pi pi-fw pi-exclamation-triangle', to: '/admin/incidencias-sop' },
            ],
        },
    ];

    const usuarioMenu: AppMenuItem[] = [
        {
            label: 'Usuario',
            items: [
                { label: 'Rutas', icon: 'pi pi-fw pi-map', to: '/cliente/rutas' },
                { label: 'Nueva Reservación', icon: 'pi pi-fw pi-user', to: '/cliente/reservacion/nueva' },
                { label: 'Mis Reservaciones', icon: 'pi pi-file', to: '/cliente/reservacion/mis-reservaciones' },
                { label: 'Incidencias y Soporte', icon: 'pi pi-fw pi-exclamation-triangle', to: '/cliente/incidencias-soporte' },
            ],
        },
    ];

    // ===============================
    // 🔹 Selección final
    // ===============================
    let model: AppMenuItem[] = [];
    switch (rol) {
        case 'Administrador':
            model = adminMenu;
            break;
        case 'Cliente':
            model = clienteMenu;
            break;
        case 'Operador':
            model = operadorMenu;
            break;
        case 'Usuario':
        default:
            model = usuarioMenu;
            break;
    }

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) =>
                    !item?.seperator ? (
                        <AppMenuitem item={item} root={true} index={i} key={item.label} />
                    ) : (
                        <li className="menu-separator" key={i}></li>
                    )
                )}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
