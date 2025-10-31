'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';

type Permiso = {
  Id_Objeto: number;
  Objeto: string;
  Tipo_Objeto: string;
  Ver: number;
  Crear: number;
  Editar: number;
  Eliminar: number;
};

type Rol = {
  id: number;
  nombre: string;
};

export default function PermisosPorRolPage() {
  const toast = useRef<Toast>(null);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [rolSeleccionado, setRolSeleccionado] = useState<number | null>(null);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [filtro, setFiltro] = useState('');

  // 🔹 Cargar roles
  const cargarRoles = async () => {
    try {
      const res = await axios.get('/api/seguridad/roles');
      if (res.data.ok) {
        setRoles(res.data.data.map((r: any) => ({ id: r.id, nombre: r.nombre })));
      }
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los roles',
      });
    }
  };

  // 🔹 Cargar permisos según rol
  const cargarPermisos = async (idRol: number) => {
    try {
      const res = await axios.get(`/api/seguridad/permisos?rol=${idRol}`);
      if (res.data.ok) {
        setPermisos(res.data.data);
      } else setPermisos([]);
    } catch {
      toast.current?.show({
        severity: 'warn',
        summary: 'Aviso',
        detail: 'No se pudieron cargar los permisos',
      });
    }
  };

  useEffect(() => {
    cargarRoles();
  }, []);

  useEffect(() => {
    if (rolSeleccionado) cargarPermisos(rolSeleccionado);
  }, [rolSeleccionado]);

  // 🔹 Actualizar permiso individual
  const togglePermiso = async (row: Permiso, campo: keyof Permiso, value: boolean) => {
    try {
      // Actualiza localmente
      const nuevos = permisos.map((p) =>
        p.Id_Objeto === row.Id_Objeto ? { ...p, [campo]: value ? 1 : 0 } : p
      );
      setPermisos(nuevos);

      // Envía actualización al backend
      await axios.put('/api/seguridad/permisos', {
        idRol: rolSeleccionado,
        idObjeto: row.Id_Objeto,
        ver: campo === 'Ver' ? (value ? 1 : 0) : row.Ver,
        crear: campo === 'Crear' ? (value ? 1 : 0) : row.Crear,
        editar: campo === 'Editar' ? (value ? 1 : 0) : row.Editar,
        eliminar: campo === 'Eliminar' ? (value ? 1 : 0) : row.Eliminar,
      });

      toast.current?.show({
        severity: 'success',
        summary: 'Permiso actualizado',
        detail: `${campo} ${value ? 'activado' : 'desactivado'} para ${row.Objeto}`,
        life: 1500,
      });
    } catch (err) {
      console.error('Error al actualizar permiso:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar el permiso',
        life: 2000,
      });
    }
  };

  // 🔹 Filtro
  const permisosFiltrados = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    if (!q) return permisos;
    return permisos.filter((p) => p.Objeto.toLowerCase().includes(q));
  }, [permisos, filtro]);

  const permisosConKey = useMemo(() => {
    return permisosFiltrados.map((p, i) => ({
      ...p,
      uniqueKey: `${rolSeleccionado ?? 'rol'}-${p.Id_Objeto ?? 'obj-' + i}`,
    }));
  }, [permisosFiltrados, rolSeleccionado]);


  return (
    <div className="grid">
      <div className="col-12">
        <Card title="Permisos por Rol" subTitle="Administrar accesos del sistema">
          <Toast ref={toast} />

          {/* Selección de Rol */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Seleccionar rol</label>
            <Dropdown
              value={rolSeleccionado}
              options={roles.map((r) => ({ label: r.nombre, value: r.id }))}
              onChange={(e) => setRolSeleccionado(e.value)}
              placeholder="Elige un rol"
              className="w-full"
            />
          </div>

          {/* Filtro */}
          {rolSeleccionado && (
            <div className="mb-3">
              <span className="p-input-icon-left w-full">
                <i className="pi pi-search" />
                <InputText
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  placeholder="Filtrar por nombre de objeto..."
                  className="w-full"
                />
              </span>
            </div>
          )}

          {/* Tabla */}
          {!rolSeleccionado ? (
            <div className="text-600">Selecciona un rol para ver los permisos.</div>
          ) : (
            <DataTable
              value={permisosConKey}
              dataKey="uniqueKey"
              stripedRows
              responsiveLayout="scroll"
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25]}
              emptyMessage="No hay permisos."
            >


              <Column field="Objeto" header="Objeto" sortable />
              <Column field="Tipo_Objeto" header="Tipo" sortable />
              <Column
                header="Ver"
                body={(row) => (
                  <InputSwitch
                    key={`ver-${row.Id_Objeto}`}
                    checked={!!row.Ver}
                    onChange={(e) => togglePermiso(row, 'Ver', e.value)}
                  />
                )}
                style={{ textAlign: 'center' }}
              />
              <Column
                header="Crear"
                body={(row) => (
                  <InputSwitch
                    key={`crear-${row.Id_Objeto}`}
                    checked={!!row.Crear}
                    onChange={(e) => togglePermiso(row, 'Crear', e.value)}
                  />
                )}
                style={{ textAlign: 'center' }}
              />
              <Column
                header="Editar"
                body={(row) => (
                  <InputSwitch
                    key={`editar-${row.Id_Objeto}`}
                    checked={!!row.Editar}
                    onChange={(e) => togglePermiso(row, 'Editar', e.value)}
                  />
                )}
                style={{ textAlign: 'center' }}
              />
              <Column
                header="Eliminar"
                body={(row) => (
                  <InputSwitch
                    key={`eliminar-${row.Id_Objeto}`}
                    checked={!!row.Eliminar}
                    onChange={(e) => togglePermiso(row, 'Eliminar', e.value)}
                  />
                )}
                style={{ textAlign: 'center' }}
              />
            </DataTable>
          )}
        </Card>
      </div>
    </div>
  );
}
