'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { InputSwitch } from 'primereact/inputswitch';
import { v4 as uuidv4 } from 'uuid';

/* ===============================
   Tipos
=============================== */
type PermisoAcciones = {
  objeto: string;
  ver: boolean;
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
};

type Rol = {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  permisos: PermisoAcciones[];
};

/* ===============================
   Catálogo base de permisos
=============================== */
const PERMISOS_BASE: PermisoAcciones[] = [
  { objeto: 'personas', ver: false, crear: false, editar: false, eliminar: false },
  { objeto: 'usuarios', ver: false, crear: false, editar: false, eliminar: false },
  { objeto: 'roles', ver: false, crear: false, editar: false, eliminar: false },
  { objeto: 'permisos', ver: false, crear: false, editar: false, eliminar: false },
  { objeto: 'parametros', ver: false, crear: false, editar: false, eliminar: false },
  { objeto: 'objetos', ver: false, crear: false, editar: false, eliminar: false },
  { objeto: 'bitacora', ver: false, crear: false, editar: false, eliminar: false },
];

const STORAGE_KEY = 'roles';

/* ===============================
   Componente principal
=============================== */
export default function RolesPage() {
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<Rol[]>>(null);

  const [roles, setRoles] = useState<Rol[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // ✅ Solo accede a localStorage en cliente
  useEffect(() => {
    if (typeof window === 'undefined') return; // evita error en SSR
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setRoles(raw ? JSON.parse(raw) : []);
    } catch {
      setRoles([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Guardar cambios en localStorage
  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
  }, [roles, hydrated]);

  const [selected, setSelected] = useState<Rol[]>([]);
  const [search, setSearch] = useState('');

  const [visibleForm, setVisibleForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [editing, setEditing] = useState<Rol>({
    id: '',
    nombre: '',
    descripcion: '',
    activo: true,
    permisos: structuredClone(PERMISOS_BASE),
  });

  /* ===============================
     Filtros y helpers
  =============================== */
  const data = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(
      r =>
        r.nombre.toLowerCase().includes(q) ||
        r.descripcion.toLowerCase().includes(q) ||
        (r.activo ? 'activo' : 'inactivo').includes(q)
    );
  }, [roles, search]);

  const rolVacio = (): Rol => ({
    id: '',
    nombre: '',
    descripcion: '',
    activo: true,
    permisos: structuredClone(PERMISOS_BASE),
  });

  /* ===============================
     CRUD de Roles
  =============================== */
  const abrirNuevo = () => {
    setEditing(rolVacio());
    setSubmitted(false);
    setVisibleForm(true);
  };

  const abrirEditar = (row: Rol) => {
    setEditing(structuredClone(row));
    setSubmitted(false);
    setVisibleForm(true);
  };

  const guardar = () => {
    setSubmitted(true);
    if (!editing.nombre.trim()) return;

    const lista = [...roles];
    if (editing.id) {
      const i = lista.findIndex(x => x.id === editing.id);
      if (i >= 0) lista[i] = editing;
      toast.current?.show({ severity: 'success', summary: 'Actualizado', detail: 'Rol actualizado', life: 2500 });
    } else {
      editing.id = uuidv4();
      lista.push(editing);
      toast.current?.show({ severity: 'success', summary: 'Creado', detail: 'Rol creado', life: 2500 });
    }
    setRoles(lista);
    setVisibleForm(false);
  };

  const [confirmDeleteOne, setConfirmDeleteOne] = useState<null | Rol>(null);
  const [confirmDeleteMany, setConfirmDeleteMany] = useState(false);

  const eliminarUno = () => {
    if (!confirmDeleteOne) return;
    setRoles(prev => prev.filter(r => r.id !== confirmDeleteOne.id));
    setConfirmDeleteOne(null);
    toast.current?.show({ severity: 'success', summary: 'Eliminado', detail: 'Rol eliminado', life: 2500 });
  };

  const eliminarVarios = () => {
    const ids = new Set(selected.map(s => s.id));
    setRoles(prev => prev.filter(r => !ids.has(r.id)));
    setSelected([]);
    setConfirmDeleteMany(false);
    toast.current?.show({ severity: 'success', summary: 'Eliminados', detail: 'Roles eliminados', life: 2500 });
  };

  /* ===============================
     Templates y acciones
  =============================== */
  const estadoTemplate = (row: Rol) => (
    <Tag value={row.activo ? 'Activo' : 'Inactivo'} severity={row.activo ? 'success' : 'danger'} />
  );

  const accionesTemplate = (row: Rol) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" rounded text onClick={() => abrirEditar(row)} />
      <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => setConfirmDeleteOne(row)} />
    </div>
  );

  const leftToolbar = (
    <div className="flex flex-wrap gap-2">
      <Button label="Nuevo rol" icon="pi pi-plus" severity="success" onClick={abrirNuevo} />
      <Button
        label="Eliminar seleccionados"
        icon="pi pi-trash"
        severity="danger"
        onClick={() => setConfirmDeleteMany(true)}
        disabled={!selected.length}
      />
    </div>
  );

  const rightToolbar = (
    <div className="flex items-center gap-2">
      <Button label="Exportar" icon="pi pi-upload" severity="help" onClick={() => dt.current?.exportCSV?.()} />
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." />
      </span>
    </div>
  );

  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h5 className="m-0">Gestión de Roles</h5>
    </div>
  );

  /* ===============================
     Permisos del rol
  =============================== */
  const [permisoFilter, setPermisoFilter] = useState('');

  const permisosFiltrados = useMemo(() => {
    const q = permisoFilter.trim().toLowerCase();
    if (!q) return editing.permisos;
    return editing.permisos.filter(p => p.objeto.toLowerCase().includes(q));
  }, [editing.permisos, permisoFilter]);

  const togglePermiso = (index: number, campo: keyof Omit<PermisoAcciones, 'objeto'>, value: boolean) => {
    const copia = [...editing.permisos];
    copia[index] = { ...copia[index], [campo]: value };
    setEditing({ ...editing, permisos: copia });
  };

  const marcarTodo = () => {
    setEditing({
      ...editing,
      permisos: editing.permisos.map(p => ({ ...p, ver: true, crear: true, editar: true, eliminar: true })),
    });
  };

  const desmarcarTodo = () => {
    setEditing({
      ...editing,
      permisos: editing.permisos.map(p => ({ ...p, ver: false, crear: false, editar: false, eliminar: false })),
    });
  };

  /* ===============================
     Footers
  =============================== */
  const footerForm = (
    <div className="flex justify-end gap-2">
      <Button label="Cancelar" icon="pi pi-times" text onClick={() => setVisibleForm(false)} />
      <Button label="Guardar" icon="pi pi-check" onClick={guardar} />
    </div>
  );

  const footerDeleteOne = (
    <>
      <Button label="No" icon="pi pi-times" text onClick={() => setConfirmDeleteOne(null)} />
      <Button label="Sí, eliminar" icon="pi pi-check" text severity="danger" onClick={eliminarUno} />
    </>
  );

  const footerDeleteMany = (
    <>
      <Button label="No" icon="pi pi-times" text onClick={() => setConfirmDeleteMany(false)} />
      <Button label="Sí, eliminar" icon="pi pi-check" text severity="danger" onClick={eliminarVarios} />
    </>
  );

  /* ===============================
     Render final
  =============================== */
  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <Toast ref={toast} />
          <Toolbar className="mb-4" left={leftToolbar} right={rightToolbar} />

          <DataTable
            ref={dt}
            value={data}
            selection={selected}
            onSelectionChange={(e) => setSelected(e.value as Rol[])}
            selectionMode="multiple"
            dataKey="id"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            stripedRows
            responsiveLayout="scroll"
            header={header}
            emptyMessage="No se encontraron roles."
          >
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
            <Column field="nombre" header="Nombre" sortable />
            <Column field="descripcion" header="Descripción" sortable />
            <Column header="Estado" body={estadoTemplate} sortable />
            <Column header="Acciones" body={accionesTemplate} headerStyle={{ minWidth: '10rem' }} />
          </DataTable>

          {/* Modal Crear/Editar con Permisos */}
          <Dialog
            header={editing.id ? 'Editar rol' : 'Nuevo rol'}
            visible={visibleForm}
            style={{ width: '750px', maxWidth: '95vw' }}
            modal
            onHide={() => setVisibleForm(false)}
            footer={footerForm}
          >
            {/* Datos del rol */}
            <div className="grid">
              <div className="col-12 md:col-6">
                <div className="field">
                  <label className="block mb-2">Nombre</label>
                  <InputText
                    value={editing.nombre}
                    onChange={(e) => setEditing({ ...editing, nombre: e.target.value })}
                    className={`w-full ${submitted && !editing.nombre.trim() ? 'p-invalid' : ''}`}
                    placeholder="Administrador, Operario, Cliente…"
                  />
                  {submitted && !editing.nombre.trim() && (
                    <small className="p-error">El nombre es obligatorio.</small>
                  )}
                </div>
              </div>
              <div className="col-12 md:col-6">
                <div className="field">
                  <label className="block mb-2">Descripción</label>
                  <InputText
                    value={editing.descripcion}
                    onChange={(e) => setEditing({ ...editing, descripcion: e.target.value })}
                    className="w-full"
                    placeholder="Describe qué puede hacer este rol"
                  />
                </div>
              </div>
            </div>

            <div className="field">
              <label className="block mb-2">Estado</label>
              <Button
                type="button"
                label={editing.activo ? 'Activo' : 'Inactivo'}
                icon={editing.activo ? 'pi pi-check' : 'pi pi-ban'}
                severity={editing.activo ? 'success' : 'danger'}
                outlined
                onClick={() => setEditing({ ...editing, activo: !editing.activo })}
              />
            </div>

            {/* Permisos */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-3">
                <h6 className="m-0">Permisos del rol</h6>
                <div className="flex gap-2">
                  <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                      value={permisoFilter}
                      onChange={(e) => setPermisoFilter(e.target.value)}
                      placeholder="Filtrar objetos..."
                    />
                  </span>

                  <Button type="button" label="Marcar todo" icon="pi pi-check-circle" outlined size="small" onClick={marcarTodo} />
                  <Button type="button" label="Desmarcar todo" icon="pi pi-times-circle" outlined severity="danger" size="small" onClick={desmarcarTodo} />
                </div>
              </div>

              <DataTable value={permisosFiltrados} dataKey="objeto" responsiveLayout="scroll" stripedRows emptyMessage="No hay objetos que coincidan.">
                <Column field="objeto" header="Objeto" />
                {['ver', 'crear', 'editar', 'eliminar'].map((campo) => (
                  <Column
                    key={campo}
                    header={campo.charAt(0).toUpperCase() + campo.slice(1)}
                    body={(row, opts) => (
                      <InputSwitch
                        checked={row[campo as keyof PermisoAcciones] as boolean}
                        onChange={(e) => togglePermiso(opts.rowIndex, campo as any, e.value as boolean)}
                      />
                    )}
                    style={{ textAlign: 'center' }}
                  />
                ))}
              </DataTable>
            </div>
          </Dialog>

          {/* Confirmaciones */}
          <Dialog visible={!!confirmDeleteOne} style={{ width: '450px' }} header="Confirmar" modal footer={footerDeleteOne} onHide={() => setConfirmDeleteOne(null)}>
            <div className="flex align-items-center">
              <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
              <span>
                ¿Seguro que deseas eliminar el rol <b>{confirmDeleteOne?.nombre}</b>?
              </span>
            </div>
          </Dialog>

          <Dialog visible={confirmDeleteMany} style={{ width: '450px' }} header="Confirmar" modal footer={footerDeleteMany} onHide={() => setConfirmDeleteMany(false)}>
            <div className="flex align-items-center">
              <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
              <span>¿Seguro que deseas eliminar los roles seleccionados?</span>
            </div>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
