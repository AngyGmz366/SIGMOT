import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Genera un PDF a partir de un elemento HTML.
 * @param ref - Referencia del contenedor (div) a capturar
 * @param nombre - Nombre del archivo PDF resultante
 */
export async function imprimirPDF(ref: HTMLDivElement, nombre = 'documento') {
  const canvas = await html2canvas(ref, { scale: 2, useCORS: true });
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgData = canvas.toDataURL('image/png');

  const imgWidth = 190;
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let position = 10;
  if (imgHeight > pageHeight - 20) {
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, pageHeight - 20);
  } else {
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
  }

  pdf.save(`${nombre}.pdf`);
}
