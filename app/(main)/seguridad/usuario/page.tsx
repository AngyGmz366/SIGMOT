'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { Password } from 'primereact/password';
import { Tag } from 'primereact/tag';
import { FileUpload, FileUploadSelectEvent } from 'primereact/fileupload';

type Rol = { id: string; nombre: string; descripcion?: string; activo?: boolean };
type Usuario = {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono?: string;
  rolId: string;
  estado: 'activo' | 'inactivo';
  fechaRegistro: string; // ISO
  foto?: string; // dataURL
  username?: string;
  password?: string;
};

const newUser = (roles: Rol[]): Usuario => ({
  id: (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`),
  nombres: '',
  apellidos: '',
  correo: '',
  telefono: '',
  rolId: roles[0]?.id || '',
  estado: 'activo',
  fechaRegistro: new Date().toISOString(),
  foto: '',
  username: '',
  password: ''
});

export default function UsuariosPage() {
  const toast = useRef<Toast>(null);

  // --- Hydration-safe stores ---
  const [hydrated, setHydrated] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);

  useEffect(() => {
    try {
      const rawU = localStorage.getItem('usuarios');
      const rawR = localStorage.getItem('roles');
      setUsuarios(rawU ? (JSON.parse(rawU) as Usuario[]) : []);
      setRoles(rawR ? (JSON.parse(rawR) as Rol[]) : []);
    } catch {
      setUsuarios([]);
      setRoles([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
  }, [usuarios, hydrated]);

  // --- Filtros / búsqueda ---
  const [search, setSearch] = useState('');
  const [rolFilter, setRolFilter] = useState<string | null>(null);
  const [estadoFilter, setEstadoFilter] = useState<'activo' | 'inactivo' | null>(null);
  const [fechaRango, setFechaRango] = useState<[Date | null, Date | null] | null>(null);

  const data = useMemo(() => {
    const q = search.trim().toLowerCase();
    const [d1, d2] = fechaRango || [null, null];
    return usuarios.filter(u => {
      const matchText =
        !q ||
        u.nombres.toLowerCase().includes(q) ||
        u.apellidos.toLowerCase().includes(q) ||
        u.correo.toLowerCase().includes(q) ||
        (roles.find(r => r.id === u.rolId)?.nombre.toLowerCase() || '').includes(q);

      const matchRol = !rolFilter || u.rolId === rolFilter;
      const matchEstado = !estadoFilter || u.estado === estadoFilter;

      const fr = new Date(u.fechaRegistro);
      const matchFecha =
        !d1 && !d2
          ? true
          : d1 && d2
          ? fr >= new Date(new Date(d1).setHours(0, 0, 0, 0)) &&
            fr <= new Date(new Date(d2).setHours(23, 59, 59, 999))
          : d1
          ? fr >= new Date(new Date(d1).setHours(0, 0, 0, 0))
          : d2
          ? fr <= new Date(new Date(d2).setHours(23, 59, 59, 999))
          : true;

      return matchText && matchRol && matchEstado && matchFecha;
    });
  }, [usuarios, roles, search, rolFilter, estadoFilter, fechaRango]);

  // --- Modales ---
  const [visibleForm, setVisibleForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userEdit, setUserEdit] = useState<Usuario | null>(null);

  const [visibleRole, setVisibleRole] = useState(false);
  const [userRole, setUserRole] = useState<Usuario | null>(null);
  const [nuevoRolId, setNuevoRolId] = useState<string>('');

  // --- Helpers ---
  const rolName = (id: string) => roles.find(r => r.id === id)?.nombre || '—';

  const openNew = () => {
    const u = newUser(roles);
    setUserEdit(u);
    setSubmitted(false);
    setVisibleForm(true);
  };

  const openEdit = (u: Usuario) => {
    setUserEdit({ ...u, password: '' });
    setSubmitted(false);
    setVisibleForm(true);
  };

  // ---- FIX: no llamar Toast dentro del setState ----
  const saveUser = () => {
    if (!userEdit) return;
    setSubmitted(true);

    if (!userEdit.nombres.trim() || !userEdit.apellidos.trim() || !userEdit.correo.trim() || !userEdit.rolId) return;

    let msg = ''; // mensaje para toast

    setUsuarios(prev => {
      const exists = prev.some(p => p.id === userEdit.id);
      msg = exists ? 'Usuario actualizado' : 'Usuario creado';

      const sanitized: Usuario = {
        ...userEdit,
        username: (userEdit.username?.trim() || userEdit.correo)
      };

      return exists ? prev.map(p => (p.id === sanitized.id ? sanitized : p)) : [...prev, sanitized];
    });

    // Mostrar toast después del setState
    toast.current?.show({ severity: 'success', summary: 'Éxito', detail: msg, life: 2500 });

    setVisibleForm(false);
    setUserEdit(null);
  };

  const toggleEstado = (u: Usuario) => {
    setUsuarios(prev =>
      prev.map(p => (p.id === u.id ? { ...p, estado: p.estado === 'activo' ? 'inactivo' : 'activo' } : p))
    );
  };

  const openChangeRole = (u: Usuario) => {
    setUserRole(u);
    setNuevoRolId(u.rolId);
    setVisibleRole(true);
  };

  const applyChangeRole = () => {
    if (!userRole) return;
    setUsuarios(prev => prev.map(p => (p.id === userRole.id ? { ...p, rolId: nuevoRolId } : p)));
    setVisibleRole(false);
    setUserRole(null);
    toast.current?.show({ severity: 'success', summary: 'Rol actualizado', life: 2000 });
  };

  const deleteUser = (u: Usuario) => {
    setUsuarios(prev => prev.filter(p => p.id !== u.id));
    toast.current?.show({ severity: 'success', summary: 'Usuario eliminado', life: 2000 });
  };

  // --- File upload a dataURL ---
  const onSelectFoto = async (e: FileUploadSelectEvent) => {
    if (!userEdit) return;
    const file = (e.files && (e.files as File[])[0]) || (e.files as any)?.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setUserEdit({ ...userEdit, foto: dataUrl });
  };

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result as string);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });

  // --- UI table templates ---
  const estadoTemplate = (row: Usuario) => (
    <Tag value={row.estado === 'activo' ? 'Activo' : 'Inactivo'} severity={row.estado === 'activo' ? 'success' : 'danger'} />
  );

  const rolTemplate = (row: Usuario) => <span>{rolName(row.rolId)}</span>;

  const fotoTemplate = (row: Usuario) =>
    row.foto ? <img src={row.foto} alt="foto" className="w-2rem h-2rem border-circle" /> : <span className="text-600">—</span>;

  const accionesTemplate = (row: Usuario) => (
    <div className="flex gap-2">
      <Button icon="pi pi-user-edit" rounded text onClick={() => openEdit(row)} title="Editar" />
      <Button icon="pi pi-sync" rounded text onClick={() => openChangeRole(row)} title="Cambiar rol" />
      <Button
        icon={row.estado === 'activo' ? 'pi pi-ban' : 'pi pi-check'}
        rounded
        text
        severity={row.estado === 'activo' ? 'danger' : 'success'}
        onClick={() => toggleEstado(row)}
        title={row.estado === 'activo' ? 'Desactivar' : 'Activar'}
      />
      <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteUser(row)} title="Eliminar" />
    </div>
  );

  // --- Toolbar ---
  const leftToolbar = (
    <div className="flex flex-wrap gap-2">
      <Button label="Nuevo usuario" icon="pi pi-plus" severity="success" onClick={openNew} />
    </div>
  );

  const rightToolbar = (
    <div className="flex flex-wrap gap-2 align-items-center">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." />
      </span>
      <Dropdown
        value={rolFilter}
        onChange={(e) => setRolFilter(e.value)}
        options={[{ label: 'Todos los roles', value: null }, ...roles.map(r => ({ label: r.nombre, value: r.id }))]}
        placeholder="Rol"
        className="w-12rem"
      />
      <Dropdown
        value={estadoFilter}
        onChange={(e) => setEstadoFilter(e.value)}
        options={[
          { label: 'Todos', value: null },
          { label: 'Activos', value: 'activo' },
          { label: 'Inactivos', value: 'inactivo' }
        ]}
        placeholder="Estado"
        className="w-10rem"
      />
      <Calendar
        value={fechaRango as any}
        onChange={(e) => setFechaRango(e.value as any)}
        selectionMode="range"
        placeholder="Rango de fecha"
        readOnlyInput
      />
    </div>
  );

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <Toast ref={toast} />
          <Toolbar className="mb-4" left={leftToolbar} right={rightToolbar} />

          <DataTable
            value={data}
            dataKey="id"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            stripedRows
            responsiveLayout="scroll"
            emptyMessage="No se encontraron usuarios."
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          >
            <Column header="Foto" body={fotoTemplate} style={{ width: '6rem' }} />
            <Column field="nombres" header="Nombres" sortable />
            <Column field="apellidos" header="Apellidos" sortable />
            <Column field="correo" header="Correo" sortable />
            <Column header="Rol" body={rolTemplate} sortable />
            <Column header="Estado" body={estadoTemplate} sortable />
            <Column field="fechaRegistro" header="Fecha" body={(r: Usuario) => new Date(r.fechaRegistro).toLocaleDateString()} sortable />
            <Column header="Acciones" body={accionesTemplate} headerStyle={{ minWidth: '14rem' }} />
          </DataTable>

          {/* Modal de usuario */}
          <Dialog
            header={userEdit?.id ? 'Editar usuario' : 'Nuevo usuario'}
            visible={visibleForm}
            style={{ width: '800px', maxWidth: '95vw' }}
            modal
            onHide={() => setVisibleForm(false)}
            footer={
              <div className="flex justify-end gap-2">
                <Button label="Cancelar" icon="pi pi-times" text onClick={() => setVisibleForm(false)} />
                <Button label="Guardar" icon="pi pi-check" onClick={saveUser} />
              </div>
            }
          >
            {userEdit && (
              <div className="grid">
                <div className="col-12 md:col-8">
                  <div className="grid">
                    <div className="col-12 md:col-6">
                      <label className="block mb-2">Nombres</label>
                      <InputText
                        value={userEdit.nombres}
                        onChange={(e) => setUserEdit({ ...userEdit, nombres: e.target.value })}
                        className={`${submitted && !userEdit.nombres.trim() ? 'p-invalid w-full' : 'w-full'}`}
                      />
                      {submitted && !userEdit.nombres.trim() && <small className="p-error">Requerido</small>}
                    </div>
                    <div className="col-12 md:col-6">
                      <label className="block mb-2">Apellidos</label>
                      <InputText
                        value={userEdit.apellidos}
                        onChange={(e) => setUserEdit({ ...userEdit, apellidos: e.target.value })}
                        className={`${submitted && !userEdit.apellidos.trim() ? 'p-invalid w-full' : 'w-full'}`}
                      />
                      {submitted && !userEdit.apellidos.trim() && <small className="p-error">Requerido</small>}
                    </div>
                    <div className="col-12 md:col-6">
                      <label className="block mb-2">Correo</label>
                      <InputText
                        type="email"
                        value={userEdit.correo}
                        onChange={(e) => setUserEdit({ ...userEdit, correo: e.target.value })}
                        className={`${submitted && !userEdit.correo.trim() ? 'p-invalid w-full' : 'w-full'}`}
                      />
                      {submitted && !userEdit.correo.trim() && <small className="p-error">Requerido</small>}
                    </div>
                    <div className="col-12 md:col-6">
                      <label className="block mb-2">Teléfono</label>
                      <InputText
                        value={userEdit.telefono || ''}
                        onChange={(e) => setUserEdit({ ...userEdit, telefono: e.target.value })}
                        className="w-full"
                      />
                    </div>
                    <div className="col-12 md:col-6">
                      <label className="block mb-2">Usuario</label>
                      <InputText
                        value={userEdit.username || ''}
                        onChange={(e) => setUserEdit({ ...userEdit, username: e.target.value })}
                        className="w-full"
                      />
                    </div>
                    <div className="col-12 md:col-6">
                      <label className="block mb-2">Contraseña</label>
                      <Password
                        value={userEdit.password || ''}
                        onChange={(e) => setUserEdit({ ...userEdit, password: e.target.value })}
                        toggleMask
                        feedback={false}
                        inputClassName="w-full"
                      />
                    </div>
                    <div className="col-12 md:col-6">
                      <label className="block mb-2">Rol</label>
                      <Dropdown
                        value={userEdit.rolId}
                        onChange={(e) => setUserEdit({ ...userEdit, rolId: e.value })}
                        options={roles.map(r => ({ label: r.nombre, value: r.id }))}
                        placeholder="Selecciona un rol"
                        className={`${submitted && !userEdit.rolId ? 'p-invalid w-full' : 'w-full'}`}
                      />
                      {submitted && !userEdit.rolId && <small className="p-error">Requerido</small>}
                    </div>
                    <div className="col-12 md:col-6">
                      <label className="block mb-2">Estado</label>
                      <Dropdown
                        value={userEdit.estado}
                        onChange={(e) => setUserEdit({ ...userEdit, estado: e.value })}
                        options={[
                          { label: 'Activo', value: 'activo' },
                          { label: 'Inactivo', value: 'inactivo' }
                        ]}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-12 md:col-4">
                  <label className="block mb-2">Foto de perfil (opcional)</label>
                  {userEdit.foto ? (
                    <img src={userEdit.foto} alt="preview" className="w-10rem h-10rem border-round mb-2 object-cover" />
                  ) : (
                    <div className="w-10rem h-10rem border-1 border-round surface-border flex align-items-center justify-content-center mb-2">
                      <span className="text-600">Sin foto</span>
                    </div>
                  )}
                  <FileUpload
                    mode="basic"
                    name="foto"
                    accept="image/*"
                    customUpload
                    auto
                    chooseLabel="Subir foto"
                    onSelect={onSelectFoto}
                  />
                </div>
              </div>
            )}
          </Dialog>

          {/* Cambiar rol */}
          <Dialog
            header="Cambiar rol"
            visible={visibleRole}
            style={{ width: '450px' }}
            modal
            onHide={() => setVisibleRole(false)}
            footer={
              <div className="flex justify-end gap-2">
                <Button label="Cancelar" text onClick={() => setVisibleRole(false)} />
                <Button label="Aplicar" onClick={applyChangeRole} />
              </div>
            }
          >
            <div className="field">
              <label className="block mb-2">Nuevo rol</label>
              <Dropdown
                value={nuevoRolId}
                onChange={(e) => setNuevoRolId(e.value)}
                options={roles.map(r => ({ label: r.nombre, value: r.id }))}
                placeholder="Selecciona un rol"
                className="w-full"
              />
            </div>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
