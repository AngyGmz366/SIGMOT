/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef } from 'react';
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    const router = useRouter();

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    // 🔒 Función para cerrar sesión
    const cerrarSesion = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            Cookies.remove('app_token');
            router.replace('/auth/Inicio');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    return (
        <div className="layout-topbar">
            {/* 🔹 Logo */}
            <Link href="/auth/Inicio" className="layout-topbar-logo" style={{ display: 'flex', alignItems: 'center' }}>
                <img
                    src="/demo/images/login/LOGO-SIGMOT.png"
                    alt="Logo SIGMOT"
                    style={{
                        width: '150px',
                        height: 'auto',
                        maxWidth: 'none'
                    }}
                />
            </Link>

            {/* 🔹 Botón para abrir menú lateral */}
            <button
                ref={menubuttonRef}
                type="button"
                className="p-link layout-menu-button layout-topbar-button"
                onClick={onMenuToggle}
            >
                <i className="pi pi-bars" />
            </button>

            {/* 🔹 Botón menú superior */}
            <button
                ref={topbarmenubuttonRef}
                type="button"
                className="p-link layout-topbar-menu-button layout-topbar-button"
                onClick={showProfileSidebar}
            >
                <i className="pi pi-ellipsis-v" />
            </button>

            {/* 🔹 Menú superior (perfil, login y cerrar sesión) */}
            <div
                ref={topbarmenuRef}
                className={classNames('layout-topbar-menu', {
                    'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible
                })}
            >
                {/* Perfil */}
                <Link href="/perfil">
                    <button className="layout-topbar-button">
                        <i className="pi pi-user" />
                    </button>
                </Link>

                {/* 🔴 Botón de Cerrar Sesión */}
                <Button
                    label="Cerrar Sesión"
                    icon="pi pi-sign-out"
                    className="p-button-danger p-button-sm ml-1"
                    onClick={cerrarSesion}
                />
            </div>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';
export default AppTopbar;
// app/layout/AppTopbar.tsx