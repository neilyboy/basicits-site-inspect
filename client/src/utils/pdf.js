import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// A4 page dimensions in mm
const PAGE_W_MM = 210;
const PAGE_H_MM = 297;
const MARGIN_MM = 14; // top/bottom/left/right margin

const CONTENT_W_MM = PAGE_W_MM - MARGIN_MM * 2;
const CONTENT_H_MM = PAGE_H_MM - MARGIN_MM * 2;

/**
 * Render a single DOM element to a canvas image.
 */
async function renderBlock(el) {
  return html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
  });
}

/**
 * generatePDF — captures each logical block individually and places them
 * sequentially in the PDF. A new page is started before any block that
 * would not fit in the remaining space, so nothing is ever sliced mid-content.
 * The file downloads directly with no print dialog.
 */
export async function generatePDF(data, element) {
  const { site } = data;
  const filename = `Site_Inspect_${site.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

  const pdf = new jsPDF('p', 'mm', 'a4');

  // Collect the blocks we want to render in order.
  // Strategy: render the report header + intro sections as one block,
  // then each .point-block individually so photos never get cut.
  const blocks = [];

  // Everything above the point-by-point detail (header, summaries, category headers)
  // We capture the whole container minus point-blocks first, then each point-block.
  // Simplest reliable approach: capture each direct child section of the report wrapper.
  const wrapper = element;

  // Get all immediate children of the report wrapper
  const children = Array.from(wrapper.children);

  for (const child of children) {
    // Skip the sticky top bar
    if (child.classList.contains('no-print')) continue;

    // For category sections, split further: capture category header + each point-block separately
    const pointBlocks = child.querySelectorAll('.point-block');
    const categoryHeader = child.querySelector('.category-header');

    if (pointBlocks.length > 0) {
      // Render category header alone
      if (categoryHeader) {
        blocks.push(categoryHeader);
      }
      // Render each point block individually
      for (const pb of pointBlocks) {
        blocks.push(pb);
      }
    } else {
      // Render the whole section as one block (header, summaries, etc.)
      blocks.push(child);
    }
  }

  let cursorY = MARGIN_MM; // current Y position on the active page
  let firstBlock = true;

  for (const block of blocks) {
    // Skip invisible / zero-height elements
    const rect = block.getBoundingClientRect();
    if (rect.height < 2) continue;

    const canvas = await renderBlock(block);

    // Scale the canvas so it fits the content width
    const ratio = CONTENT_W_MM / canvas.width;
    const blockH = canvas.height * ratio;

    // If this block is taller than a full page, we still render it (scaled to fit)
    // to avoid infinite loops — but normally blocks are smaller than a page.
    const fitsOnOnePage = blockH <= CONTENT_H_MM;

    // Start a new page if the block won't fit in the remaining space
    if (!firstBlock && cursorY + blockH > PAGE_H_MM - MARGIN_MM) {
      pdf.addPage();
      cursorY = MARGIN_MM;
    }

    const imgData = canvas.toDataURL('image/jpeg', 0.88);

    if (fitsOnOnePage) {
      pdf.addImage(imgData, 'JPEG', MARGIN_MM, cursorY, CONTENT_W_MM, blockH);
      cursorY += blockH + 2; // 2mm gap between blocks
    } else {
      // Block is taller than one page — render across pages without splitting
      // (scale it to fit height, reducing width proportionally)
      const scaleH = CONTENT_H_MM / blockH;
      const scaledW = CONTENT_W_MM * scaleH;
      const offsetX = MARGIN_MM + (CONTENT_W_MM - scaledW) / 2;
      pdf.addImage(imgData, 'JPEG', offsetX, cursorY, scaledW, CONTENT_H_MM);
      cursorY += CONTENT_H_MM + 2;
    }

    firstBlock = false;
  }

  pdf.save(filename);
}
