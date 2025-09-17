/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { AppMenuItem } from '@/types';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);

    const model: AppMenuItem[] = [
        {
            label: 'Menu',
            items: [{ label: 'Principal', icon: 'pi pi-fw pi-home', to: '/dashboard' }]
        },

        /*{
            label: 'Secciones',
            icon: 'pi pi-fw pi-briefcase',
            to: '/pages',
            items: [
               // { label: 'Landing', icon: 'pi pi-fw pi-globe', to: '/landing' },
                /*{
                    label: 'Auth',
                    icon: 'pi pi-fw pi-user',
                    items: [
                        { label: 'Login', icon: 'pi pi-fw pi-sign-in', to: '/auth/login' },
                       // { label: 'Error', icon: 'pi pi-fw pi-times-circle', to: '/auth/error' },
                       // { label: 'Access Denied', icon: 'pi pi-fw pi-lock', to: '/auth/access' }
                    ]
                },/*
               // { label: 'Crud', icon: 'pi pi-fw pi-pencil', to: '/pages/crud' },
                { label: 'Empleados', icon: 'pi pi-fw pi-pencil', to: '/pages/Empleados' },
                { label: 'Personas', icon: 'pi pi-fw pi-id-card', to: '/pages/Personas' },
                { label: 'Clientes', icon: 'pi pi-fw pi-users', to: '/pages/Clientes' },


                

                


               // { label: 'Timeline', icon: 'pi pi-fw pi-calendar', to: '/pages/timeline' },
               // { label: 'Not Found', icon: 'pi pi-fw pi-exclamation-circle', to: '/pages/notfound' },
                //{ label: 'Reportes', icon: 'pi pi-chart-bar', to: '/reportes' },//
               // { label: 'Vehículos', icon: 'pi pi-car', to: '/vehiculos' },
               // { label: 'Empty', icon: 'pi pi-fw pi-circle-off', to: '/pages/empty' }
            ]
        },*/
        {
            label: 'Administrador',
            icon: 'pi pi-fw pi-cog',
            items: [

                { label: 'Personas', icon: 'pi pi-fw pi-id-card', to: '/pages/Personas' },
                { label: 'Clientes', icon: 'pi pi-fw pi-users', to: '/pages/Clientes' },
                { label: 'Boletos', icon: 'pi pi-ticket', to: '/pages/Ventas' },

               // { label: 'Timeline', icon: 'pi pi-fw pi-calendar', to: '/pages/timeline' },
               // { label: 'Not Found', icon: 'pi pi-fw pi-exclamation-circle', to: '/pages/notfound' },
                //{ label: 'Reportes', icon: 'pi pi-chart-bar', to: '/reportes' },//
                { label: 'Vehículos', icon: 'pi pi-car', to: '/vehiculos' },
                // Ejemplo en tu AppMenu (modelo del menú)
                {
                label: 'Seguridad',
                icon: 'pi pi-shield',
                items: [
                    { label: 'Roles', icon: 'pi pi-users', to: '/seguridad/roles' },
                    { label: 'Permisos por rol', icon: 'pi pi-lock', to: '/seguridad/permisos' },
                    { label: 'Usuarios', icon: 'pi pi-fw pi-id-card', to: '/seguridad/usuario' },
                    { label: 'Parametros', icon: 'pi pi-cog', to: '/seguridad/parametros' },
                    { label: 'Objetos', icon: 'pi pi-box', to: '/seguridad/objetos'},
                    { label: 'Bitácora', icon: 'pi pi-history', to: '/seguridad/bitacora' },
                    { label: 'Respaldo y Restauración', icon: 'pi pi-refresh', to: '/seguridad/respaldo' }
                    
                ]
                },

                /* {
                     label: 'Crud',
                     icon: 'pi pi-fw pi-pencil',
                     to: '/pages/crud'
                 },*/
                {
                    label: 'Empleados',
                    icon: 'pi pi-fw pi-id-card',
                    items: [
                        {
                            label: 'Gestión de Empleados',
                            icon: 'pi pi-fw pi-briefcase',
                            to: '/pages/Empleados'
                        },
                        {
                            label: 'Planilla de Pagos',
                            icon: 'pi pi-fw pi-money-bill',
                            to: '/pages/PlanillaPagos'
                        }
                    ]
                },

                {
                    label: 'Mantenimiento Transporte',
                    icon: 'pi pi-wrench',
                    to: '/pages/MantenimientoTransporte'
                },
                {

                    label: 'Incidencias  y Soporte',
                    icon: 'pi pi-fw pi-exclamation-triangle',
                    to: '/admin/incidencias-sop'
                },
                {
                    label: 'Reservaciones',

                    icon: 'pi pi-fw pi-calendar',
                    to: '/admin/reservaciones'
                },
                {
                    label: 'Rutas',
                    icon: 'pi pi-fw pi-map',
                    to: '/admin/rutas-admin'
                }
            ]
        },
        {
            label: 'Cliente',
            icon: 'pi pi-fw pi-users',
            items: [
                {
                    label: 'Incidencias y Soporte',
                    icon: 'pi pi-fw pi-exclamation-triangle',
                    to: '/cliente/incidencias-soporte'
                },

                {
                    label: 'Rutas',
                    icon: 'pi pi-fw pi-map',
                    to: '/cliente/rutas'
                },
                {
                    label: 'Nueva Reservación',
                    icon: 'pi pi-fw pi-user',
                    to: '/cliente/reservacion/nueva'
                },
                {
                    label: 'Mis Reservaciones',
                    icon: 'pi pi-file',
                    to: '/cliente/reservacion/mis-reservaciones'
                }

            ]
        }


    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}


            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
