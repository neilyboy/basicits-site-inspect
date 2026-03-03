/**
 * generatePDF — opens a browser print dialog pre-filled with the report HTML.
 * All images are converted to base64 data URLs so they load correctly in the
 * print window (relative /uploads/ paths don't resolve there).
 * Users choose "Save as PDF" in the browser print dialog.
 */
export async function generatePDF(data, element) {
  const { site } = data;
  const filename = `Site_Inspect_${site.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

  // ── 1. Collect stylesheet text ─────────────────────────────────────────────
  const styleSheets = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((r) => r.cssText).join('\n');
      } catch {
        return '';
      }
    })
    .join('\n');

  // ── 2. Clone the element so we can mutate it without touching the live DOM ──
  const clone = element.cloneNode(true);

  // ── 3. Convert every img src to an absolute URL, then fetch as base64 ───────
  const imgs = Array.from(clone.querySelectorAll('img'));

  await Promise.all(
    imgs.map(async (img) => {
      try {
        // Make relative paths absolute (e.g. /uploads/foo.jpg → http://host/uploads/foo.jpg)
        const absoluteSrc = new URL(img.getAttribute('src') || '', window.location.origin).href;

        const response = await fetch(absoluteSrc);
        const blob = await response.blob();
        const dataUrl = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result);
          reader.onerror = rej;
          reader.readAsDataURL(blob);
        });

        img.src = dataUrl;
        // Remove lazy loading so the print window renders immediately
        img.removeAttribute('loading');
      } catch {
        // If a single image fails, continue — don't abort the whole export
      }
    }),
  );

  // ── 4. Open print window ───────────────────────────────────────────────────
  const printWindow = window.open('', '_blank', 'width=960,height=700');
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

    /* ── Print layout overrides ── */
    @media print {
      .no-print { display: none !important; }

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

      .min-h-screen { min-height: unset !important; }

      /* Never split device blocks, photo grids, cards, or tables */
      .point-block,
      .photo-grid,
      .photo-card,
      .summary-block,
      .flags-block {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      /* Category header keeps its first item on the same page */
      .category-header {
        page-break-after: avoid;
        break-after: avoid;
      }

      img {
        max-width: 100% !important;
        page-break-inside: avoid;
        break-inside: avoid;
        display: block;
      }

      table { page-break-inside: avoid; break-inside: avoid; }
      tr    { page-break-inside: avoid; break-inside: avoid; }
    }

    /* Screen view in the print window — also hide nav bar */
    .no-print { display: none !important; }
  </style>
</head>
<body>
  ${clone.outerHTML}
</body>
</html>`);

  printWindow.document.close();

  // ── 5. Trigger print once the window has fully rendered ───────────────────
  // Use a longer delay to ensure base64 images are decoded and laid out
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 1200);
  };
}
