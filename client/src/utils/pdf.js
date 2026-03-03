/**
 * generatePDF — opens a browser print dialog pre-filled with the report HTML
 * so the browser's layout engine handles page breaks, margins, and image splitting.
 * Users choose "Save as PDF" in the print dialog for a perfect result.
 */
export async function generatePDF(data, element) {
  const { site } = data;
  const filename = `Site_Inspect_${site.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

  // Collect all stylesheet text so the print window is styled correctly
  const styleSheets = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((r) => r.cssText).join('\n');
      } catch {
        // Cross-origin sheets can't be read — skip
        return '';
      }
    })
    .join('\n');

  // Wait for all images in the element to load before printing
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.onload = res;
              img.onerror = res;
            }),
    ),
  );

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('Pop-up blocked — please allow pop-ups for this site and try again.');
    return;
  }

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${filename}</title>
  <style>
    ${styleSheets}

    /* ── Print-specific overrides ── */
    @media print {
      /* Hide anything not needed in print */
      .no-print { display: none !important; }

      /* Page setup: A4 with comfortable margins */
      @page {
        size: A4 portrait;
        margin: 18mm 16mm 18mm 16mm;
      }

      body {
        margin: 0;
        padding: 0;
        background: white;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        color-adjust: exact;
      }

      /* Keep the top-level wrapper from adding extra spacing */
      .min-h-screen { min-height: unset !important; }

      /* Each device block: never split across pages */
      .point-block {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      /* Photo grid: never split across pages */
      .photo-grid {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      /* Individual photo card: never split */
      .photo-card {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      /* Category header: stay with first item */
      .category-header {
        page-break-after: avoid;
        break-after: avoid;
      }

      /* Summary tables and equipment quote: keep together */
      .summary-block {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      /* Flagged-devices banner: keep together */
      .flags-block {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      /* Ensure images don't overflow */
      img {
        max-width: 100% !important;
        page-break-inside: avoid;
        break-inside: avoid;
      }

      /* Don't break inside tables */
      table { page-break-inside: avoid; break-inside: avoid; }
      tr    { page-break-inside: avoid; break-inside: avoid; }
    }

    /* Always-on base so the non-@media block also applies */
    .no-print { display: none !important; }
  </style>
</head>
<body>
  ${element.outerHTML}
</body>
</html>`);

  printWindow.document.close();

  // Give images time to render before triggering print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 600);
  };
}
