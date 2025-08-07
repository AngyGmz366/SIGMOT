'use client'

import React, { useState, useRef } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { Dialog } from 'primereact/dialog'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Toolbar } from 'primereact/toolbar'
import { Toast } from 'primereact/toast'

// Interfaz de Vehículo
interface Vehiculo {
  id: number
  placa: string
  marca: string
  modelo: string
  año: number
}

const vehiculoService = {
  guardar: (vehiculos: Vehiculo[], vehiculoActual: Vehiculo) => {
    if (vehiculoActual.id === 0) {
      const nuevo = { ...vehiculoActual, id: new Date().getTime() }
      return [...vehiculos, nuevo]
    } else {
      return vehiculos.map(v => (v.id === vehiculoActual.id ? vehiculoActual : v))
    }
  },
  eliminar: (vehiculos: Vehiculo[], id: number) => {
    return vehiculos.filter(v => v.id !== id)
  },
}

const VehiculosPage = () => {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([
    { id: 1, placa: 'HND1234', marca: 'Toyota', modelo: 'Hilux', año: 2020 },
    { id: 2, placa: 'HND5678', marca: 'Isuzu', modelo: 'D-Max', año: 2022 },
    { id: 3, placa: 'HND9012', marca: 'Nissan', modelo: 'Frontier', año: 2021 },
  ])
  const [searchText, setSearchText] = useState('')
  const [dialogVisible, setDialogVisible] = useState(false)
  const [vehiculoActual, setVehiculoActual] = useState<Vehiculo | null>(null)
  const [message, setMessage] = useState<{
    severity: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast' | undefined
    summary: string
    detail: string
  } | null>(null)
  const toast = useRef<Toast>(null)

  const abrirNuevo = () => {
    setVehiculoActual({ id: 0, placa: '', marca: '', modelo: '', año: new Date().getFullYear() })
    setDialogVisible(true)
  }

  const editarVehiculo = (vehiculo: Vehiculo) => {
    setVehiculoActual({ ...vehiculo })
    setDialogVisible(true)
  }

  const confirmarEliminacion = (vehiculo: Vehiculo) => {
    setVehiculoAEliminar(vehiculo)
    setConfirmVisible(true)
  }
  
  const eliminarConfirmado = () => {
    if (!vehiculoAEliminar) return
    const updatedVehiculos = vehiculoService.eliminar(vehiculos, vehiculoAEliminar.id)
    setVehiculos(updatedVehiculos)
    setConfirmVisible(false)
    setVehiculoAEliminar(null)
  }



  const guardarVehiculo = () => {
    if (!vehiculoActual) return

    const vehiculoExistente = vehiculos.some(v => v.placa === vehiculoActual.placa && v.id !== vehiculoActual.id)
    if (vehiculoExistente) {
      setMessage({
        severity: 'error',
        summary: 'Error',
        detail: 'Ya existe un vehículo con esa placa.',
      })
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Ya existe un vehículo con esa placa.' })
      return
    }

    const updatedVehiculos = vehiculoService.guardar(vehiculos, vehiculoActual)
    setVehiculos(updatedVehiculos)
    setDialogVisible(false)
    setMessage({
      severity: 'success',
      summary: vehiculoActual.id === 0 ? 'Nuevo Vehículo Agregado' : 'Vehículo Actualizado',
      detail: 'El vehículo se guardó correctamente',
    })
    toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'El vehículo se guardó correctamente' })
  }

  const vehiculosFiltrados = vehiculos.filter((vehiculo) =>
    vehiculo.placa.toLowerCase().includes(searchText.toLowerCase())
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }

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
  </div>
  )

  const leftToolbarTemplate = () => (
    <Button label="Nuevo Vehículo" icon="pi pi-plus" className="btn-verde" onClick={abrirNuevo} />
  )

  const rightToolbarTemplate = () => (
    <InputText
      placeholder="Buscar por placa"
      value={searchText}
      onChange={handleSearchChange}
      className="w-full md:w-14rem"
    />
  )

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gestión de Vehículos</h2>

      {message && <Toast ref={toast} />}

      <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

      <DataTable value={vehiculosFiltrados} tableStyle={{ minWidth: '50rem' }} stripedRows responsiveLayout="scroll">
        <Column field="placa" header="Placa" sortable />
        <Column field="marca" header="Marca" sortable />
        <Column field="modelo" header="Modelo" sortable />
        <Column field="año" header="Año" sortable />
        <Column body={accionesTemplate} header="Acciones" />
      </DataTable>

      <Dialog
        header={vehiculoActual?.id ? 'Editar Vehículo' : 'Nuevo Vehículo'}
        visible={dialogVisible}
        style={{ width: '90vw', maxWidth: '600px' }}
        onHide={() => setDialogVisible(false)}
        className="p-fluid shadow-2 border-round-xl"
      >
            <form
            onSubmit={(e) => { e.preventDefault(); guardarVehiculo() }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
               <div className="p-float-label w-full mt-2">
                   <InputText
                    id="placa"
                    value={vehiculoActual?.placa || ''}
                    onChange={(e) => setVehiculoActual({ ...vehiculoActual!, placa: e.target.value })}
                    className="w-full"
              />
              <label htmlFor="placa">Placa</label>
            </div>

          <div className="p-float-label w-full">
            <InputText
              id="marca"
              value={vehiculoActual?.marca || ''}
              onChange={(e) => setVehiculoActual({ ...vehiculoActual!, marca: e.target.value })}
              className="w-full"
            />
            <label htmlFor="marca">Marca</label>
          </div>

          <div className="p-float-label w-full">
            <InputText
              id="modelo"
              value={vehiculoActual?.modelo || ''}
              onChange={(e) => setVehiculoActual({ ...vehiculoActual!, modelo: e.target.value })}
              className="w-full"
            />
            <label htmlFor="modelo">Modelo</label>
          </div>

          <div className="p-float-label w-full">
            <InputNumber
              id="año"
              value={vehiculoActual?.año || 0}
              onValueChange={(e) => setVehiculoActual({ ...vehiculoActual!, año: e.value ?? 0 })}
              className="w-full"
            />
            <label htmlFor="año">Año</label>
          </div>

          <div className="col-span-1 md:col-span-2 flex justify-center md:justify-end mt-4 gap-2">
            <Button label="Cancelar" icon="pi pi-times" className="btn-cancelar" onClick={() => setDialogVisible(false)} />
            <Button label="Guardar" icon="pi pi-check" className="btn-guardar" type="submit" />
          </div>

        </form>
      </Dialog>

      <Dialog
            header="Detalle del Vehículo"
            visible={detalleVisible}
            style={{ width: '90vw', maxWidth: '400px' }}
            onHide={() => setDetalleVisible(false)}
            className="shadow-2 border-round-xl">

            <div className="detalle-vehiculo space-y-2">
              <p><strong>Placa:</strong> {vehiculoDetalle?.placa}</p>
              <p><strong>Marca:</strong> {vehiculoDetalle?.marca}</p>
              <p><strong>Modelo:</strong> {vehiculoDetalle?.modelo}</p>
              <p><strong>Año:</strong> {vehiculoDetalle?.año}</p>
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
    ¿Está seguro de eliminar el vehículo <strong>{vehiculoAEliminar?.placa}</strong>?
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
          </Dialog>


      <Toast ref={toast} />
    </div>
  )
}

export default VehiculosPage