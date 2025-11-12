'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';

type Parametro = {
  id: number;
  parametro: string;
  valor: string;
  fechaCreacion: string;
  fechaModificacion: string | null;
  idUsuario: number | null;
  idRol: number | null;
  idObjeto: number | null;
};

export default function ParametrosPage() {
  const toast = useRef<Toast>(null);
  const [parametros, setParametros] = useState<Parametro[]>([]);
  const [loading, setLoading] = useState(true);

  const [visibleForm, setVisibleForm] = useState(false);
  const [selected, setSelected] = useState<Parametro | null>(null);
  const [nuevoValor, setNuevoValor] = useState('');
  const [search, setSearch] = useState('');

  // 🔹 Cargar parámetros desde la API
  const cargarParametros = async () => {
    try {
      const res = await fetch('/api/seguridad/parametros', { cache: 'no-store' });
      const data = await res.json();
      if (data.ok) {
        setParametros(data.items || []);
      } else {
        throw new Error(data.error || 'Error al cargar parámetros');
      }
    } catch (err: any) {
      console.error('Error al cargar parámetros:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los parámetros.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarParametros();
  }, []);

  // 🔹 Abrir modal de edición
  const openEdit = (p: Parametro) => {
    setSelected(p);
    setNuevoValor(p.valor);
    setVisibleForm(true);
  };

  // 🔹 Guardar cambios (PUT)
  const saveParametro = async () => {
    if (!selected) return;
    try {
      const res = await fetch('/api/seguridad/parametros', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idParametro: selected.id,
          valor: nuevoValor,
          idUsuario: 1, // Admin actual (ajusta según login)
        }),
      });

      const data = await res.json();
      if (data.ok) {
        toast.current?.show({
          severity: 'success',
          summary: 'Actualizado',
          detail: data.message || 'Parámetro actualizado correctamente',
        });

        setVisibleForm(false);
        setSelected(null);
        await cargarParametros(); // refrescar lista
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error('Error al actualizar parámetro:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.message || 'No se pudo actualizar el parámetro.',
      });
    }
  };

  // 🔹 Plantillas
  const accionesTemplate = (row: Parametro) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        tooltip="Editar valor"
        onClick={() => openEdit(row)}
      />
    </div>
  );

  const fechaTemplate = (row: Parametro) => {
    const fecha = row.fechaModificacion || row.fechaCreacion;
    return (
      <span>
        {new Date(fecha).toLocaleString('es-HN', {
          dateStyle: 'short',
          timeStyle: 'short',
        })}
      </span>
    );
  };

  // 🔹 Filtro de búsqueda
  const parametrosFiltrados = parametros.filter((p) =>
    p.parametro.toLowerCase().includes(search.toLowerCase())
  );

  // 🔹 Render principal
  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <Toast ref={toast} />
          <h3 className="m-0 font-bold text-primary mb-3">Parámetros del Sistema</h3>

          <Toolbar
            className="mb-4 surface-100 border-round shadow-1"
            right={
              <div className="flex items-center gap-2 w-full">
                <span className="p-input-icon-left w-full max-w-xs sm:max-w-sm md:max-w-md">
                  <i className="pi pi-search" />
                  <InputText
                    className="w-full"
                    //placeholder="Buscar parámetro..."
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </span>
              </div>
            }
          />

          <DataTable
            value={parametrosFiltrados}
            loading={loading}
            paginator
            rows={10}
            dataKey="id"
            stripedRows
            responsiveLayout="scroll"
            emptyMessage="No se encontraron parámetros."
          >
            <Column field="id" header="ID" sortable />
            <Column field="parametro" header="Parámetro" sortable />
            <Column field="valor" header="Valor" sortable />
            <Column
              field="fechaModificacion"
              header="Última Modificación"
              body={fechaTemplate}
              sortable
            />
            <Column header="Acciones" body={accionesTemplate} />
          </DataTable>

          {/* 🔹 Modal Edición */}
          <Dialog
            header={selected ? `Editar: ${selected.parametro}` : 'Editar Parámetro'}
            visible={visibleForm}
            style={{ width: '500px', maxWidth: '95vw' }}
            modal
            onHide={() => setVisibleForm(false)}
            footer={
              <div className="flex justify-end gap-2">
                <Button
                  label="Cancelar"
                  icon="pi pi-times"
                  text
                  onClick={() => setVisibleForm(false)}
                />
                <Button label="Guardar" icon="pi pi-check" onClick={saveParametro} />
              </div>
            }
          >
            {selected && (
              <div className="p-fluid">
                <div className="field mb-3">
                  <label className="block mb-2">ID</label>
                  <InputText value={String(selected.id)} disabled className="w-full" />
                </div>

                <div className="field mb-3">
                  <label className="block mb-2">Parámetro</label>
                  <InputText value={selected.parametro} disabled className="w-full" />
                </div>

                <div className="field mb-3">
                  <label className="block mb-2">Valor</label>
                  <InputText
                    value={nuevoValor}
                    onChange={(e) => setNuevoValor(e.target.value)}
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