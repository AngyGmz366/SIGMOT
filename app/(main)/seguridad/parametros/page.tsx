'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable, DataTableCellEditCompleteParams } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Checkbox } from 'primereact/checkbox';

type ParamKind = 'SEGURIDAD' | 'SISTEMA' | 'APP';
type ValueType = 'number' | 'boolean' | 'string';

type Parametro = {
  id: string;
  clave: string;              // p.e. session_timeout_minutes
  descripcion: string;
  tipo: ParamKind;            // SEGURIDAD / SISTEMA / APP
  valueType: ValueType;       // number | boolean | string
  valor: string;              // guardamos como string, casteamos según valueType
};

// ===== Defaults =====
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

// Helpers
const castOut = (p: Parametro) => {
  if (p.valueType === 'number') return Number(p.valor);
  if (p.valueType === 'boolean') return p.valor === 'true';
  return p.valor;
};

export default function ParametrosPage() {
  const toast = useRef<Toast>(null);

  // Hydration-safe localStorage
  const [hydrated, setHydrated] = useState(false);
  const [params, setParams] = useState<Parametro[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('parametros');
      setParams(raw ? (JSON.parse(raw) as Parametro[]) : DEFAULT_PARAMS);
    } catch {
      setParams(DEFAULT_PARAMS);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('parametros', JSON.stringify(params));
  }, [params, hydrated]);

  const data = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return params;
    return params.filter(
      p =>
        p.clave.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q) ||
        p.tipo.toLowerCase().includes(q)
    );
  }, [params, search]);

  // ----- Inline editing (tabla) -----
  const onCellEditComplete = (e: DataTableCellEditCompleteParams) => {
    const { rowData, newValue, field } = e;

    // bloquear SISTEMA
    if (rowData.tipo === 'SISTEMA') {
      e.preventDefault();
      toast.current?.show({ severity: 'warn', summary: 'Protegido', detail: 'Este parámetro es de tipo SISTEMA y no se puede editar.', life: 2500 });
      return;
    }

    // Solo permitimos editar 'valor'
    if (field !== 'valor') return;

    // validación según tipo
    const param = params.find(p => p.id === rowData.id);
    if (!param) return;

    const validated = validateValue(param, newValue);
    if (!validated.ok) {
      e.preventDefault();
      toast.current?.show({ severity: 'error', summary: 'Valor inválido', detail: validated.msg, life: 3000 });
      return;
    }

    setParams(prev => prev.map(p => (p.id === param.id ? { ...p, valor: validated.value } : p)));
    toast.current?.show({ severity: 'success', summary: 'Actualizado', detail: 'Parámetro guardado', life: 2000 });
  };

  // Editor por tipo
  const valorEditor = (options: any) => {
    const p: Parametro = options.rowData;
    if (p.valueType === 'boolean') {
      return (
        <Checkbox
          checked={castOut(p) as boolean}
          onChange={(e) => options.editorCallback((e.checked ? 'true' : 'false'))}
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

  // ----- Modal de edición -----
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

    if (selected.tipo === 'SISTEMA') {
      toast.current?.show({ severity: 'warn', summary: 'Protegido', detail: 'Este parámetro no se puede editar.', life: 2500 });
      return;
    }

    const validated = validateValue(selected, formValor);
    if (!validated.ok) {
      toast.current?.show({ severity: 'error', summary: 'Valor inválido', detail: validated.msg, life: 3000 });
      return;
    }

    setParams(prev => prev.map(p => (p.id === selected.id ? { ...p, valor: validated.value } : p)));
    setVisibleForm(false);
    setSelected(null);
    toast.current?.show({ severity: 'success', summary: 'Actualizado', detail: 'Parámetro guardado', life: 2000 });
  };

  // ----- Validaciones -----
  function validateValue(p: Parametro, raw: any): { ok: boolean; value: string; msg?: string } {
    // normalizar entrada
    let val = String(raw);

    if (p.valueType === 'number') {
      if (!/^-?\d+(\.\d+)?$/.test(val)) {
        return { ok: false, value: p.valor, msg: 'Debe ser numérico.' };
      }
      const num = Number(val);

      // reglas puntuales
      if (p.id === 'session_timeout_minutes') {
        if (num < 1 || num > 1440) return { ok: false, value: p.valor, msg: 'Tiempo de sesión debe ser entre 1 y 1440 minutos.' };
      }
      if (p.id === 'max_failed_logins') {
        if (num < 1 || num > 10) return { ok: false, value: p.valor, msg: 'Intentos fallidos debe estar entre 1 y 10.' };
      }
      if (p.id === 'pwd_min_length') {
        if (num < 6 || num > 128) return { ok: false, value: p.valor, msg: 'La longitud mínima debe estar entre 6 y 128.' };
      }
      return { ok: true, value: String(num) };
    }

    if (p.valueType === 'boolean') {
      const b = val === 'true' || val === '1' || val === 'on';
      return { ok: true, value: b ? 'true' : 'false' };
    }

    // string
    if (p.tipo === 'SISTEMA') {
      // por seguridad, no editable; (tabla lo bloquea, aquí devolvemos original)
      return { ok: false, value: p.valor, msg: 'Parámetro de SISTEMA: no editable.' };
    }

    // ejemplo: versión debe tener formato x.y.z si algún día fuera editable
    if (p.id === 'build_version' && !/^\d+\.\d+\.\d+$/.test(val)) {
      return { ok: false, value: p.valor, msg: 'Formato de versión inválido (x.y.z).' };
    }

    // strings genéricos
    if (!val.trim()) return { ok: false, value: p.valor, msg: 'El valor no puede estar vacío.' };
    return { ok: true, value: val.trim() };
  }

  // ----- Render helpers -----
  const tipoTemplate = (row: Parametro) => (
    <Tag value={row.tipo} severity={row.tipo === 'SISTEMA' ? 'warning' : row.tipo === 'SEGURIDAD' ? 'success' : 'info'} />
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
        tooltip={row.tipo === 'SISTEMA' ? 'Parámetro protegido' : 'Editar'}
      />
    </div>
  );

  const leftToolbar = (
    <div className="flex flex-wrap gap-2">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." />
      </span>
      <Button
        icon="pi pi-refresh"
        label="Restaurar por defecto"
        outlined
        onClick={() => {
          setParams(DEFAULT_PARAMS);
          toast.current?.show({ severity: 'info', summary: 'Restaurado', detail: 'Valores por defecto cargados.', life: 2000 });
        }}
      />
    </div>
  );

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <Toast ref={toast} />
          <Toolbar className="mb-4" left={leftToolbar} />

          <DataTable
            value={data}
            dataKey="id"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            stripedRows
            responsiveLayout="scroll"
            emptyMessage="No se encontraron parámetros."
            editMode="cell"
            onCellEditComplete={onCellEditComplete}
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
            <Column header="Acciones" body={accionesTemplate} headerStyle={{ width: '6rem' }} />
          </DataTable>

          {/* Modal edición con validaciones */}
          <Dialog
            header={`Editar parámetro${selected ? `: ${selected.clave}` : ''}`}
            visible={visibleForm}
            style={{ width: '520px' }}
            modal
            onHide={() => setVisibleForm(false)}
            footer={
              <div className="flex justify-end gap-2">
                <Button label="Cancelar" text onClick={() => setVisibleForm(false)} />
                <Button label="Guardar" icon="pi pi-check" onClick={saveForm} disabled={selected?.tipo === 'SISTEMA'} />
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
                  <div>
                    <Tag value={selected.tipo} severity={selected.tipo === 'SISTEMA' ? 'warning' : selected.tipo === 'SEGURIDAD' ? 'success' : 'info'} />
                  </div>
                </div>

                <div className="field">
                  <label className="block mb-2">Valor</label>
                  {selected.valueType === 'boolean' ? (
                    <div className="flex align-items-center gap-2">
                      <Checkbox
                        inputId="chk"
                        checked={formValor === 'true'}
                        onChange={(e) => setFormValor(e.checked ? 'true' : 'false')}
                        disabled={selected.tipo === 'SISTEMA'}
                      />
                      <label htmlFor="chk">{formValor === 'true' ? 'Sí' : 'No'}</label>
                    </div>
                  ) : (
                    <InputText
                      type={selected.valueType === 'number' ? 'number' : 'text'}
                      value={formValor}
                      onChange={(e) => setFormValor(e.target.value)}
                      className={`${submitted && !formValor.trim() ? 'p-invalid w-full' : 'w-full'}`}
                      disabled={selected.tipo === 'SISTEMA'}
                      placeholder={selected.valueType === 'number' ? 'Ej: 30' : 'Ej: valor'}
                    />
                  )}
                  {submitted && selected.valueType !== 'boolean' && !formValor.trim() && (
                    <small className="p-error">El valor no puede estar vacío.</small>
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
