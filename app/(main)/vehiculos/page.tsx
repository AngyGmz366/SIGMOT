'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { Dialog } from 'primereact/dialog'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Toolbar } from 'primereact/toolbar'
import { Toast } from 'primereact/toast'
import { InputTextarea } from 'primereact/inputtextarea';

// Interfaz de Vehículo
interface Vehiculo {
  id: number
  placa: string
  marcaUnidad: string
  modelo: string
  año: number
  capacidadAsientos?: number | null;
  descripcion?: string | null;
}

const fromDB = (row: any): Vehiculo => ({
  id: row.Id_Unidad_PK,
  placa: row.Numero_Placa,
  marcaUnidad: row.Marca_Unidad ?? '',
  modelo: row.Modelo ?? '',
  año: row['Año'] ?? 0,              
  capacidadAsientos: row.Capacidad_Asientos ?? null,
  descripcion: row.Descripcion ?? '',
});
  
const toPayload = (v: Vehiculo) => ({
  numeroPlaca: v.placa,
  marcaUnidad: v.marcaUnidad   || null,
  modelo: v.modelo || null,
  anio: v.año || null,
  capacidadAsientos: v.capacidadAsientos ?? null,
  descripcion: v.descripcion ?? null,
  idEstadoFk: 1,
});

const vehiculoService = {
  guardar: (vehiculos: Vehiculo[], vehiculoActual: Vehiculo) => {
    // Ya no generamos IDs locales, los IDs vienen de la BD
    if (vehiculoActual.id === 0) {
      return [...vehiculos];
    } else {
      return vehiculos.map(v => (v.id === vehiculoActual.id ? vehiculoActual : v));
    }
  },
  eliminar: (vehiculos: Vehiculo[], id: number) => {
    return vehiculos.filter(v => v.id !== id)
  },
}

const api = {
  listar: async () => {
    const res = await fetch('/api/unidades?estado=1', { cache: 'no-store' });
    if (!res.ok) throw new Error('No se pudo listar');
    const data = await res.json();
    return (data as any[]).map(fromDB);
  },
  crear: async (v: Vehiculo) => {
    const res = await fetch('/api/unidades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toPayload(v)),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j?.error || 'No se pudo crear');
    return fromDB(j);
  },
  actualizar: async (v: Vehiculo) => {
    const res = await fetch(`/api/unidades/${v.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toPayload(v)),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j?.error || 'No se pudo actualizar');
    return fromDB(j);
  },
  borrar: async (id: number) => {
    const res = await fetch(`/api/unidades/${id}`, { method: 'DELETE' });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j?.error || 'No se pudo eliminar');
    return j;
  },
};


const VehiculosPage = () => {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('')
  const [dialogVisible, setDialogVisible] = useState(false)
  const [vehiculoActual, setVehiculoActual] = useState<Vehiculo | null>(null)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{
    severity: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast' | undefined
    summary: string
    detail: string
  } | null>(null)
    const [mantoVisible, setMantoVisible] = useState(false);
    const [mantoUnidad, setMantoUnidad] = useState<Vehiculo | null>(null);
    const [mantoTipo, setMantoTipo] = useState<number | null>(null);
    const [mantoFecha, setMantoFecha] = useState<string>('');  // "YYYY-MM-DD"
    const [mantoTaller, setMantoTaller] = useState<string>('');
    const [mantoDesc, setMantoDesc] = useState<string>('');
      const toast = useRef<Toast>(null)


      const abrirNuevo = () => {
        setVehiculoActual({
          id: 0,
          placa: '',
          marcaUnidad: '',
          modelo: '',
          año: new Date().getFullYear(),
          capacidadAsientos: null,
          descripcion: '',
        })
        setErrores({})
        setDialogVisible(true)
      }

    const editarVehiculo = (vehiculo: Vehiculo) => {
        setVehiculoActual({ ...vehiculo })
        setErrores({})
        setDialogVisible(true)
      }
  const confirmarEliminacion = (vehiculo: Vehiculo) => {
    setVehiculoAEliminar(vehiculo)
    setConfirmVisible(true)
  }
  
  const eliminarConfirmado = async () => {
    if (!vehiculoAEliminar) return
    const updatedVehiculos = vehiculoService.eliminar(vehiculos, vehiculoAEliminar.id)
    setVehiculos(updatedVehiculos)
    setConfirmVisible(false)
    setVehiculoAEliminar(null)

    try {
      setLoading?.(true);
    
      await api.borrar(vehiculoAEliminar.id);       // elimina en la API
      toast.current?.show({ severity: 'success', summary: 'Eliminado', detail: 'Vehículo eliminado' });
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: e?.message || 'No se pudo eliminar' });
    } finally {
      setConfirmVisible(false);
      setVehiculoAEliminar(null);
      setLoading?.(false);
    }
          const data = await api.listar();
         setVehiculos(data);

  }

  const validarVehiculo = (v: Vehiculo) => {
    const nuevosErrores: Record<string, string> = {}
    const anioActual = new Date().getFullYear()
  
    // Placa
    if (!v.placa?.trim()) {
      nuevosErrores.placa = 'La placa es obligatoria.'
    } else if (!/^[A-Z0-9-]+$/i.test(v.placa.trim())) {
      nuevosErrores.placa = 'La placa solo puede contener letras, números y guiones.'
    } else if (v.placa.trim().length > 15) {
      nuevosErrores.placa = 'La placa no puede exceder 15 caracteres.'
    }
  
    // Marca
    if (!v.marcaUnidad?.trim()) {
      nuevosErrores.marcaUnidad = 'La marca es obligatoria.'
    } else if (v.marcaUnidad.trim().length > 10) {
      nuevosErrores.marcaUnidad = 'La marca no puede exceder 10 caracteres.'
    }
  
    // Modelo
    if (!v.modelo?.trim()) {
      nuevosErrores.modelo = 'El modelo es obligatorio.'
    } else if (v.modelo.trim().length > 10) {
      nuevosErrores.modelo = 'El modelo no puede exceder 10 caracteres.'
    }
  
    // Año
    if (!v.año) {
      nuevosErrores.año = 'El año es obligatorio.'
    } else if (!/^\d{4}$/.test(String(v.año))) {
      nuevosErrores.año = 'El año debe tener exactamente 4 dígitos numéricos.'
    } else if (v.año < 1950 || v.año > anioActual + 1) {
      nuevosErrores.año = `El año debe estar entre 1950 y ${anioActual + 1}.`
    }
  
    // Capacidad de asientos
    if (v.capacidadAsientos === null || v.capacidadAsientos === undefined) {
      nuevosErrores.capacidadAsientos = 'La capacidad de asientos es obligatoria.'
    } else if (!Number.isInteger(v.capacidadAsientos)) {
      nuevosErrores.capacidadAsientos = 'La capacidad de asientos debe ser un número entero.'
    } else if (!/^\d{1,3}$/.test(String(v.capacidadAsientos))) {
      nuevosErrores.capacidadAsientos = 'La capacidad de asientos debe tener máximo 3 dígitos.'
    } else if (v.capacidadAsientos < 1 || v.capacidadAsientos > 100) {
      nuevosErrores.capacidadAsientos = 'La capacidad de asientos debe estar entre 1 y 100.'
    }
  
    // Descripción
    if (v.descripcion && v.descripcion.trim().length > 250) {
      nuevosErrores.descripcion = 'La descripción no puede exceder 250 caracteres.'
    }
  
    return nuevosErrores
  }

  const guardarVehiculo = async () => {
    if (!vehiculoActual) return
  
    const nuevosErrores = validarVehiculo(vehiculoActual)
    setErrores(nuevosErrores) 
  
    if (Object.keys(nuevosErrores).length > 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Corrige los campos marcados antes de guardar.',
      })
      return
    }
  
    const vehiculoExistente = vehiculos.some(
      v => v.placa.trim().toLowerCase() === vehiculoActual.placa.trim().toLowerCase() && v.id !== vehiculoActual.id
    )
  
    if (vehiculoExistente) {
      setMessage({
        severity: 'error',
        summary: 'Error',
        detail: 'Ya existe un vehículo con esa placa.',
      })
      setErrores((prev) => ({ ...prev, placa: 'Ya existe un vehículo con esa placa.' }))
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Ya existe un vehículo con esa placa.' })
      return
    }
  
    try {
      setLoading?.(true)
  
      if (vehiculoActual.id === 0) {
        const nuevoVehiculo = await api.crear(vehiculoActual)
        setVehiculos([...vehiculos, nuevoVehiculo])
        toast.current?.show({ severity: 'success', summary: 'Creado', detail: 'Vehículo creado' })
      } else {
        const actualizado = await api.actualizar(vehiculoActual)
        setVehiculos((prev) =>
          prev.map((v) => (v.id === actualizado.id ? actualizado : v))
        )
        toast.current?.show({ severity: 'success', summary: 'Actualizado', detail: 'Vehículo actualizado' })
      }
  
      const data = await api.listar()
      setVehiculos(data)
      setDialogVisible(false)
      setErrores({})
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: e?.message || 'No se pudo guardar' })
    } finally {
      setLoading?.(false)
    }
  }

  const vehiculosFiltrados = vehiculos.filter((vehiculo) =>
    vehiculo.placa.toLowerCase().includes(searchText.toLowerCase())
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }

    const abrirMantenimiento = (v: Vehiculo) => {
    setMantoUnidad(v);
    setMantoTipo(null);
    setMantoFecha('');
    setMantoTaller('');
    setMantoDesc('');
    setMantoVisible(true);
  };

  const mandarAMantenimiento = async () => {
    if (!mantoUnidad || !mantoTipo || !mantoFecha) {
      toast.current?.show({ severity: 'warn', summary: 'Campos requeridos', detail: 'Tipo y fecha son obligatorios' });
      return;
    }
    try {
      setLoading?.(true);
      const res = await fetch(`/api/unidades/${mantoUnidad.id}/mandar-mantenimiento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoMantoFk: mantoTipo,
          fechaProgramada: mantoFecha,
          taller: mantoTaller || null,
          descripcion: mantoDesc || null,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'No se pudo mandar a mantenimiento');
  
      // recarga lista (ya no aparecerá aquí)
      const data = await api.listar();
      setVehiculos(data);
      setMantoVisible(false);
  
      toast.current?.show({ severity: 'success', summary: 'En mantenimiento', detail: 'La unidad fue enviada a mantenimiento' });
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: e?.message || 'Fallo al enviar a mantenimiento' });
    } finally {
      setLoading?.(false);
    }
  };

  const descripcionTemplate = (row: Vehiculo) => (
    <span
      title={row.descripcion || ''}  // tooltip nativo
      style={{
        display: 'inline-block',
        maxWidth: 360,         
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        verticalAlign: 'middle'
      }}
    >
      {row.descripcion || ''}
    </span>
  );

  const [detalleVisible, setDetalleVisible] = useState(false)
  const [vehiculoDetalle, setVehiculoDetalle] = useState<Vehiculo | null>(null)

  const [confirmVisible, setConfirmVisible] = useState(false)
  const [vehiculoAEliminar, setVehiculoAEliminar] = useState<Vehiculo | null>(null)

  const verDetalle = (vehiculo: Vehiculo) => {
    setVehiculoDetalle(vehiculo)
    setDetalleVisible(true)
  }

  const accionesTemplate = (rowData: Vehiculo) => (
    <div className="flex gap-2">
    <Button icon="pi pi-eye" className="btn-ver" rounded text severity="info" onClick={() => verDetalle(rowData)} />
    <Button icon="pi pi-pencil" className="btn-editar" rounded text severity="warning" onClick={() => editarVehiculo(rowData)} />
    <Button icon="pi pi-trash" className="btn-eliminar" rounded text severity="danger" onClick={() => confirmarEliminacion(rowData)} />
    <Button icon="pi pi-wrench" rounded text severity="help" tooltip="Mandar a mantenimiento" onClick={() => abrirMantenimiento(rowData)}
/>

  </div>
  )

  const leftToolbarTemplate = () => (
    <Button label="Nueva Unidad" icon="pi pi-plus" className="btn-verde" onClick={abrirNuevo} />
  )

  const rightToolbarTemplate = () => (
    <InputText
      placeholder="Buscar por placa"
      value={searchText}
      onChange={handleSearchChange}
      className="w-full md:w-14rem"
    />
  )

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const data = await api.listar();
        setVehiculos(data);   // usa tu setter existente
      } catch (e: any) {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: e?.message || 'Fallo al cargar' });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);
  
  return (
    <div className="p-6">
      <div className="flex flex-col mb-3" style={{ marginTop: '-3rem' }}></div>
      <h2 className="text-3xl font-bold text-gray-800 mb-1">Gestión de Unidades</h2>
      {message && <Toast ref={toast} />}

      <div className="card bg-white shadow-md border-round-2xl p-4">
        <div className="flex justify-between items-center mb-0 flex-wrap gap-3">
          <h3 className="text-xl font-semibold text-gray-700"> Listado general de unidades</h3>
        </div>
        <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

        <DataTable value={vehiculosFiltrados} tableStyle={{ minWidth: '50rem' }} loading={loading} stripedRows responsiveLayout="scroll">
          <Column field="placa" header="Placa" sortable />
          <Column field="marcaUnidad" header="Marca" sortable />
          <Column field="modelo" header="Modelo" sortable />
          <Column field="año" header="Año" sortable />
          <Column field="capacidadAsientos" header="Asientos" sortable style={{ width: 110 }} />
          <Column body={accionesTemplate} header="Acciones" />
          <Column field="descripcion"     
            header="Descripción"
            body={descripcionTemplate} 
            sortable
            style={{ width: 300 }}/>
        </DataTable>
      </div>
      <Dialog
        header={vehiculoActual?.id ? 'Editar Unidad' : 'Nueva Unidad'}
        visible={dialogVisible}
        style={{ width: '90vw', maxWidth: '600px' }}
        onHide={() => setDialogVisible(false)}
        className="p-fluid shadow-2 border-round-xl"
      >
            <form
            onSubmit={(e) => { e.preventDefault(); guardarVehiculo() }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
              <div className="w-full mt-2">
  <span className="p-float-label">
    <InputText
      id="placa"
      value={vehiculoActual?.placa || ''}
      onChange={(e) => {
        const valor = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 15)
        setVehiculoActual({ ...vehiculoActual!, placa: valor })
        setErrores((prev) => ({ ...prev, placa: '' }))
      }}
      className={`w-full ${errores.placa ? 'p-invalid' : ''}`}
      maxLength={15}
    />
    <label htmlFor="placa">Placa</label>
  </span>
  {errores.placa && <small className="p-error">{errores.placa}</small>}
</div>

<div className="w-full">
  <span className="p-float-label">
    <InputText
      id="marca"
      value={vehiculoActual?.marcaUnidad || ''}
      onChange={(e) => {
        const valor = e.target.value.slice(0, 10)
        setVehiculoActual({ ...vehiculoActual!, marcaUnidad: valor })
        setErrores((prev) => ({ ...prev, marcaUnidad: '' }))
      }}
      className={`w-full ${errores.marcaUnidad ? 'p-invalid' : ''}`}
      maxLength={10}
    />
    <label htmlFor="marca">Marca</label>
  </span>
  {errores.marcaUnidad && <small className="p-error">{errores.marcaUnidad}</small>}
</div>

<div className="w-full">
  <span className="p-float-label">
    <InputText
      id="modelo"
      value={vehiculoActual?.modelo || ''}
      onChange={(e) => {
        const valor = e.target.value.slice(0, 10)
        setVehiculoActual({ ...vehiculoActual!, modelo: valor })
        setErrores((prev) => ({ ...prev, modelo: '' }))
      }}
      className={`w-full ${errores.modelo ? 'p-invalid' : ''}`}
      maxLength={10}
    />
    <label htmlFor="modelo">Modelo</label>
  </span>
  {errores.modelo && <small className="p-error">{errores.modelo}</small>}
</div>

<div className="w-full">
  <span className="p-float-label">
    <InputNumber
      id="año"
      value={vehiculoActual?.año || null}
      onValueChange={(e) => {
        let valor = e.value ? Number(String(e.value).slice(0, 4)) : null
        setVehiculoActual({ ...vehiculoActual!, año: valor ?? 0 })
        setErrores((prev) => ({ ...prev, año: '' }))
      }}
      className={`w-full ${errores.año ? 'p-invalid' : ''}`}
      useGrouping={false}
      min={1950}
      max={new Date().getFullYear() + 1}
      minFractionDigits={0}
      maxFractionDigits={0}
    />
    <label htmlFor="año">Año</label>
  </span>
  {errores.año && <small className="p-error">{errores.año}</small>}
</div>

          {/* Capacidad de Asientos */}
          <div className="w-full">
  <span className="p-float-label">
    <InputNumber
      id="capacidadAsientos"
      value={vehiculoActual?.capacidadAsientos ?? null}
      onValueChange={(e) => {
        let valor = e.value !== null && e.value !== undefined
          ? Number(String(e.value).slice(0, 3))
          : null

        setVehiculoActual({
          ...vehiculoActual!,
          capacidadAsientos: valor
        })
        setErrores((prev) => ({ ...prev, capacidadAsientos: '' }))
      }}
      className={`w-full ${errores.capacidadAsientos ? 'p-invalid' : ''}`}
      useGrouping={false}
      min={1}
      max={100}
      minFractionDigits={0}
      maxFractionDigits={0}
    />
    <label htmlFor="capacidadAsientos">Capacidad de asientos</label>
  </span>
  {errores.capacidadAsientos && <small className="p-error">{errores.capacidadAsientos}</small>}
</div>

          {/* Descripción */}
          <div className="w-full md:col-span-2">
  <span className="p-float-label">
    <InputTextarea
      id="descripcion"
      value={vehiculoActual?.descripcion ?? ''}
      onChange={(e) => {
        setVehiculoActual({ ...vehiculoActual!, descripcion: e.target.value })
        setErrores((prev) => ({ ...prev, descripcion: '' }))
      }}
      className={`w-full ${errores.descripcion ? 'p-invalid' : ''}`}
      autoResize
      rows={3}
      maxLength={250}
    />
    <label htmlFor="descripcion">Descripción</label>
  </span>
  {errores.descripcion && <small className="p-error">{errores.descripcion}</small>}
</div>

          <div className="col-span-1 md:col-span-2 flex justify-center md:justify-end mt-4 gap-2">
            <Button label="Cancelar" icon="pi pi-times" className="btn-cancelar" onClick={() => {
  setDialogVisible(false)
  setErrores({})
}} />
            <Button label="Guardar" icon="pi pi-check" className="btn-guardar" type="submit" />
          </div>

        </form>
      </Dialog>

      <Dialog
            header="Detalle de la Unidad"
            visible={detalleVisible}
            style={{ width: '90vw', maxWidth: '400px' }}
            onHide={() => {
              setDialogVisible(false)
              setErrores({})
            }}            className="shadow-2 border-round-xl">

            <div className="detalle-vehiculo space-y-2">
              <p><strong>Placa:</strong> {vehiculoDetalle?.placa}</p>
              <p><strong>Marca:</strong> {vehiculoDetalle?.marcaUnidad}</p>
              <p><strong>Modelo:</strong> {vehiculoDetalle?.modelo}</p>
              <p><strong>Año:</strong> {vehiculoDetalle?.año}</p>
              <p><strong>Asientos:</strong> {vehiculoDetalle?.capacidadAsientos ?? '—'}</p> {vehiculoDetalle?.descripcion ? (
              <p><strong>Descripción:</strong> {vehiculoDetalle.descripcion}</p>) : (
              <p><strong>Descripción:</strong> —</p>)}
            </div>
          </Dialog>

            <Dialog
            header="Confirmar"
            visible={confirmVisible}
            style={{ width: '100vw', maxWidth: '700px' }}
            onHide={() => setConfirmVisible(false)}
            className="shadow-2 border-round-xl">
            <div>
            <div className="flex items-center gap-3">
            <i className="pi pi-exclamation-triangle text-xl text-yellow-500"></i>
            <p className="text-base">
              ¿Está seguro de eliminar la unidad <strong>{vehiculoAEliminar?.placa}</strong>?
            </p>
          </div>

              <div className="flex justify-center gap-4 mt-4">
              <Button
                  label="No"
                  icon="pi pi-times"
                  className="btn-cancelar"
                  onClick={() => setConfirmVisible(false)}/>
                <Button
                  label="Sí"
                  icon="pi pi-check"
                  className="btn-guardar"
                  onClick={eliminarConfirmado}
                />
              </div>
            </div>
                      <Dialog
            header="Mandar a mantenimiento"
            visible={mantoVisible}
            onHide={() => setMantoVisible(false)}
            style={{ width: '90vw', maxWidth: 520 }}
          >
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Unidad</label>
                <div>{mantoUnidad?.placa} — {mantoUnidad?.marcaUnidad} {mantoUnidad?.modelo}</div>
              </div>

              {/* Aquí de momento usamos inputs simples; luego podemos cambiarlos por Dropdown/Calendar */}
              <div className="p-float-label">
                <InputText
                  id="tipoMantoFk"
                  value={mantoTipo !== null ? String(mantoTipo) : ''}
                  onChange={(e) => setMantoTipo(Number(e.target.value) || null)}
                  className="w-full"
                  placeholder="Ej: 1 (Preventivo), 2 (Correctivo)"
                />
                <label htmlFor="tipoMantoFk">Tipo de mantenimiento (FK)</label>
              </div>

              <div className="p-float-label">
                <InputText
                  id="fechaProgramada"
                  value={mantoFecha}
                  onChange={(e) => setMantoFecha(e.target.value)}
                  className="w-full"
                  placeholder="YYYY-MM-DD"
                />
                <label htmlFor="fechaProgramada">Fecha programada</label>
              </div>

              <div className="p-float-label">
                <InputText
                  id="taller"
                  value={mantoTaller}
                  onChange={(e) => setMantoTaller(e.target.value)}
                  className="w-full"
                />
                <label htmlFor="taller">Taller</label>
              </div>

              <div className="p-float-label">
                <InputTextarea
                  id="descripcionManto"
                  value={mantoDesc}
                  onChange={(e) => setMantoDesc(e.target.value)}
                  className="w-full"
                  autoResize
                  rows={3}
                />
                <label htmlFor="descripcionManto">Descripción</label>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <Button label="Cancelar" icon="pi pi-times" onClick={() => setMantoVisible(false)} />
                <Button label="Enviar" icon="pi pi-check" onClick={mandarAMantenimiento} />
              </div>
            </div>
          </Dialog>
          </Dialog>
      <Toast ref={toast} />
    </div>
  )
}

export default VehiculosPage