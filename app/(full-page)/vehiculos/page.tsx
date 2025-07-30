'use client'

import React from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'

const VehiculosPage = () => {
  const vehiculos = [
    { id: 1, placa: 'HND1234', marca: 'Toyota', modelo: 'Hilux', año: 2020 },
    { id: 2, placa: 'HND5678', marca: 'Isuzu', modelo: 'D-Max', año: 2022 },
    { id: 3, placa: 'HND9012', marca: 'Nissan', modelo: 'Frontier', año: 2021 },
  ]

  const accionesTemplate = (rowData: any) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" rounded text severity="warning" aria-label="Editar" />
      <Button icon="pi pi-trash" rounded text severity="danger" aria-label="Eliminar" />
    </div>
  )

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gestión de Vehículos</h2>
      <DataTable value={vehiculos} tableStyle={{ minWidth: '50rem' }} stripedRows responsiveLayout="scroll">
        <Column field="placa" header="Placa" sortable />
        <Column field="marca" header="Marca" sortable />
        <Column field="modelo" header="Modelo" sortable />
        <Column field="año" header="Año" sortable />
        <Column body={accionesTemplate} header="Acciones" />
      </DataTable>
    </div>
  )
}

export default VehiculosPage
