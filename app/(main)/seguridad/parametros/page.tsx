'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import type { DataTableRowEditCompleteEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Checkbox } from 'primereact/checkbox';

// ==== Tipos ====
type ParamKind = 'SEGURIDAD' | 'SISTEMA' | 'APP';
type ValueType = 'number' | 'boolean' | 'string';

type Parametro = {
  id: string;
  clave: string;
  descripcion: string;
  tipo: ParamKind;
  valueType: ValueType;
  valor: string;
};

// ==== Parámetros por defecto ====
const DEFAULT_PARAMS: Parametro[] = [
  {
    id: 'session_timeout_minutes',
    clave: 'session_timeout_minutes',
    descripcion: 'Tiempo de sesión (minutos)',
    tipo: 'SEGURIDAD',
    valueType: 'number',
    valor: '30'
  },
  {
    id: 'max_failed_logins',
    clave: 'max_failed_logins',
    descripcion: 'Intentos fallidos permitidos',
    tipo: 'SEGURIDAD',
    valueType: 'number',
    valor: '5'
  },
  {
    id: 'pwd_min_length',
    clave: 'pwd_min_length',
    descripcion: 'Contraseña: longitud mínima',
    tipo: 'SEGURIDAD',
    valueType: 'number',
    valor: '8'
  },
  {
    id: 'pwd_require_uppercase',
    clave: 'pwd_require_uppercase',
    descripcion: 'Contraseña: requiere mayúscula',
    tipo: 'SEGURIDAD',
    valueType: 'boolean',
    valor: 'true'
  },
  {
    id: 'pwd_require_number',
    clave: 'pwd_require_number',
    descripcion: 'Contraseña: requiere número',
    tipo: 'SEGURIDAD',
    valueType: 'boolean',
    valor: 'true'
  },
  {
    id: 'pwd_require_special',
    clave: 'pwd_require_special',
    descripcion: 'Contraseña: requiere carácter especial',
    tipo: 'SEGURIDAD',
    valueType: 'boolean',
    valor: 'false'
  },
  {
    id: 'build_version',
    clave: 'build_version',
    descripcion: 'Versión del sistema (solo lectura)',
    tipo: 'SISTEMA',
    valueType: 'string',
    valor: '1.0.0'
  }
];

// ==== Helpers ====
const castOut = (p: Parametro) => {
  if (p.valueType === 'number') return Number(p.valor);
  if (p.valueType === 'boolean') return p.valor === 'true';
  return p.valor;
};

// ==== Página principal ====
export default function ParametrosPage() {
  const toast = useRef<Toast>(null);
  const [hydrated, setHydrated] = useState(false);
  const [params, setParams] = useState<Parametro[]>([]);
  const [search, setSearch] = useState('');

  // ---- Inicializar ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem('parametros');
      setParams(raw ? JSON.parse(raw) : DEFAULT_PARAMS);
    } catch {
      setParams(DEFAULT_PARAMS);
    } finally {
      setHydrated(true);
    }
  }, []);

  // ---- Guardar en localStorage ----
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('parametros', JSON.stringify(params));
  }, [params, hydrated]);

  // ---- Filtro de búsqueda ----
  const data = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return params;
    return params.filter(
      (p) =>
        p.clave.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q) ||
        p.tipo.toLowerCase().includes(q)
    );
  }, [params, search]);

  // ---- Edición en tabla (row edit mode) ----
  const onRowEditComplete = (e: DataTableRowEditCompleteEvent) => {
    const { newData } = e;
    const param = params.find((p) => p.id === newData.id);
    if (!param) return;

    if (param.tipo === 'SISTEMA') {
      toast.current?.show({
        severity: 'warn',
        summary: 'Protegido',
        detail: 'Este parámetro es de tipo SISTEMA y no se puede editar.',
        life: 2500
      });
      return;
    }

    const validated = validateValue(param, newData.valor);
    if (!validated.ok) {
      toast.current?.show({
        severity: 'error',
        summary: 'Valor inválido',
        detail: validated.msg,
        life: 3000
      });
      return;
    }

    setParams((prev) =>
      prev.map((p) => (p.id === param.id ? { ...p, valor: validated.value } : p))
    );

    toast.current?.show({
      severity: 'success',
      summary: 'Actualizado',
      detail: 'Parámetro guardado',
      life: 2000
    });
  };

  // ---- Editor personalizado ----
  const valorEditor = (options: any) => {
    const p: Parametro = options.rowData;
    if (p.valueType === 'boolean') {
      return (
        <Checkbox
          checked={castOut(p) as boolean}
          onChange={(e) =>
            options.editorCallback(e.checked ? 'true' : 'false')
          }
          disabled={p.tipo === 'SISTEMA'}
        />
      );
    }
    return (
      <InputText
        type={p.valueType === 'number' ? 'number' : 'text'}
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
        disabled={p.tipo === 'SISTEMA'}
      />
    );
  };

  // ---- Validación de valores ----
  function validateValue(
    p: Parametro,
    raw: any
  ): { ok: boolean; value: string; msg?: string } {
    let val = String(raw);
    if (p.valueType === 'number') {
      if (!/^-?\d+(\.\d+)?$/.test(val)) {
        return { ok: false, value: p.valor, msg: 'Debe ser numérico.' };
      }
      const num = Number(val);
      if (p.id === 'session_timeout_minutes' && (num < 1 || num > 1440))
        return { ok: false, value: p.valor, msg: 'Debe estar entre 1 y 1440.' };
      if (p.id === 'max_failed_logins' && (num < 1 || num > 10))
        return { ok: false, value: p.valor, msg: 'Debe estar entre 1 y 10.' };
      if (p.id === 'pwd_min_length' && (num < 6 || num > 128))
        return {
          ok: false,
          value: p.valor,
          msg: 'Debe estar entre 6 y 128 caracteres.'
        };
      return { ok: true, value: String(num) };
    }

    if (p.valueType === 'boolean') {
      const b = val === 'true' || val === '1' || val === 'on';
      return { ok: true, value: b ? 'true' : 'false' };
    }

    if (!val.trim()) return { ok: false, value: p.valor, msg: 'Vacío no válido.' };
    return { ok: true, value: val.trim() };
  }

  // ---- Render helpers ----
  const tipoTemplate = (row: Parametro) => (
    <Tag
      value={row.tipo}
      severity={
        row.tipo === 'SISTEMA'
          ? 'warning'
          : row.tipo === 'SEGURIDAD'
          ? 'success'
          : 'info'
      }
    />
  );

  const valorTemplate = (row: Parametro) => {
    if (row.valueType === 'boolean') {
      const b = castOut(row) as boolean;
      return <Tag value={b ? 'Sí' : 'No'} severity={b ? 'success' : 'danger'} />;
    }
    return <span>{row.valor}</span>;
  };

  const accionesTemplate = (row: Parametro) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        disabled={row.tipo === 'SISTEMA'}
        onClick={() => openForm(row)}
        tooltip={row.tipo === 'SISTEMA' ? 'Protegido' : 'Editar'}
      />
    </div>
  );

  // ---- Modal de edición ----
  const [visibleForm, setVisibleForm] = useState(false);
  const [selected, setSelected] = useState<Parametro | null>(null);
  const [formValor, setFormValor] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  const openForm = (p: Parametro) => {
    setSelected(p);
    setFormValor(p.valor);
    setSubmitted(false);
    setVisibleForm(true);
  };

  const saveForm = () => {
    if (!selected) return;
    setSubmitted(true);

    const validated = validateValue(selected, formValor);
    if (!validated.ok) {
      toast.current?.show({
        severity: 'error',
        summary: 'Valor inválido',
        detail: validated.msg,
        life: 3000
      });
      return;
    }

    setParams((prev) =>
      prev.map((p) => (p.id === selected.id ? { ...p, valor: validated.value } : p))
    );

    setVisibleForm(false);
    setSelected(null);
    toast.current?.show({
      severity: 'success',
      summary: 'Actualizado',
      detail: 'Parámetro guardado',
      life: 2000
    });
  };

  // ---- Toolbar ----
  const leftToolbar = (
    <div className="flex flex-wrap gap-2">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar..."
        />
      </span>
      <Button
        icon="pi pi-refresh"
        label="Restaurar por defecto"
        outlined
        onClick={() => {
          setParams(DEFAULT_PARAMS);
          toast.current?.show({
            severity: 'info',
            summary: 'Restaurado',
            detail: 'Valores por defecto cargados.',
            life: 2000
          });
        }}
      />
    </div>
  );

  // ---- Render principal ----
  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <Toast ref={toast} />
          <h3 className="m-0 font-bold text-primary mb-3">
            Parámetros del sistema
          </h3>
          <Toolbar className="mb-4" left={leftToolbar} />

          <DataTable
            value={data}
            dataKey="id"
            paginator
            rows={10}
            editMode="row"
            onRowEditComplete={onRowEditComplete}
            stripedRows
            responsiveLayout="scroll"
            emptyMessage="No se encontraron parámetros."
          >
            <Column field="clave" header="Clave" sortable />
            <Column field="descripcion" header="Descripción" sortable />
            <Column field="tipo" header="Tipo" body={tipoTemplate} sortable />
            <Column
              field="valor"
              header="Valor"
              body={valorTemplate}
              editor={valorEditor}
              headerStyle={{ minWidth: '14rem' }}
            />
            <Column
              header="Acciones"
              body={accionesTemplate}
              headerStyle={{ width: '6rem' }}
            />
          </DataTable>

          {/* Modal edición */}
          <Dialog
            header={`Editar parámetro${
              selected ? `: ${selected.clave}` : ''
            }`}
            visible={visibleForm}
            style={{ width: '520px' }}
            modal
            onHide={() => setVisibleForm(false)}
            footer={
              <div className="flex justify-end gap-2">
                <Button
                  label="Cancelar"
                  text
                  onClick={() => setVisibleForm(false)}
                />
                <Button
                  label="Guardar"
                  icon="pi pi-check"
                  onClick={saveForm}
                  disabled={selected?.tipo === 'SISTEMA'}
                />
              </div>
            }
          >
            {selected && (
              <div className="p-fluid">
                <div className="field mb-3">
                  <label className="block mb-2">Descripción</label>
                  <div>{selected.descripcion}</div>
                </div>

                <div className="field mb-3">
                  <label className="block mb-2">Tipo</label>
                  <Tag
                    value={selected.tipo}
                    severity={
                      selected.tipo === 'SISTEMA'
                        ? 'warning'
                        : selected.tipo === 'SEGURIDAD'
                        ? 'success'
                        : 'info'
                    }
                  />
                </div>

                <div className="field">
                  <label className="block mb-2">Valor</label>
                  {selected.valueType === 'boolean' ? (
                    <div className="flex align-items-center gap-2">
                      <Checkbox
                        inputId="chk"
                        checked={formValor === 'true'}
                        onChange={(e) =>
                          setFormValor(e.checked ? 'true' : 'false')
                        }
                        disabled={selected.tipo === 'SISTEMA'}
                      />
                      <label htmlFor="chk">
                        {formValor === 'true' ? 'Sí' : 'No'}
                      </label>
                    </div>
                  ) : (
                    <InputText
                      type={selected.valueType === 'number' ? 'number' : 'text'}
                      value={formValor}
                      onChange={(e) => setFormValor(e.target.value)}
                      className={`${
                        submitted && !formValor.trim()
                          ? 'p-invalid w-full'
                          : 'w-full'
                      }`}
                      disabled={selected.tipo === 'SISTEMA'}
                      placeholder={
                        selected.valueType === 'number'
                          ? 'Ej: 30'
                          : 'Ej: valor'
                      }
                    />
                  )}
                  {submitted &&
                    selected.valueType !== 'boolean' &&
                    !formValor.trim() && (
                      <small className="p-error">
                        El valor no puede estar vacío.
                      </small>
                    )}
                </div>
              </div>
            )}
          </Dialog>
        </div>
      </div>
    </div>
  );
}
