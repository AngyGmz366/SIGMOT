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
  foto?: string;
  username?: string;
  password?: string;
};

// ✅ Generador de ID seguro que no rompe SSR
const genId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const newUser = (roles: Rol[]): Usuario => ({
  id: genId(),
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
  const [hydrated, setHydrated] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);

  // ✅ Cargar desde localStorage solo en cliente
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const rawU = localStorage.getItem('usuarios');
      const rawR = localStorage.getItem('roles');
      setUsuarios(rawU ? JSON.parse(rawU) : []);
      setRoles(rawR ? JSON.parse(rawR) : []);
    } catch {
      setUsuarios([]);
      setRoles([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  // ✅ Guardar solo después de hidratar
  useEffect(() => {
    if (typeof window === 'undefined' || !hydrated) return;
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
  }, [usuarios, hydrated]);

  // --- filtros
  const [search, setSearch] = useState('');
  const [rolFilter, setRolFilter] = useState<string | null>(null);
  const [estadoFilter, setEstadoFilter] = useState<'activo' | 'inactivo' | null>(null);
  const [fechaRango, setFechaRango] = useState<[Date | null, Date | null] | null>(null);

  const data = useMemo(() => {
    if (!hydrated) return [];
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
          ? fr >= new Date(d1.setHours(0, 0, 0, 0)) && fr <= new Date(d2.setHours(23, 59, 59, 999))
          : d1
          ? fr >= new Date(d1.setHours(0, 0, 0, 0))
          : d2
          ? fr <= new Date(d2.setHours(23, 59, 59, 999))
          : true;

      return matchText && matchRol && matchEstado && matchFecha;
    });
  }, [usuarios, roles, search, rolFilter, estadoFilter, fechaRango, hydrated]);

  // --- Modales ---
  const [visibleForm, setVisibleForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userEdit, setUserEdit] = useState<Usuario | null>(null);

  const openNew = () => {
    setUserEdit(newUser(roles));
    setSubmitted(false);
    setVisibleForm(true);
  };

  const openEdit = (u: Usuario) => {
    setUserEdit({ ...u, password: '' });
    setSubmitted(false);
    setVisibleForm(true);
  };

  const saveUser = () => {
    if (!userEdit) return;
    setSubmitted(true);

    if (!userEdit.nombres.trim() || !userEdit.apellidos.trim() || !userEdit.correo.trim() || !userEdit.rolId) return;

    const exists = usuarios.some(p => p.id === userEdit.id);
    const updated = {
      ...userEdit,
      username: userEdit.username?.trim() || userEdit.correo
    };

    setUsuarios(prev =>
      exists ? prev.map(p => (p.id === updated.id ? updated : p)) : [...prev, updated]
    );

    toast.current?.show({
      severity: 'success',
      summary: 'Éxito',
      detail: exists ? 'Usuario actualizado' : 'Usuario creado',
      life: 2500
    });

    setVisibleForm(false);
    setUserEdit(null);
  };

  const deleteUser = (u: Usuario) => {
    setUsuarios(prev => prev.filter(p => p.id !== u.id));
    toast.current?.show({ severity: 'success', summary: 'Eliminado', life: 2000 });
  };

  // --- File upload seguro ---
  const onSelectFoto = async (e: FileUploadSelectEvent) => {
    if (!userEdit || typeof window === 'undefined') return;
    const file = (e.files && (e.files as File[])[0]) || (e.files as any)?.files?.[0];
    if (!file) return;
    const dataUrl = await new Promise<string>((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result as string);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
    setUserEdit({ ...userEdit, foto: dataUrl });
  };

  const estadoTemplate = (row: Usuario) => (
    <Tag value={row.estado === 'activo' ? 'Activo' : 'Inactivo'} severity={row.estado === 'activo' ? 'success' : 'danger'} />
  );

  const rolName = (id: string) => roles.find(r => r.id === id)?.nombre || '—';

  const fotoTemplate = (row: Usuario) =>
    row.foto ? <img src={row.foto} alt="foto" className="w-2rem h-2rem border-circle" /> : <span className="text-600">—</span>;

  const accionesTemplate = (row: Usuario) => (
    <div className="flex gap-2">
      <Button icon="pi pi-user-edit" rounded text onClick={() => openEdit(row)} title="Editar" />
      <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteUser(row)} title="Eliminar" />
    </div>
  );

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
    </div>
  );

  // 🚫 No renderizar tabla hasta hidratar, evita errores SSR
  if (!hydrated) return <div className="p-4 text-center">Cargando usuarios...</div>;

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <Toast ref={toast} />

          <Toolbar className="mb-4 surface-100 border-round shadow-1" left={leftToolbar} right={rightToolbar} />

          <DataTable
            value={data}
            dataKey="id"
            paginator
            rows={10}
            stripedRows
            responsiveLayout="scroll"
            emptyMessage="No se encontraron usuarios."
          >
            <Column header="Foto" body={fotoTemplate} />
            <Column field="nombres" header="Nombres" sortable />
            <Column field="apellidos" header="Apellidos" sortable />
            <Column field="correo" header="Correo" sortable />
            <Column header="Rol" body={(r) => rolName(r.rolId)} />
            <Column header="Estado" body={estadoTemplate} />
            <Column field="fechaRegistro" header="Fecha" body={(r: Usuario) => new Date(r.fechaRegistro).toLocaleDateString()} />
            <Column header="Acciones" body={accionesTemplate} />
          </DataTable>

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
                  <label className="block mb-2">Nombres</label>
                  <InputText
                    value={userEdit.nombres}
                    onChange={(e) => setUserEdit({ ...userEdit, nombres: e.target.value })}
                    className={`${submitted && !userEdit.nombres.trim() ? 'p-invalid w-full' : 'w-full'}`}
                  />
                  <label className="block mt-3 mb-2">Correo</label>
                  <InputText
                    value={userEdit.correo}
                    onChange={(e) => setUserEdit({ ...userEdit, correo: e.target.value })}
                    className={`${submitted && !userEdit.correo.trim() ? 'p-invalid w-full' : 'w-full'}`}
                  />
                </div>
                <div className="col-12 md:col-4">
                  <label className="block mb-2">Foto</label>
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
        </div>
      </div>
    </div>
  );
}
