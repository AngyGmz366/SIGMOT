'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

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

const PERMISOS_BASE: PermisoAcciones[] = [
  { objeto: 'personas', ver: false, crear: false, editar: false, eliminar: false },
  { objeto: 'usuarios', ver: false, crear: false, editar: false, eliminar: false },
  { objeto: 'roles', ver: false, crear: false, editar: false, eliminar: false },
  { objeto: 'permisos', ver: false, crear: false, editar: false, eliminar: false },
  { objeto: 'parametros', ver: false, crear: false, editar: false, eliminar: false },
  { objeto: 'objetos', ver: false, crear: false, editar: false, eliminar: false },
  { objeto: 'bitacora', ver: false, crear: false, editar: false, eliminar: false },
];

export default function PermisosPorRolPage() {
  const toast = useRef<Toast>(null);

  // Cargar roles desde localStorage (los mismos que usas en /seguridad/roles)
  const [roles, setRoles] = useState<Rol[]>(() => {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem('roles');
    return raw ? JSON.parse(raw) : [];
  });

  // Rol seleccionado
  const [rolId, setRolId] = useState<string>('');
  const rolActual: Rol | undefined = useMemo(
    () => roles.find(r => r.id === rolId),
    [roles, rolId]
  );

  // Filtro por objeto
  const [filtro, setFiltro] = useState('');

  // Permisos mostrados (filtrados)
  const permisosFiltrados = useMemo(() => {
    const permisos = rolActual?.permisos?.length ? rolActual.permisos : PERMISOS_BASE;
    const q = filtro.trim().toLowerCase();
    if (!q) return permisos;
    return permisos.filter(p => p.objeto.toLowerCase().includes(q));
  }, [rolActual, filtro]);

  // Guardar roles en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('roles', JSON.stringify(roles));
  }, [roles]);

  // Si no hay permisos aún, inicializa en el rol al seleccionarlo
  useEffect(() => {
    if (!rolActual) return;
    if (!rolActual.permisos || !rolActual.permisos.length) {
      const actualizados = roles.map(r =>
        r.id === rolActual.id ? { ...r, permisos: JSON.parse(JSON.stringify(PERMISOS_BASE)) } : r
      );
      setRoles(actualizados);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolId]);

  const opcionesRol = roles.map(r => ({ label: r.nombre, value: r.id }));

  // Toggle de switches con guardado en tiempo real
  const togglePermiso = (
    objeto: string,
    campo: keyof Omit<PermisoAcciones, 'objeto'>,
    value: boolean
  ) => {
    if (!rolActual) return;
    const rolesCopia = roles.map(r => {
      if (r.id !== rolActual.id) return r;
      const permisos = (r.permisos?.length ? r.permisos : JSON.parse(JSON.stringify(PERMISOS_BASE))).map((p: PermisoAcciones) =>
        p.objeto === objeto ? { ...p, [campo]: value } : p
      );
      return { ...r, permisos };
    });
    setRoles(rolesCopia);
    toast.current?.show({
      severity: 'success',
      summary: 'Guardado',
      detail: `Permiso "${campo}" actualizado para "${objeto}"`,
      life: 1500,
    });
  };

  // Acciones rápidas (activar/desactivar todo)
  const toggleTodos = (valor: boolean) => {
    if (!rolActual) return;
    const rolesCopia = roles.map(r => {
      if (r.id !== rolActual.id) return r;
      const permisos = (r.permisos?.length ? r.permisos : JSON.parse(JSON.stringify(PERMISOS_BASE))).map((p: PermisoAcciones) => ({
        ...p,
        ver: valor,
        crear: valor,
        editar: valor,
        eliminar: valor,
      }));
      return { ...r, permisos };
    });
    setRoles(rolesCopia);
    toast.current?.show({
      severity: 'info',
      summary: 'Actualización masiva',
      detail: valor ? 'Todos los permisos activados' : 'Todos los permisos desactivados',
      life: 1500,
    });
  };

  const headerTabla = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Filtrar por objeto..."
        />
      </span>

      <div className="flex gap-2">
        <Button
          type="button"
          label="Activar todo"
          icon="pi pi-check-circle"
          onClick={() => toggleTodos(true)}
          outlined
          size="small"
        />
        <Button
          type="button"
          label="Desactivar todo"
          icon="pi pi-times-circle"
          onClick={() => toggleTodos(false)}
          outlined
          severity="danger"
          size="small"
        />
      </div>
    </div>
  );

  return (
    <div className="grid">
      <div className="col-12">
        <Card title="Permisos por Rol" subTitle="Habilita o deshabilita permisos por objeto del sistema">
          <Toast ref={toast} />

          <div className="grid">
            <div className="col-12 md:col-6">
              <label className="block mb-2 font-medium">Seleccionar rol</label>
              <Dropdown
                value={rolId}
                options={opcionesRol}
                onChange={(e) => setRolId(e.value)}
                placeholder="Elige un rol"
                className="w-full"
              />
            </div>
          </div>

          {!rolActual ? (
            <div className="mt-4 text-600">Selecciona un rol para administrar sus permisos.</div>
          ) : (
            <div className="mt-4">
              <DataTable
                value={permisosFiltrados}
                dataKey="objeto"
                stripedRows
                responsiveLayout="scroll"
                header={headerTabla}
                emptyMessage="No hay objetos que coincidan con el filtro."
              >
                <Column field="objeto" header="Objeto" sortable />

                <Column
                  header="Ver"
                  body={(row: PermisoAcciones) => (
                    <InputSwitch
                      checked={row.ver}
                      onChange={(e) => togglePermiso(row.objeto, 'ver', e.value as boolean)}
                    />
                  )}
                  style={{ textAlign: 'center' }}
                />
                <Column
                  header="Crear"
                  body={(row: PermisoAcciones) => (
                    <InputSwitch
                      checked={row.crear}
                      onChange={(e) => togglePermiso(row.objeto, 'crear', e.value as boolean)}
                    />
                  )}
                  style={{ textAlign: 'center' }}
                />
                <Column
                  header="Editar"
                  body={(row: PermisoAcciones) => (
                    <InputSwitch
                      checked={row.editar}
                      onChange={(e) => togglePermiso(row.objeto, 'editar', e.value as boolean)}
                    />
                  )}
                  style={{ textAlign: 'center' }}
                />
                <Column
                  header="Eliminar"
                  body={(row: PermisoAcciones) => (
                    <InputSwitch
                      checked={row.eliminar}
                      onChange={(e) => togglePermiso(row.objeto, 'eliminar', e.value as boolean)}
                    />
                  )}
                  style={{ textAlign: 'center' }}
                />
              </DataTable>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
