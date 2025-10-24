'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { FilterMatchMode } from 'primereact/api';
import { Dialog } from 'primereact/dialog';

import ImprimirBoleto from '../../components/ImprimirBoleto';
import ImprimirEncomienda from '../../components/ImprimirEncomienda';
import BoletoDialog from '../../components/BoletoModal';
import EncomiendaDialog from '../../components/EncomiendaModal';



import axios from "axios"; 

import { VentaItem, Boleto, Encomienda } from '@/types/ventas';
import { jsPDF } from 'jspdf';

import {
  listarBoletos,
  crearBoleto,
  actualizarBoleto,
  eliminarBoleto,
} from '@/modulos/boletos/servicios/ventas.servicios';

// Type Guards
function isBoleto(item: VentaItem): item is Boleto {
  return item.tipoVenta === 'boleto';
}
function isEncomienda(item: VentaItem): item is Encomienda {
  return item.tipoVenta === 'encomienda';
}





export default function VentasPage() {
  const toast = useRef<Toast>(null);

  const [ventaItems, setVentaItems] = useState<VentaItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<VentaItem[] | null>(null);

  const [boletoDialogVisible, setBoletoDialogVisible] = useState(false);
  const [encomiendaDialogVisible, setEncomiendaDialogVisible] = useState(false);

  const [itemParaImprimir, setItemParaImprimir] = useState<VentaItem | null>(null);
  const [printing, setPrinting] = useState(false);
  const [printingMode, setPrintingMode] = useState<'boleto' | 'encomienda'>('boleto');

  const [currentMode, setCurrentMode] = useState<'boleto' | 'encomienda'>('boleto');
  const [submitted, setSubmitted] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');

  // Estado del Boleto en edición/creación
  const [boleto, setBoleto] = useState<Boleto>({
    id: null,
    tipoVenta: 'boleto',

    // UI
    cliente: '',
    cedula: '',
    telefono: '',
    origen: '',
    destino: '',
    asiento: '',
    autobus: '',
    horaSalida: '',
    horaLlegada: '',

    // VentaItem
    fecha: '',
    precio: 0,
    descuento: 0,
    total: 0,
    estado: 'vendido',
    metodoPago: 'efectivo',

    // FKs
    Id_Cliente_FK: null,
    Id_Viaje_FK: null,
    Id_Asiento_FK: null,
    Id_Unidad_FK: null,
    Id_PuntoVenta_FK: null,
    Id_MetodoPago_FK: null,
    Id_EstadoTicket_FK: null,
    Codigo_Ticket: '',
  });

  const [encomienda, setEncomienda] = useState<Encomienda>({
    id: null,
    remitente: '',
    destinatario: '',
    origen: '',
    destino: '',
    fecha: '',
    descripcion: '',
    peso: 0,
    precio: 0,
    tipoVenta: 'encomienda',
    telefono: '',
    cedulaRemitente: '',
    cedulaDestinatario: '',
    estado: 'enviado',
    metodoPago: 'efectivo',
    descuento: 0,
    total: 0,
  });


  
  const [filters] = useState({
    
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    cliente: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    remitente: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    destino: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    tipoVenta: { value: null, matchMode: FilterMatchMode.EQUALS },
    estado: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  // Cargar tickets al montar
  useEffect(() => {
    (async () => {
      try {
        const tickets = await listarBoletos();
        setVentaItems(tickets);
      } catch (err) {
        console.error('❌ Error cargando tickets:', err);
      }
    })();
  }, []);

  // Guardar (crear/editar) boleto
  const saveBoleto = async (b: Boleto) => {
    console.log("🧾 Payload enviado al guardar boleto:", boleto);
    console.log('🧾 Payload al guardar boleto:', b); 
    setSubmitted(true);
    try {
      const viajeId = Number(b.Id_Viaje_FK);
      const clienteId = Number(b.Id_Cliente_FK ?? b.cliente);
      const precio = Number(b.precio);
      const metodoId = Number(b.Id_MetodoPago_FK);

      if (!clienteId || !viajeId || !precio || !metodoId) {
        toast.current?.show({
          severity: 'warn',
          summary: 'Validación',
          detail: 'Cliente, viaje, método de pago y precio son obligatorios',
          life: 3000,
        });
        return;
      }
const payload: Partial<Boleto> = {
  fecha: b.fecha || new Date().toISOString().slice(0, 10),
  precio: Number(b.precio),
  descuento: Number(b.descuento || 0),
  Id_Viaje_FK: Number(b.Id_Viaje_FK),
  Id_Cliente_FK: Number(b.Id_Cliente_FK),
  Id_PuntoVenta_FK: b.Id_PuntoVenta_FK ?? 1,
  Id_MetodoPago_FK: Number(b.Id_MetodoPago_FK),
  Id_EstadoTicket_FK: Number(b.Id_EstadoTicket_FK) ?? 1,
  Id_Asiento_FK: Number(b.Id_Asiento_FK), // ✅ nuevo
};




      if (b.id) {
        await actualizarBoleto(b.id, payload);
      } else {
        await crearBoleto(payload);
      }

      const updated = await listarBoletos();
      setVentaItems(updated);

      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: b.id ? 'Boleto actualizado' : 'Boleto creado',
        life: 3000,
      });

      setBoletoDialogVisible(false);
    } catch (err) {
      console.error('❌ Error al guardar boleto:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo guardar el boleto',
        life: 3000,
      });
    }
  };

const eliminarSeleccionados = async () => {
  if (!selectedItems?.length) return;

  try {
    for (const item of selectedItems) {
      if (isBoleto(item) && item.id != null) {
        console.log(`🗑️ Eliminando boleto ID ${item.id}...`);
        await eliminarBoleto(item.id);
      }
    }

    const updated = await listarBoletos();
    setVentaItems(updated);
    setSelectedItems([]);

    toast.current?.show({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Boletos eliminados correctamente',
      life: 3000,
    });
  } catch (err: any) {
    console.error('❌ Error al eliminar boletos:', err?.response?.data || err);
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: err?.response?.data?.error || 'No se pudieron eliminar los boletos',
      life: 4000,
    });
  }
};




  
  const filteredItems = ventaItems.filter((item) =>
    currentMode === 'boleto' ? isBoleto(item) : isEncomienda(item)
  );

  const openNew = () => {
    if (currentMode === 'boleto') {
      setBoleto({
        id: null,
        tipoVenta: 'boleto',
        cliente: '',
        cedula: '',
        telefono: '',
        origen: '',
        destino: '',
        asiento: '',
        autobus: '',
        horaSalida: '',
        horaLlegada: '',
        fecha: '',
        precio: 0,
        descuento: 0,
        total: 0,
        estado: 'vendido',
        metodoPago: 'efectivo',
        Id_Cliente_FK: null,
        Id_Viaje_FK: null,
        Id_Asiento_FK: null,
        Id_Unidad_FK: null,
        Id_PuntoVenta_FK: null,
        Id_MetodoPago_FK: null,
        Id_EstadoTicket_FK: null,
        Codigo_Ticket: '',
      });
      setBoletoDialogVisible(true);
    } else {
      setEncomienda({
        id: null,
        remitente: '',
        destinatario: '',
        origen: '',
        destino: '',
        fecha: '',
        descripcion: '',
        peso: 0,
        precio: 0,
        tipoVenta: 'encomienda',
        telefono: '',
        cedulaRemitente: '',
        cedulaDestinatario: '',
        estado: 'enviado',
        metodoPago: 'efectivo',
        descuento: 0,
        total: 0,
      });
      setEncomiendaDialogVisible(true);
    }
    setSubmitted(false);
  };

  const imprimirItem = (item: VentaItem) => {
    if (item.tipoVenta !== 'boleto' && item.tipoVenta !== 'encomienda') return;
    setItemParaImprimir(item);
    setPrintingMode(item.tipoVenta);
    setPrinting(true);
  };

  const cambiarModo = (nuevoModo: 'boleto' | 'encomienda') => {
    setCurrentMode(nuevoModo);
    setSelectedItems(null);
    setGlobalFilter('');
  };

  const tipoVentaBodyTemplate = (rowData: VentaItem) => {
    const tipo = rowData.tipoVenta || 'boleto';
    return (
      <Tag
        value={tipo.toUpperCase()}
        severity={tipo === 'boleto' ? 'success' : 'info'}
        icon={tipo === 'boleto' ? 'pi pi-ticket' : 'pi pi-box'}
      />
    );
  };

const estadoBodyTemplate = (rowData: VentaItem) => {
  const estadoRaw =
    (rowData.estado || (rowData.tipoVenta === 'encomienda' ? 'enviado' : 'vendido'))
      .toLowerCase()
      .trim();

  const getSeverity = (estado: string) => {
    switch (estado) {
      case 'pagado':
      case 'vendido':
      case 'entregado':
        return 'success';   // 💚 verde
      case 'pendiente':
      case 'reservado':
      case 'en_transito':
        return 'warning';   // 🟡 amarillo
      case 'cancelado':
      case 'reembolsado':
        return 'danger';    // 🔴 rojo
      case 'enviado':
        return 'info';      // 🔵 azul
      default:
        return 'secondary'; // ⚫ gris por defecto
    }
  };

  return (
    <Tag
      value={estadoRaw.toUpperCase().replace('_', ' ')}
      severity={getSeverity(estadoRaw)}
      style={{ minWidth: '7rem', textAlign: 'center', fontWeight: 600 }}
    />
  );
};


const metodoPagoBodyTemplate = (rowData: VentaItem) => {
  const metodo = (rowData.metodoPago || '').toLowerCase().trim();

  const getIcon = (m: string) => {
    switch (m) {
      case 'efectivo':
        return 'pi pi-money-bill';     // 💵
      case 'tarjeta':
      case 'tarjeta de crédito':
      case 'tarjeta de debito':
        return 'pi pi-credit-card';    // 💳
      case 'transferencia':
      case 'banco':
      case 'deposito':
        return 'pi pi-send';           // 🔁
      default:
        return 'pi pi-question';       // ❓ fallback
    }
  };

  return (
    <div className="flex align-items-center gap-2">
      <i className={`${getIcon(metodo)} text-lg`} />
      <span className="capitalize">{metodo || 'Desconocido'}</span>
    </div>
  );
};


  const precioBodyTemplate = (rowData: VentaItem) => {
    const precio = parseFloat(String(rowData.precio)) || 0;
    const descuento = rowData.descuento || 0;
    const total = rowData.total || precio;
    return (
      <div>
        <div className="font-semibold">HNL {total.toFixed(2)}</div>
        {descuento > 0 && (
          <div className="text-sm text-gray-500">
            Precio: HNL {precio.toFixed(2)}
            <br />
            Desc: -HNL {descuento.toFixed(2)}
          </div>
        )}
      </div>
    );
  };

  const clienteBodyTemplate = (rowData: VentaItem) => {
    if (isEncomienda(rowData)) {
      return (
        <div>
          <div className="font-semibold">{rowData.remitente}</div>
          <div className="text-sm text-gray-500">Para: {rowData.destinatario}</div>
        </div>
      );
    } else {
      return (rowData as Boleto).cliente;
    }
  };



const editItem = async (item: VentaItem) => {
  if (!item?.id) {
    toast.current?.show({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'No se encontró el ID del boleto seleccionado.',
      life: 3000,
    });
    return;
  }

  try {
    console.log("🔎 Cargando boleto con ID:", item.id);
    const res = await axios.get(`/api/boletos/${item.id}`);
    const full = res.data?.item;

    if (!full) {
      toast.current?.show({
        severity: 'warn',
        summary: 'No encontrado',
        detail: `No se encontró información del boleto #${item.id}.`,
        life: 3000,
      });
      return;
    }

    setBoleto({
      id: full.Id_Ticket_PK,
      tipoVenta: "boleto",
      cliente: full.Cliente || "",
      cedula: full.Cedula || "",
      telefono: full.Telefono || "",
      origen: full.Origen || "",
      destino: full.Destino || "",
      autobus: full.Autobus || "",
      asiento: full.asientos?.[0]?.Numero_Asiento || "",
      horaSalida: full.Hora_Salida || "",
      horaLlegada: "",
      fecha: full.Fecha_Hora_Compra?.slice(0, 10) || "",
      precio: Number(full.Precio_Total ?? 0),
      descuento: 0,
      total: Number(full.Precio_Total ?? 0),
      estado: full.Estado || "vendido",
      metodoPago: full.MetodoPago || "efectivo",
      Id_Cliente_FK: full.Id_Cliente_FK ?? null,
      Id_Viaje_FK: full.Id_Viaje_FK ?? null,
      Id_Unidad_FK: full.asientos?.[0]?.Id_Unidad_FK ?? null,
      Id_Asiento_FK: full.asientos?.[0]?.Id_Asiento_FK ?? null,
      Id_PuntoVenta_FK: full.Id_PuntoVenta_FK ?? 1,
      Id_MetodoPago_FK: full.Id_MetodoPago_FK ?? null,
      Id_EstadoTicket_FK: full.Id_EstadoTicket_FK ?? null,
      Codigo_Ticket: full.Codigo_Ticket || "",
    });

    setBoletoDialogVisible(true);
  } catch (err) {
    console.error("❌ Error al obtener boleto:", err);
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo obtener el boleto.',
      life: 3000,
    });
  }
};



  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <div className="flex align-items-center gap-3">
        <h4 className="m-0">Gestión de {currentMode === 'boleto' ? 'Boletos' : 'Encomiendas'}</h4>
        <Button
          icon={currentMode === 'boleto' ? 'pi pi-box' : 'pi pi-ticket'}
          label={`Cambiar a ${currentMode === 'boleto' ? 'Encomiendas' : 'Boletos'}`}
          className="p-button-outlined p-button-sm"
          onClick={() => cambiarModo(currentMode === 'boleto' ? 'encomienda' : 'boleto')}
        />
      </div>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <input
          type="search"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar..."
          className="p-inputtext p-component"
        />
      </span>
    </div>
  );

  const leftToolbar = (
    <div className="flex flex-wrap gap-2">
      <Button
        label={`Nuevo ${currentMode === 'boleto' ? 'Boleto' : 'Encomienda'}`}
        icon="pi pi-plus"
        severity="success"
        onClick={openNew}
      />
    </div>
  );

  const rightToolbar = (
    <div className="flex flex-wrap gap-2">
      <Button
        label="Eliminar Seleccionados"
        icon="pi pi-trash"
        severity="danger"
        onClick={eliminarSeleccionados}
        disabled={!selectedItems?.length}
      />
    </div>
  );

  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <Toast ref={toast} />

          <Toolbar className="mb-4" left={leftToolbar} right={rightToolbar} />

          <DataTable
            value={filteredItems}
            selection={selectedItems}
            onSelectionChange={(e: any) => setSelectedItems(e.value)}
            dataKey="id"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            className="datatable-responsive"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate={`Mostrando {first} a {last} de {totalRecords} ${
              currentMode === 'boleto' ? 'boletos' : 'encomiendas'
            }`}
            globalFilter={globalFilter}
            header={header}
            filters={filters}
            filterDisplay="menu"
            responsiveLayout="scroll"
            emptyMessage={`No se encontraron ${
              currentMode === 'boleto' ? 'boletos' : 'encomiendas'
            }.`}
          >
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} exportable={false} />

            <Column
              field="tipoVenta"
              header="Tipo"
              body={tipoVentaBodyTemplate}
              sortable
              filter
              filterPlaceholder="Filtrar por tipo"
              style={{ minWidth: '8rem' }}
            />

            <Column
              field={currentMode === 'boleto' ? 'cliente' : 'remitente'}
              header={currentMode === 'boleto' ? 'Cliente' : 'Remitente/Destinatario'}
              body={clienteBodyTemplate}
              sortable
              filter
              filterPlaceholder={`Buscar por ${currentMode === 'boleto' ? 'cliente' : 'remitente'}`}
              style={{ minWidth: '12rem' }}
            />

            {currentMode === 'boleto' && (
              <>
                <Column field="cedula" header="Cédula" sortable style={{ minWidth: '10rem' }} />
                <Column field="telefono" header="Teléfono" style={{ minWidth: '10rem' }} />
              </>
            )}

      
{/* Origen */}
<Column
  field="origen"
  header="Origen"
  body={(rowData) => (
    <span className="text-sm">{rowData.origen || '—'}</span>
  )}
  sortable
  filter
  filterPlaceholder="Buscar por origen"
  style={{ minWidth: '10rem' }}
/>

{/* Destino */}
<Column
  field="destino"
  header="Destino"
  body={(rowData) => (
    <span className="text-sm">{rowData.destino || '—'}</span>
  )}
  sortable
  filter
  filterPlaceholder="Buscar por destino"
  style={{ minWidth: '10rem' }}
/>


            <Column field="fecha" header="Fecha" sortable style={{ minWidth: '8rem' }} />

  

            <Column
              field="estado"
              header="Estado"
              body={estadoBodyTemplate}
              sortable
              filter
              filterPlaceholder="Filtrar por estado"
              style={{ minWidth: '8rem' }}
            />

            <Column
              field="metodoPago"
              header="Método Pago"
              body={metodoPagoBodyTemplate}
              sortable
              style={{ minWidth: '10rem' }}
            />

            <Column field="total" header="Total" body={precioBodyTemplate} sortable style={{ minWidth: '8rem' }} />

            <Column
              header="Acciones"
              body={(rowData) => (
                <div className="flex gap-2">
                  <Button
                    icon="pi pi-pencil"
                    rounded
                    text
                    severity="warning"
                    onClick={() => editItem(rowData)}
                    tooltip="Editar"
                    tooltipOptions={{ position: 'top' }}
                  />
                  <Button
                    icon="pi pi-print"
                    rounded
                    text
                    severity="info"
                    onClick={() => imprimirItem(rowData)}
                    tooltip="Imprimir"
                    tooltipOptions={{ position: 'top' }}
                  />
                </div>
              )}
            />
          </DataTable>

          <BoletoDialog
            visible={boletoDialogVisible}
            onHide={() => setBoletoDialogVisible(false)}
            boleto={boleto}
            setBoleto={setBoleto}
            onSave={saveBoleto}
            submitted={submitted}
          />

          {/* Descomenta cuando tengas encomiendas conectadas */}
          {/* <EncomiendaDialog
            visible={encomiendaDialogVisible}
            onHide={() => setEncomiendaDialogVisible(false)}
            encomienda={encomienda}
            setEncomienda={setEncomienda}
            onSave={() => {}}
            submitted={submitted}
          /> */}

          <Dialog
            visible={printing}
            onHide={() => setPrinting(false)}
            style={{ width: '450px' }}
            header={`Imprimir ${printingMode === 'boleto' ? 'Boleto' : 'Encomienda'}`}
            dismissableMask
            footer={
              <div>
                <Button
                  label="Cerrar"
                  icon="pi pi-times"
                  onClick={() => setPrinting(false)}
                  className="p-button-text"
                />
                <Button
                  label="Imprimir"
                  icon="pi pi-print"
                  onClick={() => {
                    if (itemParaImprimir) {
                      if (printingMode === 'boleto') {
                        // Usa tu ImprimirBoleto (o genera PDF aquí)
                        window.print();
                      } else {
                        window.print();
                      }
                    }
                  }}
                  className="p-button-text"
                />
              </div>
            }
          >
            {itemParaImprimir &&
              (printingMode === 'boleto' ? (
                <ImprimirBoleto item={itemParaImprimir as Boleto} />
              ) : (
                <ImprimirEncomienda item={itemParaImprimir as Encomienda} />
              ))}
          </Dialog>
        </div>
      </div>
    </div>
  );
}