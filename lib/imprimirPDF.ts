import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Captura un div y genera un PDF listo para impresión térmica (80mm)
 * @param ref Ref del div que contiene el boleto
 * @param nombre Nombre del archivo PDF
 */
export async function imprimirPDF(ref: HTMLDivElement, nombre = 'boleto') {
  if (!ref) return;

  // Captura el div a canvas
  const canvas = await html2canvas(ref, { scale: 3, useCORS: true });
  const imgData = canvas.toDataURL('image/png');

  // Tamaño para impresora térmica 80mm
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, (canvas.height * 80) / canvas.width] // alto automático según contenido
  });

  pdf.addImage(imgData, 'PNG', 0, 0, 80, (canvas.height * 80) / canvas.width);
  pdf.save(`${nombre}.pdf`);
}
