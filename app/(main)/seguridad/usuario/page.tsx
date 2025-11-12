'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';

type Rol = { id: number; nombre: string };
type Usuario = {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono?: string;
  rolId: number;
  rol?: string;
  estado: string;
  fechaRegistro: string;
};

export default function UsuariosPage() {
  const toast = useRef<Toast>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleForm, setVisibleForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [usuarioEdit, setUsuarioEdit] = useState<Usuario | null>(null);
  // 🔸 NUEVO: Guardar datos originales
  const [usuarioOriginal, setUsuarioOriginal] = useState<Usuario | null>(null);

  // 🔹 Cargar usuarios y roles
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resUsuarios = await fetch('/api/usuarios');
        const dataU = resUsuarios.ok ? await resUsuarios.json() : { items: [] };
        setUsuarios(dataU.items || []);

        const resRoles = await fetch('/api/seguridad/roles');
        const dataR = resRoles.ok ? await resRoles.json() : { data: [] };
        setRoles(dataR.data || []);
      } catch (err) {
        console.error('Error al cargar usuarios o roles:', err);
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los usuarios o roles.',
        });
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  // 🔹 Editar usuario existente
  const openEdit = async (row: Usuario) => {
    try {
      const res = await fetch(`/api/usuarios/obtener?id=${row.id}`);
      if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
      const data = await res.json();

      if (data.ok && data.item) {
        const u = data.item;
        const usuarioData = {
          id: u.Id_Usuario_PK || u.id || row.id,
          nombres: u.Nombres || u.nombres || '',
          apellidos: u.Apellidos || u.apellidos || '',
          correo: u.Correo_Electronico || u.Correo || u.correo || '',
          telefono: u.Telefono || u.telefono || '',
          rolId: u.Id_Rol_FK || u.rolId || 0,
          rol: u.Rol || u.rol || '',
          estado: u.Estado_Usuario || u.estado || 'ACTIVO',
          fechaRegistro: u.Fecha_Registro || '',
        };
        
        // 🔸 NUEVO: Guardar copia original
        setUsuarioOriginal({ ...usuarioData });
        setUsuarioEdit(usuarioData);
        setVisibleForm(true);
      } else {
        throw new Error('Usuario no encontrado.');
      }
    } catch (err) {
      console.error('Error al obtener usuario:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo obtener el usuario.',
      });
    }
  };

  // 🔹 Guardar cambios
  const saveUser = async () => {
    if (!usuarioEdit || !usuarioOriginal) return;
    setSubmitted(true);

    if (!usuarioEdit.nombres.trim() || !usuarioEdit.apellidos.trim()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Campos requeridos',
        detail: 'Completa los campos de nombre y apellido.',
      });
      return;
    }

    try {
      const body = {
        idUsuario: usuarioEdit.id,
        nombres: usuarioEdit.nombres,
        apellidos: usuarioEdit.apellidos,
        correo: usuarioEdit.correo,
        // 🔸 CAMBIO: Mantener teléfono original si no se editó
        telefono: usuarioEdit.telefono?.trim() || usuarioOriginal.telefono || null,
        idRol: usuarioEdit.rolId,
        idEstado: usuarioEdit.estado === 'ACTIVO' ? 2 : 4,
        idAdmin: 1,
      };

      const res = await fetch('/api/usuarios/actualizar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.ok) {
        // ✅ 1. Mostrar mensaje de éxito
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: data.message || 'Usuario actualizado correctamente',
        });

        // ✅ 2. Recargar la tabla
        const resU = await fetch('/api/usuarios');
        const dataU = await resU.json();
        setUsuarios(dataU.items || []);
        
        // ✅ 3. Cerrar modal y limpiar estados
        setVisibleForm(false);
        setUsuarioEdit(null);
        setUsuarioOriginal(null);
        setSubmitted(false);
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: data.error,
        });
      }
    } catch (err: any) {
      console.error('❌ Error al guardar usuario:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.message || 'No se pudo actualizar el usuario',
      });
    }
  };

  // 🔹 Cambiar estado desde tabla (ícono)
  const cambiarEstado = async (row: Usuario) => {
    const nuevo = row.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    try {
      const res = await fetch('/api/usuarios/cambiar-estado', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idUsuario: row.id,
          nuevoEstado: nuevo,
          idAdmin: 1,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: data.message,
        });
        setUsuarios((prev) =>
          prev.map((u) =>
            u.id === row.id ? { ...u, estado: nuevo } : u
          )
        );
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: data.error,
        });
      }
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cambiar el estado.',
      });
    }
  };

  const estados = [
    { label: 'Activo', value: 'ACTIVO' },
    { label: 'Inactivo', value: 'INACTIVO' },
  ];

  const estadoTemplate = (row: Usuario) => (
    <Tag
      value={row.estado}
      severity={row.estado === 'ACTIVO' ? 'success' : 'danger'}
    />
  );

  const accionesTemplate = (row: Usuario) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        tooltip="Editar"
        onClick={() => openEdit(row)}
      />
      <Button
        icon={row.estado === 'ACTIVO' ? 'pi pi-ban' : 'pi pi-check'}
        rounded
        text
        severity={row.estado === 'ACTIVO' ? 'warning' : 'success'}
        tooltip={
          row.estado === 'ACTIVO'
            ? 'Desactivar usuario'
            : 'Activar usuario'
        }
        onClick={() => cambiarEstado(row)}
      />
    </div>
  );

  // 🔹 Render principal
  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <Toast ref={toast} />

          <Toolbar
            className="mb-4 surface-100 border-round shadow-1"
            right={
              <div className="flex items-center gap-2 w-full">
                <span className="p-input-icon-left w-full max-w-xs sm:max-w-sm md:max-w-md">
                  <i className="pi pi-search" />
                  <InputText
                    className="w-full"
                    //placeholder="Buscar..."
                    onChange={(e) => {
                      const q = e.target.value.toLowerCase();
                      setUsuarios((prev) =>
                        prev.filter(
                          (u) =>
                            u.nombres.toLowerCase().includes(q) ||
                            u.apellidos.toLowerCase().includes(q) ||
                            u.correo.toLowerCase().includes(q)
                        )
                      );
                    }}
                  />
                </span>
              </div>
            }
          />

          <DataTable
            value={usuarios}
            loading={loading}
            paginator
            rows={10}
            dataKey="id"
            stripedRows
            emptyMessage="No se encontraron usuarios."
            responsiveLayout="scroll"
          >
            <Column field="id" header="ID" sortable />
            <Column field="nombres" header="Nombres" sortable />
            <Column field="apellidos" header="Apellidos" sortable />
            <Column field="correo" header="Correo" sortable />
            <Column field="rol" header="Rol" sortable />
            <Column header="Estado" body={estadoTemplate} sortable />
            <Column header="Acciones" body={accionesTemplate} />
          </DataTable>

          {/* 🔹 Modal de edición */}
          <Dialog
            header="Editar Usuario"
            visible={visibleForm}
            style={{ width: '700px', maxWidth: '95vw' }}
            modal
            onHide={() => {
              setVisibleForm(false);
              setUsuarioEdit(null);
              setUsuarioOriginal(null);
            }}
            footer={
              <div className="flex justify-end gap-2">
                <Button
                  label="Cancelar"
                  icon="pi pi-times"
                  text
                  onClick={() => {
                    setVisibleForm(false);
                    setUsuarioEdit(null);
                    setUsuarioOriginal(null);
                  }}
                />
                <Button label="Guardar" icon="pi pi-check" onClick={saveUser} />
              </div>
            }
          >
            {usuarioEdit && (
              <div className="grid">
                <div className="col-12 md:col-6">
                  <label className="block mb-2">Nombre</label>
                  <InputText
                    value={usuarioEdit.nombres}
                    onChange={(e) =>
                      setUsuarioEdit({
                        ...usuarioEdit,
                        nombres: e.target.value,
                      })
                    }
                    className="w-full"
                  />

                  <label className="block mt-3 mb-2">Apellido</label>
                  <InputText
                    value={usuarioEdit.apellidos}
                    onChange={(e) =>
                      setUsuarioEdit({
                        ...usuarioEdit,
                        apellidos: e.target.value,
                      })
                    }
                    className="w-full"
                  />

                  <label className="block mt-3 mb-2">Correo electrónico</label>
                  <InputText
                    value={usuarioEdit.correo}
                    disabled
                    className="w-full bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div className="col-12 md:col-6">
                  <label className="block mb-2">Teléfono</label>
                  <InputText
                    value={usuarioEdit.telefono || ''}
                    onChange={(e) =>
                      setUsuarioEdit({
                        ...usuarioEdit,
                        telefono: e.target.value,
                      })
                    }
                    className="w-full"
                  />

                  <label className="block mt-3 mb-2">Rol</label>
                  <Dropdown
                    value={usuarioEdit.rolId}
                    options={roles.map((r) => ({
                      label: r.nombre,
                      value: r.id,
                    }))}
                    onChange={(e) =>
                      setUsuarioEdit({ ...usuarioEdit, rolId: e.value })
                    }
                    placeholder="Selecciona un rol"
                    className="w-full"
                  />

                  <label className="block mt-3 mb-2">Estado</label>
                  <Dropdown
                    value={usuarioEdit.estado}
                    options={estados}
                    onChange={(e) =>
                      setUsuarioEdit({ ...usuarioEdit, estado: e.value })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </Dialog>
        </div>
      </div>
    </div>
  );
}