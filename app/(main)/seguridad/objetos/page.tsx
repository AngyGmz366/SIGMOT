'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';

type Objeto = {
  id: string;
  nombre: string;
  nombreTecnico: string;   // slug para backend/ACL
  descripcion?: string;
  parentId: string | null; // null => Módulo, otro id => Submódulo
};

// Fallback para randomUUID en entornos viejos
const rid = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);

// Semilla demo
const DEFAULTS: Objeto[] = [
  { id: 'mod-1', nombre: 'Personas', nombreTecnico: 'personas', descripcion: 'Gestión de personas', parentId: null },
  { id: 'mod-2', nombre: 'Seguridad', nombreTecnico: 'seguridad', descripcion: 'Roles, permisos y usuarios', parentId: null },
  { id: 'sub-2a', nombre: 'Roles', nombreTecnico: 'roles', descripcion: 'Gestión de roles', parentId: 'mod-2' },
  { id: 'sub-2b', nombre: 'Permisos', nombreTecnico: 'permisos', descripcion: 'Matriz de permisos', parentId: 'mod-2' },
  { id: 'sub-2c', nombre: 'Usuarios', nombreTecnico: 'usuarios', descripcion: 'Gestión de usuarios', parentId: 'mod-2' },
];

export default function ObjetosPage() {
  const toast = useRef<Toast>(null);

  // --- Hydration-safe storage ---
  const [hydrated, setHydrated] = useState(false);
  const [objetos, setObjetos] = useState<Objeto[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('objetos');
      setObjetos(raw ? (JSON.parse(raw) as Objeto[]) : DEFAULTS);
    } catch {
      setObjetos(DEFAULTS);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('objetos', JSON.stringify(objetos));
  }, [objetos, hydrated]);

  // --- Filtros / búsqueda ---
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<'modulo' | 'submodulo' | null>(null);
  const [modFilter, setModFilter] = useState<string | null>(null); // filtra por módulo padre

  const modulos = useMemo(() => objetos.filter(o => o.parentId === null), [objetos]);

  const data = useMemo(() => {
    const q = search.trim().toLowerCase();
    return objetos.filter(o => {
      const isModulo = o.parentId === null;
      const matchText =
        !q ||
        o.nombre.toLowerCase().includes(q) ||
        o.nombreTecnico.toLowerCase().includes(q) ||
        (o.descripcion || '').toLowerCase().includes(q);

      const matchTipo =
        !tipoFilter ||
        (tipoFilter === 'modulo' && isModulo) ||
        (tipoFilter === 'submodulo' && !isModulo);

      const matchModulo =
        !modFilter ||
        o.parentId === modFilter ||
        (o.id === modFilter && isModulo); // si eliges el propio módulo, lo muestra también

      return matchText && matchTipo && matchModulo;
    });
  }, [objetos, search, tipoFilter, modFilter]);

  // --- Modales ---
  const [visibleForm, setVisibleForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [editing, setEditing] = useState<Objeto | null>(null);

  const [confirmDel, setConfirmDel] = useState<Objeto | null>(null);

  // --- Helpers ---
  const tipoDe = (o: Objeto) => (o.parentId ? 'Submódulo' : 'Módulo');
  const nombreModulo = (id: string | null) => {
    if (!id) return '—';
    return objetos.find(o => o.id === id)?.nombre || '—';
  };

  const abrirNuevo = () => {
    setEditing({ id: '', nombre: '', nombreTecnico: '', descripcion: '', parentId: null });
    setSubmitted(false);
    setVisibleForm(true);
  };

  const abrirEditar = (row: Objeto) => {
    setEditing({ ...row });
    setSubmitted(false);
    setVisibleForm(true);
  };

  const validarSlug = (s: string) => /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(s);

  const guardar = () => {
    if (!editing) return;
    setSubmitted(true);
    const e = editing;

    // Validaciones básicas
    if (!e.nombre.trim() || !e.nombreTecnico.trim()) return;
    if (!validarSlug(e.nombreTecnico)) {
      toast.current?.show({ severity: 'warn', summary: 'Nombre técnico inválido', detail: 'Usa solo minúsculas, números y -/_', life: 3000 });
      return;
    }

    // Unicidad de nombreTecnico
    const dup = objetos.some(o => o.nombreTecnico.toLowerCase() === e.nombreTecnico.toLowerCase() && o.id !== e.id);
    if (dup) {
      toast.current?.show({ severity: 'error', summary: 'Duplicado', detail: 'El nombre técnico ya existe.', life: 3000 });
      return;
    }

    setObjetos(prev => {
      if (e.id) {
        return prev.map(o => (o.id === e.id ? e : o));
      }
      return [...prev, { ...e, id: rid() }];
    });

    toast.current?.show({
      severity: 'success',
      summary: 'Éxito',
      detail: e.id ? 'Objeto actualizado' : 'Objeto creado',
      life: 2200
    });

    setVisibleForm(false);
    setEditing(null);
  };

  const eliminar = () => {
    if (!confirmDel) return;

    // Evitar borrar módulo con submódulos
    if (confirmDel.parentId === null) {
      const tieneHijos = objetos.some(o => o.parentId === confirmDel.id);
      if (tieneHijos) {
        toast.current?.show({ severity: 'warn', summary: 'No permitido', detail: 'El módulo tiene submódulos. Elimínalos primero.', life: 3000 });
        setConfirmDel(null);
        return;
      }
    }

    setObjetos(prev => prev.filter(o => o.id !== confirmDel.id));
    toast.current?.show({ severity: 'success', summary: 'Eliminado', life: 1800 });
    setConfirmDel(null);
  };

  // --- Templates ---
  const tipoTemplate = (row: Objeto) => (
    <Tag value={row.parentId ? 'Submódulo' : 'Módulo'} severity={row.parentId ? 'info' : 'success'} />
  );

  const parentTemplate = (row: Objeto) => <span>{row.parentId ? nombreModulo(row.parentId) : '—'}</span>;

  const accionesTemplate = (row: Objeto) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" rounded text onClick={() => abrirEditar(row)} />
      <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => setConfirmDel(row)} />
    </div>
  );

  // --- Toolbars ---
  const leftToolbar = (
    <div className="flex flex-wrap gap-2">
      <Button label="Nuevo objeto" icon="pi pi-plus" severity="success" onClick={abrirNuevo} />
    </div>
  );

  const rightToolbar = (
    <div className="flex flex-wrap gap-2 align-items-center">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." />
      </span>
      <Dropdown
        value={tipoFilter}
        onChange={(e) => setTipoFilter(e.value)}
        options={[
          { label: 'Todos', value: null },
          { label: 'Módulos', value: 'modulo' },
          { label: 'Submódulos', value: 'submodulo' }
        ]}
        placeholder="Tipo"
        className="w-12rem"
      />
      <Dropdown
        value={modFilter}
        onChange={(e) => setModFilter(e.value)}
        options={[{ label: 'Todos los módulos', value: null }, ...modulos.map(m => ({ label: m.nombre, value: m.id }))]}
        placeholder="Módulo"
        className="w-14rem"
      />
    </div>
  );

  // --- Footer dialogs ---
  const footerForm = (
    <div className="flex justify-end gap-2">
      <Button label="Cancelar" text onClick={() => setVisibleForm(false)} />
      <Button label="Guardar" icon="pi pi-check" onClick={guardar} />
    </div>
  );

  const footerDel = (
    <>
      <Button label="No" icon="pi pi-times" text onClick={() => setConfirmDel(null)} />
      <Button label="Sí, eliminar" icon="pi pi-check" text severity="danger" onClick={eliminar} />
    </>
  );

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <Toast ref={toast} />
          <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center mb-3 gap-3">
            <div className="flex align-items-center gap-3">
            
             <h3 className="m-0 font-bold text-primary">Objetos</h3>
            </div>
         </div>
          <Toolbar className="mb-4" left={leftToolbar} right={rightToolbar} />

          <DataTable
            value={data}
            dataKey="id"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            stripedRows
            responsiveLayout="scroll"
            emptyMessage="No se encontraron objetos."
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} objetos"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          >
            <Column field="nombre" header="Nombre" sortable />
            <Column field="nombreTecnico" header="Nombre técnico" sortable />
            <Column field="descripcion" header="Descripción" />
            <Column header="Tipo" body={tipoTemplate} sortable style={{ width: '10rem' }} />
            <Column header="Módulo padre" body={parentTemplate} sortable />
            <Column header="Acciones" body={accionesTemplate} headerStyle={{ minWidth: '10rem' }} />
          </DataTable>

          {/* Modal crear/editar */}
          <Dialog
            header={editing?.id ? 'Editar objeto' : 'Nuevo objeto'}
            visible={visibleForm}
            style={{ width: '600px', maxWidth: '95vw' }}
            modal
            onHide={() => setVisibleForm(false)}
            footer={footerForm}
          >
            {editing && (
              <div className="grid">
                <div className="col-12 md:col-6">
                  <label className="block mb-2">Nombre</label>
                  <InputText
                    value={editing.nombre}
                    onChange={(e) => setEditing({ ...editing, nombre: e.target.value })}
                    className={`${submitted && !editing.nombre.trim() ? 'p-invalid w-full' : 'w-full'}`}
                    placeholder="Ej: Usuarios"
                  />
                  {submitted && !editing.nombre.trim() && <small className="p-error">Requerido</small>}
                </div>
                <div className="col-12 md:col-6">
                  <label className="block mb-2">Nombre técnico</label>
                  <InputText
                    value={editing.nombreTecnico}
                    onChange={(e) => setEditing({ ...editing, nombreTecnico: e.target.value.trim() })}
                    className={`${submitted && !editing.nombreTecnico.trim() ? 'p-invalid w-full' : 'w-full'}`}
                    placeholder="Letras minúsculas, números y -/_"
                  />
                  {submitted && !editing.nombreTecnico.trim() && <small className="p-error">Requerido</small>}
                </div>
                <div className="col-12">
                  <label className="block mb-2">Descripción</label>
                  <InputText
                    value={editing.descripcion || ''}
                    onChange={(e) => setEditing({ ...editing, descripcion: e.target.value })}
                    className="w-full"
                    placeholder="¿Para qué sirve este objeto?"
                  />
                </div>
                <div className="col-12 md:col-6">
                  <label className="block mb-2">Tipo</label>
                  <Dropdown
                    value={editing.parentId ? 'sub' : 'mod'}
                    onChange={(e) => {
                      const v = e.value as 'mod' | 'sub';
                      setEditing({ ...editing, parentId: v === 'mod' ? null : (modulos[0]?.id ?? null) });
                    }}
                    options={[
                      { label: 'Módulo', value: 'mod' },
                      { label: 'Submódulo', value: 'sub' }
                    ]}
                    className="w-full"
                  />
                </div>
                {editing.parentId !== null && (
                  <div className="col-12 md:col-6">
                    <label className="block mb-2">Módulo padre</label>
                    <Dropdown
                      value={editing.parentId}
                      onChange={(e) => setEditing({ ...editing, parentId: e.value })}
                      options={modulos.map(m => ({ label: m.nombre, value: m.id }))}
                      placeholder="Selecciona un módulo"
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            )}
          </Dialog>

          {/* Confirmación eliminar */}
          <Dialog
            visible={!!confirmDel}
            style={{ width: '450px' }}
            header="Confirmar"
            modal
            footer={footerDel}
            onHide={() => setConfirmDel(null)}
          >
            <div className="flex align-items-center">
              <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
              <span>
                ¿Seguro que deseas eliminar <b>{confirmDel?.nombre}</b>?
              </span>
            </div>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
