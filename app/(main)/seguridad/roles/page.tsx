'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import axios from 'axios';

/* ===============================
   Tipos
=============================== */
type Rol = {
  id: number;
  nombre: string;
  descripcion: string;
};

/* ===============================
   Componente principal
=============================== */
export default function RolesPage() {
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<Rol[]>>(null);

  const [roles, setRoles] = useState<Rol[]>([]);
  const [selected, setSelected] = useState<Rol[]>([]);
  const [search, setSearch] = useState('');

  // 🔹 Estados separados para modales
  const [visibleCrear, setVisibleCrear] = useState(false);
  const [visibleEditar, setVisibleEditar] = useState(false);
  const [visibleEliminar, setVisibleEliminar] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [editing, setEditing] = useState<Rol>({
    id: 0,
    nombre: '',
    descripcion: '',
  });

  /* ===============================
     Cargar roles desde API
  =============================== */
  const cargarRoles = async () => {
    try {
      const res = await axios.get('/api/seguridad/roles');
      console.log('📦 Roles recibidos:', res.data.data);
      if (res.data.ok) {
        setRoles(res.data.data);
      } else {
        toast.current?.show({
          severity: 'warn',
          summary: 'Aviso',
          detail: 'No se encontraron roles.',
          life: 2500,
        });
      }
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar roles.',
        life: 2500,
      });
    }
  };

  useEffect(() => {
    cargarRoles();
  }, []);

  /* ===============================
     CRUD
  =============================== */
  const abrirNuevo = () => {
    setEditing({ id: 0, nombre: '', descripcion: '' });
    setSubmitted(false);
    setVisibleCrear(true);
  };

  const abrirEditar = (row: Rol) => {
    console.log('🧠 Editar rol seleccionado:', row);
    if (!row || !row.id) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No se pudo cargar el rol seleccionado.',
        life: 2500,
      });
      return;
    }
    setEditing({ ...row });
    setSubmitted(false);
    setVisibleEditar(true);
  };

  const abrirEliminar = (row: Rol) => {
    setEditing({ ...row });
    setVisibleEliminar(true);
  };

  const limpiarEdicion = () => {
    setEditing({ id: 0, nombre: '', descripcion: '' });
    setSubmitted(false);
  };

  const guardar = async () => {
    setSubmitted(true);
    console.log('🧩 Intentando guardar:', editing);

    if (!editing.nombre.trim()) return;

    try {
      if (editing.id) {
        // 🔹 Actualizar
        await axios.put('/api/seguridad/roles', {
          id: editing.id,
          nombre: editing.nombre,
          descripcion: editing.descripcion,
          modificado_por: 'ADMINISTRADOR',
        });
        toast.current?.show({
          severity: 'success',
          summary: 'Actualizado',
          detail: 'Rol actualizado correctamente.',
          life: 2500,
        });
        setVisibleEditar(false);
      } else {
        // 🔹 Crear
        await axios.post('/api/seguridad/roles', {
          nombre: editing.nombre,
          descripcion: editing.descripcion,
          creado_por: 'ADMINISTRADOR',
        });
        toast.current?.show({
          severity: 'success',
          summary: 'Creado',
          detail: 'Rol creado correctamente.',
          life: 2500,
        });
        setVisibleCrear(false);
      }
      limpiarEdicion();
      await cargarRoles();
    } catch (error: any) {
      console.error(error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error?.response?.data?.error || 'No se pudo guardar el rol.',
        life: 2500,
      });
    }
  };

  const eliminarUno = async () => {
    try {
      await axios.delete(`/api/seguridad/roles?id=${editing.id}`);
      toast.current?.show({
        severity: 'success',
        summary: 'Eliminado',
        detail: 'Rol eliminado correctamente.',
        life: 2500,
      });
      setVisibleEliminar(false);
      limpiarEdicion();
      await cargarRoles();
    } catch (error) {
      console.error(error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo eliminar el rol.',
        life: 2500,
      });
    }
  };

  /* ===============================
     Filtros y helpers
  =============================== */
  const data = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(
      (r) =>
        r.nombre?.toLowerCase().includes(q) ||
        r.descripcion?.toLowerCase().includes(q)
    );
  }, [roles, search]);

  const accionesTemplate = (row: Rol) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        tooltip="Editar"
        onClick={() => abrirEditar(row)}
      />
      <Button
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        tooltip="Eliminar"
        onClick={() => abrirEliminar(row)}
      />
    </div>
  );

  const leftToolbar = (
    <div className="flex flex-wrap gap-2">
      <Button
        label="Nuevo rol"
        icon="pi pi-plus"
        severity="success"
        onClick={abrirNuevo}
      />
    </div>
  );

    const rightToolbar = (
    <div className="flex items-center gap-2">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar..."
        />
      </span>
    </div>
  );


  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h5 className="m-0">Gestión de Roles</h5>
    </div>
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

          {/* 🔹 Tabla */}
          <DataTable
            ref={dt}
            value={data}
            selection={selected}
            onSelectionChange={(e) => setSelected(e.value as Rol[])}
            selectionMode="multiple"
            dataKey="id" // ✅ usamos el ID real
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
            <Column header="Acciones" body={accionesTemplate} headerStyle={{ minWidth: '10rem' }} />
          </DataTable>

          {/* 🔹 Modal CREAR */}
          <Dialog
            header="Nuevo rol"
            visible={visibleCrear}
            style={{ width: '750px', maxWidth: '95vw' }}
            modal
            onHide={() => {
              setVisibleCrear(false);
              limpiarEdicion();
            }}
            footer={
              <div className="flex justify-end gap-2">
                <Button label="Cancelar" icon="pi pi-times" text onClick={() => setVisibleCrear(false)} />
                <Button label="Guardar" icon="pi pi-check" onClick={guardar} />
              </div>
            }
          >
            <Formulario editing={editing} setEditing={setEditing} submitted={submitted} />
          </Dialog>

          {/* 🔹 Modal EDITAR */}
          <Dialog
            header="Editar rol"
            visible={visibleEditar}
            style={{ width: '750px', maxWidth: '95vw' }}
            modal
            onHide={() => {
              setVisibleEditar(false);
              limpiarEdicion();
            }}
            footer={
              <div className="flex justify-end gap-2">
                <Button label="Cancelar" icon="pi pi-times" text onClick={() => setVisibleEditar(false)} />
                <Button label="Actualizar" icon="pi pi-check" onClick={guardar} />
              </div>
            }
          >
            <Formulario editing={editing} setEditing={setEditing} submitted={submitted} />
          </Dialog>

          {/* 🔹 Modal ELIMINAR */}
          <Dialog
            header="Confirmar eliminación"
            visible={visibleEliminar}
            style={{ width: '400px' }}
            modal
            footer={
              <div className="flex justify-end gap-2">
                <Button label="Cancelar" icon="pi pi-times" text onClick={() => setVisibleEliminar(false)} />
                <Button label="Eliminar" icon="pi pi-check" severity="danger" onClick={eliminarUno} />
              </div>
            }
            onHide={() => setVisibleEliminar(false)}
          >
            <p>
              ¿Seguro que deseas eliminar el rol <b>{editing.nombre}</b>?
            </p>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

/* ===============================
   Subcomponente Formulario
=============================== */
function Formulario({
  editing,
  setEditing,
  submitted,
}: {
  editing: Rol;
  setEditing: (r: Rol) => void;
  submitted: boolean;
}) {
  return (
    <div className="grid">
      <div className="col-12 md:col-6">
        <div className="field">
          <label className="block mb-2">Nombre</label>
          <InputText
            value={editing.nombre}
            onChange={(e) => setEditing({ ...editing, nombre: e.target.value })}
            className={`w-full ${submitted && !editing.nombre.trim() ? 'p-invalid' : ''}`}
            placeholder="Administrador, Cliente, Operador..."
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
            placeholder="Describe el rol"
          />
        </div>
      </div>
    </div>
  );
}
