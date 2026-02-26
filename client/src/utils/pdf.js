import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function generatePDF(data, element) {
  const { site } = data;
  const filename = `Site_Inspect_${site.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

  // Use html2canvas to capture the report element
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 900,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.85);
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // A4 dimensions in mm
  const pdfWidth = 210;
  const pdfHeight = 297;

  const ratio = pdfWidth / imgWidth;
  const scaledHeight = imgHeight * ratio;

  // Calculate number of pages needed
  const pageCount = Math.ceil(scaledHeight / pdfHeight);

  const pdf = new jsPDF('p', 'mm', 'a4');

  for (let i = 0; i < pageCount; i++) {
    if (i > 0) pdf.addPage();

    pdf.addImage(
      imgData,
      'JPEG',
      0,
      -(i * pdfHeight),
      pdfWidth,
      scaledHeight,
      undefined,
      'FAST'
    );
  }

  pdf.save(filename);
}
