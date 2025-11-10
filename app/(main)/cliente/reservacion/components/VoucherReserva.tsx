'use client';

import React, { useRef } from 'react';
import { Button } from 'primereact/button';
import type { VoucherData } from '@/lib/voucher';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type Props = {
  data: VoucherData;
  metodoPagoLabel?: string | null;
  onClose?: () => void;
};

const VoucherReserva: React.FC<Props> = ({ data, metodoPagoLabel, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const printNow = () => window.print();

  const downloadPDF = async () => {
    if (!cardRef.current) return;
    // Captura el voucher como imagen en alta resolución
    const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');

    // PDF A4 vertical
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    const margin = 10;
    const imgW = pageW - margin * 2;
    const imgH = (canvas.height * imgW) / canvas.width;

    // Si la altura excede la página, hacemos un fit simple
    const finalH = imgH > pageH - margin * 2 ? pageH - margin * 2 : imgH;
    pdf.addImage(imgData, 'PNG', margin, margin, imgW, finalH);
    pdf.save(`voucher-reserva-${data.IdReserva}.pdf`);
  };

  return (
    <div className="voucher-wrap">
      <div className="voucher-card" ref={cardRef}>
        <div className="voucher-head">
          <div className="empresa">
            <h2>Transportes Saenz</h2>
            <p>Tel: 2242-6150 · Email: contacto@transportessaenz.com</p>
          </div>
          <div className="voucher-title">
            <h3>Voucher de Reservación Pendiente</h3>
            <small>Folio: {data.IdReserva}</small>
          </div>
        </div>

        <div className="voucher-grid">
          <div><span className="lbl">Cliente:</span> <span className="val">{data.Cliente}</span></div>
          <div><span className="lbl">ID Reservación:</span> <span className="val">{data.IdReserva}</span></div>
          <div><span className="lbl">Tipo:</span> <span className="val">{data.Tipo}</span></div>
          <div><span className="lbl">Estado:</span> <span className="val">{data.Estado}</span></div>

          <div><span className="lbl">Ruta:</span> <span className="val">{data.Origen ?? 'N/A'} → {data.Destino ?? 'N/A'}</span></div>
          <div><span className="lbl">Unidad:</span> <span className="val">{data.Unidad ?? 'N/A'}</span></div>

          {data.Tipo === 'VIAJE' && (
            <div><span className="lbl">Asiento:</span> <span className="val">{data.NumeroAsiento ?? 'N/A'}</span></div>
          )}

          <div><span className="lbl">Fecha:</span> <span className="val">{new Date(data.Fecha).toLocaleString()}</span></div>
          <div><span className="lbl">Precio/Costo:</span> <span className="val">{data.Monto ?? 'N/A'}</span></div>
          <div><span className="lbl">Método de pago:</span> <span className="val">{metodoPagoLabel ?? 'Seleccionará en terminal'}</span></div>
        </div>

        <div className="voucher-msg">
          <strong>Importante:</strong> Este documento <u>no constituye un boleto</u>. Es una constancia formal de reservación <b>pendiente de pago</b>.
          Para validar su reservación, preséntese en la <b>terminal más cercana</b> y complete el pago en caja. La asignación final del servicio
          está sujeta a verificación de datos, disponibilidad operativa y políticas vigentes de Transportes Saenz.
        </div>
      </div>

      <div className="voucher-actions no-print">
        <Button label="Imprimir voucher" icon="pi pi-print" onClick={printNow} className="p-button-sm" />
        <Button label="Descargar PDF" icon="pi pi-download" onClick={downloadPDF} className="p-button-outlined p-button-sm" />
        {onClose && <Button label="Cerrar" className="p-button-text p-button-sm" onClick={onClose} />}
      </div>

      <style jsx>{`
        .voucher-wrap { display:flex; flex-direction:column; align-items:center; padding:1rem; }
        .voucher-card { width: 680px; max-width: 100%; background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:20px; }
        .voucher-head { display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; margin-bottom:8px; }
        .empresa h2 { margin:0; font-size:20px; }
        .empresa p { margin:0; color:#6b7280; font-size:12px; }
        .voucher-title h3 { margin:0; font-size:18px; }
        .voucher-title small { color:#6b7280; }
        .voucher-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px 18px; padding:12px 0; border-top:1px dashed #e5e7eb; border-bottom:1px dashed #e5e7eb; margin:12px 0; }
        .lbl { color:#6b7280; font-weight:600; margin-right:6px; }
        .val { color:#111827; }
        .voucher-msg { font-size:12.5px; color:#374151; background:#f9fafb; border:1px solid #eef2f7; border-radius:10px; padding:10px 12px; }
        .voucher-actions { display:flex; gap:8px; margin-top:12px; }
        @media print { .no-print{display:none!important;} body{-webkit-print-color-adjust:exact; print-color-adjust:exact;} .voucher-card{ border:none; } }
      `}</style>
    </div>
  );
};

export default VoucherReserva;
