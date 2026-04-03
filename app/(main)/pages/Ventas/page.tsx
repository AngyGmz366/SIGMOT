  'use client';

  import React, { useState, useEffect, useRef, use } from 'react';
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

  import FacturacionModal from '../../components/FacturacionModal';
  import { imprimirPDF } from '@/lib/imprimirPDF';



import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';



  import axios from "axios"; 

  import { VentaItem, Boleto, Encomienda,FacturaForm } from '@/types/ventas';
  import { jsPDF } from 'jspdf';

  import {
    listarBoletos,
    crearBoleto,
    actualizarBoleto,
    eliminarBoleto,
    obtenerDetallesFactura
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




    

    ///crear estado para modal factura 
  // Estado para controlar la visibilidad del modal de factura
  const [facturaModalVisible, setFacturaModalVisible] = useState(false);

  // Estado para guardar la factura seleccionada (para mostrar en el modal)
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<VentaItem | null>(null);

  // Estado para guardar los detalles de la factura (productos, precios, etc.)
  const [detalleFactura, setDetalleFactura] = useState<any[]>([]);

  const refImpresion = useRef<HTMLDivElement>(null);


  ///funcion para abrir modal factura 
  const abrirFactura = async (item: VentaItem) => {
    try {
      if (!item.id) return;

      // Traer la factura relacionada (puede ser un GET a tu API)
      const { data } = await axios.get(`/api/facturas/por-boleto/${item.id}`);
      
      setDetalleFactura(data.detalles || []); // Detalles de TBL_DETALLES_FACTURAS
      setFacturaSeleccionada(item);
      setFacturaModalVisible(true);
    } catch (err) {
      console.error("❌ Error cargando factura:", err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los detalles de la factura',
        life: 3000,
      });
    }
  };



  const pagarItem = async (item: VentaItem) => {
    if (!isBoleto(item) || !item.id) return;

    try {
      // Aquí llamas tu servicio para marcar como pagado
      await axios.post(`/api/boletos/${item.id}/pagar`);

      // Actualiza la lista local de boletos
      const updated = await listarBoletos();
      setVentaItems(updated);  // Actualiza el estado global de boletos

      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Boleto pagado correctamente',
        life: 3000,
      });
    } catch (err) {
      console.error('❌ Error al pagar boleto:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo pagar el boleto',
        life: 3000,
      });
    }

  };
   



  // En VentasPage


const [itemParaImprimir, setItemParaImprimir] = useState<VentaItem | null>(null);
const [facturaParaImprimir, setFacturaParaImprimir] = useState<FacturaForm | undefined>(undefined);

const imprimirItem = async (row: VentaItem) => {
  if (row.tipoVenta !== 'boleto' || !row.id) return;

  try {
    const { data } = await axios.get(`/api/boletos/${row.id}`); // usa sp_ticket_obtener
    const f = data?.item;

    const boletoFull = {
      id: f.Id_Ticket_PK,
      tipoVenta: 'boleto',
      Codigo_Ticket: f.Codigo_Ticket || '',
      cliente: f.Cliente || '',
      cedula: f.Cedula || '',
      telefono: f.Telefono || '',
      origen: f.Origen || '',
      destino: f.Destino || '',
      fecha: (f.Fecha_Hora_Compra || '').slice(0, 10),
      horaSalida: (f.Hora_Salida || '').slice(0, 5),
      horaLlegada: (f.Hora_Estimada_Llegada || '').slice(0, 5),
      precio: Number(f.Precio_Total ?? 0),
      descuento: Number(f.DescuentoAplicado ?? 0),
      total: Number(f.Total ?? f.Precio_Total ?? 0),
      estado: f.Estado || 'pendiente',
      metodoPago: f.MetodoPago || 'efectivo',

      // 🔑 claves para el voucher
      autobus: f.Autobus || f.Numero_Placa || '',
      asiento: f.Numero_Asiento ? String(f.Numero_Asiento) : '',

      // FKs (por si los necesitas)
      Id_Cliente_FK: f.Id_Cliente_FK ?? null,
      Id_Viaje_FK: f.Id_Viaje_FK ?? null,
      Id_Unidad_FK: f.Id_Unidad_FK ?? null,
      Id_Asiento_FK: f.Id_Asiento_FK ?? null,
      Id_PuntoVenta_FK: f.Id_PuntoVenta_FK ?? 1,
      Id_MetodoPago_FK: f.Id_MetodoPago_FK ?? null,
      Id_EstadoTicket_FK: f.Id_EstadoTicket_FK ?? null,
    } as Boleto;

    setItemParaImprimir(boletoFull);
    setPrintingMode('boleto');
    setPrinting(true);
  } catch (e) {
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo cargar el boleto para imprimir',
      life: 3000,
    });
  }
};

    

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

const eliminarSeleccionados = () => {
    if (!selectedItems?.length) return;

    // 📢 Lanzar el diálogo de confirmación
    confirmDialog({
      message: selectedItems.length === 1 
        ? '¿Desea eliminar el registro seleccionado?' 
        : `¿Desea eliminar los ${selectedItems.length} registros seleccionados?`,
      header: 'Confirmación de Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'No',
      acceptClassName: 'p-button-danger',
      // ✅ Si el usuario presiona "Sí", se ejecuta esta lógica:
      accept: async () => {
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
            detail: 'Registros eliminados correctamente',
            life: 3000,
          });
        } catch (err: any) {
          console.error('❌ Error al eliminar:', err);
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron eliminar los registros',
            life: 4000,
          });
        }
      },
      reject: () => {
        // Opcional: acción si el usuario cancela
      }
    });
  };


    
    const filteredItems = ventaItems.filter((item) =>
      currentMode === 'boleto' ? isBoleto(item) : isEncomienda(item)
    );

    // 💧 Limpia el formulario del boleto
  const limpiarBoleto = () => {
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
  };


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




  //factura cambia estado 

  const onSaveFactura = (factura: any) => {
    // Asumir que la factura se guarda y se recibe la respuesta con los detalles de la factura
    // Luego actualizamos el boleto a "Pagado"
    const updatedBoleto = { ...facturaSeleccionada, estado: 'Pagado' };  // Modificar estado aquí
    
    // Actualizar la lista de boletos localmente
    setVentaItems(prevBoletos =>
      prevBoletos.map(boleto =>
        boleto.id === updatedBoleto.id ? { ...boleto, estado: updatedBoleto.estado } : boleto
      )
    );
    
    setFacturaModalVisible(false);  // Cerrar el modal de factura
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

    console.log("🎯 Resultado del SP (full):");

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
        
            <ConfirmDialog /> 

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
              
              {/* ✅ Columna de selección múltiple */}
    <Column
      selectionMode="multiple"
      headerStyle={{ width: '3rem' }}
      style={{ textAlign: 'center' }}
    />


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
        {/* ✏️ Editar */}
        <Button
          icon="pi pi-pencil"
          rounded
          text
          severity="warning"
          tooltip="Editar"
          tooltipOptions={{ position: 'top' }}
          onClick={() => editItem(rowData)}
        />

        {/* 🖨️ Imprimir boleto */}
        <Button
          icon="pi pi-print"
          rounded
          text
          severity="info"
          tooltip="Imprimir"
          tooltipOptions={{ position: 'top' }}
          onClick={() => imprimirItem(rowData)}
        />

        {/* 🧾 Crear / Ver Factura */}
      <Button
    icon="pi pi-file"
    rounded
    text
    severity="help"
    tooltip="Facturar"
    tooltipOptions={{ position: 'top' }}
    onClick={() => {
      // ✅ Buscar el ID en todos los campos posibles
      const boletoId = rowData?.Id_Ticket_PK ?? rowData?.id ?? rowData?.id_boleto;
      
      if (!boletoId) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'El boleto no tiene ID válido',
          life: 3000,
        });
        return;
      }

      console.log('🧾 Abriendo factura para boleto:', rowData);
      setFacturaSeleccionada(rowData);
      setFacturaModalVisible(true);
    }}
  />

      </div>
    )}
  />

            </DataTable>

      <BoletoDialog
    key={boletoDialogVisible ? (boleto.id ?? 'nuevo') : 'cerrado'} // 🧠 Fuerza remount
    visible={boletoDialogVisible}
    onHide={() => {
      limpiarBoleto();
      setBoletoDialogVisible(false);
    }}
    boleto={boleto}
    setBoleto={setBoleto}
    onSave={saveBoleto}
    submitted={submitted}
  />
  <FacturacionModal
    visible={facturaModalVisible}
    onHide={() => setFacturaModalVisible(false)}
    boleto={facturaSeleccionada as Boleto}
    onSave={onSaveFactura}  // Pasa la función onSaveFactura
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
        label="Descargar PDF" // <-- Cambiado de "Imprimir" a "Descargar PDF"
        icon="pi pi-file-pdf" // <-- Icono cambiado de "pi-print" a "pi-file-pdf" para mayor claridad
        onClick={() => {
          if (refImpresion.current && itemParaImprimir) {
            const nombreArchivo =
              printingMode === 'boleto'
                ? `boleto_${(itemParaImprimir as Boleto).Codigo_Ticket}`
                : `encomienda_${itemParaImprimir.id}`;
            imprimirPDF(refImpresion.current, nombreArchivo);
          }
        }}
        className="p-button-text"
      />
    </div>
  }
  key={itemParaImprimir ? itemParaImprimir.id : 'modal-closed'} 
>
  {itemParaImprimir && (
    <div ref={refImpresion}>
      {printingMode === 'boleto' ? (
     <ImprimirBoleto
  data={itemParaImprimir as Boleto}
  factura={facturaParaImprimir}
  visible={printing}
  onHide={() => setPrinting(false)}
/>

      ) : (
        <ImprimirEncomienda
          item={itemParaImprimir as Encomienda}
          visible={printing}
          onHide={() => setPrinting(false)}
        />
      )}
    </div>
  )}
</Dialog>



          </div>
        </div>
      </div>
    );
  }
