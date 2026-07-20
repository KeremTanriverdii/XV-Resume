/**
 * PDF Export Utility for CV rendering
 * Uses html2pdf.js dynamically for high-resolution A4 document downloads
 */

export interface PdfExportOptions {
  filename?: string;
  elementId?: string;
  element?: HTMLElement | null;
}

const sanitizeColorsForCanvas = (containerElement: HTMLElement) => {
  if (typeof window === "undefined") return;
  try {
    const allElements = [containerElement, ...Array.from(containerElement.querySelectorAll<HTMLElement>("*"))];

    allElements.forEach((el) => {
      try {
        const computed = window.getComputedStyle(el);
        const props = [
          "color",
          "backgroundColor",
          "borderColor",
          "borderTopColor",
          "borderBottomColor",
          "borderLeftColor",
          "borderRightColor",
          "outlineColor",
          "fill",
          "stroke",
        ];

        props.forEach((prop) => {
          const val = (computed as any)[prop] as string;
          if (val && (val.includes("lab(") || val.includes("oklch(") || val.includes("oklab("))) {
            const dummy = document.createElement("div");
            dummy.style.position = "absolute";
            dummy.style.left = "-9999px";
            dummy.style.color = val;
            document.body.appendChild(dummy);
            const rgbVal = window.getComputedStyle(dummy).color;
            document.body.removeChild(dummy);

            if (rgbVal && !rgbVal.includes("lab(") && !rgbVal.includes("oklch(")) {
              (el.style as any)[prop] = rgbVal;
            } else {
              (el.style as any)[prop] = prop === "backgroundColor" ? "#ffffff" : "#18181b";
            }
          }
        });
      } catch {
        // Skip node on style read error
      }
    });
  } catch {
    // Ignore sanitization error
  }
};

export async function exportToPdf({ filename = "Resume.pdf", elementId, element }: PdfExportOptions): Promise<boolean> {
  try {
    const targetElement = element || (elementId ? document.getElementById(elementId) : null);
    
    if (!targetElement) {
      console.error("Target element for PDF export not found.");
      return false;
    }

    // Import html2pdf dynamically on client side
    // @ts-ignore
    const html2pdfModule = await import("html2pdf.js");
    const html2pdf = html2pdfModule.default || html2pdfModule;

    // Deep clone the CV element to isolate it from the surrounding layout, sidebars, & headers
    const clone = targetElement.cloneNode(true) as HTMLElement;
    clone.style.width = "794px"; // Standard A4 pixel width at 96 DPI
    clone.style.margin = "0";
    clone.style.padding = "32px";
    clone.style.boxShadow = "none";
    clone.style.borderRadius = "0";
    clone.style.background = "#ffffff";
    clone.style.color = "#000000";

    // Create container for rendering (must be at top:0, left:0 with low opacity so coordinates calculate correctly for links)
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "0px";
    container.style.top = "0px";
    container.style.width = "794px";
    container.style.opacity = "0.001";
    container.style.pointerEvents = "none";
    container.style.zIndex = "-9999";
    container.appendChild(clone);
    document.body.appendChild(container);

    // Sanitize modern CSS color functions (lab, oklch, oklab) to standard RGB for html2canvas
    sanitizeColorsForCanvas(clone);

    const marginTuple: [number, number, number, number] = [8, 8, 8, 8];

    const opt = {
      margin: marginTuple,
      filename: filename.endsWith(".pdf") ? filename : `${filename}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true, 
        allowTaint: true,
        letterRendering: true,
        logging: false,
        width: 794,
        onclone: (clonedDoc: Document) => {
          const clonedElement = clonedDoc.getElementById("cv-document-container") || clonedDoc.body;
          if (clonedElement) {
            sanitizeColorsForCanvas(clonedElement as HTMLElement);
          }
        }
      },
      jsPDF: { 
        unit: "mm" as const, 
        format: "a4" as const, 
        orientation: "portrait" as const 
      },
      pagebreak: { mode: ["avoid-all" as const, "css" as const] }
    };

    await html2pdf().set(opt).from(clone).save();

    // Clean up off-screen DOM node
    document.body.removeChild(container);
    return true;
  } catch (error) {
    console.error("Failed to generate PDF via html2pdf:", error);
    
    // Fallback: trigger browser print dialog (isolated by @media print CSS in global.css)
    try {
      window.print();
      return true;
    } catch {
      return false;
    }
  }
}
