/**
 * PDF Export Utility for CV rendering
 * Uses html2pdf.js dynamically for high-resolution A4 document downloads
 */

export interface PdfExportOptions {
  filename?: string;
  elementId?: string;
  element?: HTMLElement | null;
}

/**
 * Resolves a modern CSS color value (oklab, oklch, lab) to standard rgb(r, g, b)
 * by setting it on a hidden DOM element and reading back the computed value.
 */
const resolveModernColorViaDom = (colorStr: string): string => {
  try {
    const dummy = document.createElement("div");
    dummy.style.position = "absolute";
    dummy.style.left = "-9999px";
    dummy.style.top = "-9999px";
    dummy.style.color = colorStr;
    document.body.appendChild(dummy);
    const computed = window.getComputedStyle(dummy).color;
    document.body.removeChild(dummy);
    if (computed && computed.startsWith("rgb")) {
      return computed;
    }
  } catch {}
  return colorStr;
};

/**
 * Regex matching oklab(...), oklch(...), and lab(...) color functions.
 * Supports one level of nested parens for patterns like:
 *   oklab(0.637 -0.118 -0.134 / var(--tw-text-opacity, 1))
 */
const MODERN_COLOR_RE = /(?:oklab|oklch|lab)\((?:[^()]*|\([^()]*\))*\)/gi;

/** Returns true if a CSS value string contains a modern color function */
const hasModernColor = (val: string): boolean =>
  val.includes("oklab") || val.includes("oklch") || val.includes("lab(");

/**
 * Every CSS property that html2canvas parses as a color type.
 * Must be exhaustive to prevent any oklab value from reaching the parser.
 */
const COLOR_PROPS = [
  "color",
  "backgroundColor",
  "borderColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "outlineColor",
  "textDecorationColor",
  "columnRuleColor",
  "caretColor",
  "accentColor",
  "fill",
  "stroke",
  "floodColor",
  "lightingColor",
  "stopColor",
  "webkitTextFillColor",
  "webkitTextStrokeColor",
];

/**
 * Rewrites all modern color functions inside <style> tag text content
 * to standard RGB using DOM computed style resolution with caching.
 */
const sanitizeStylesheets = (doc: Document) => {
  const cache = new Map<string, string>();
  doc.querySelectorAll("style").forEach((styleEl) => {
    const text = styleEl.textContent;
    if (!text || !hasModernColor(text)) return;

    styleEl.textContent = text.replace(MODERN_COLOR_RE, (match) => {
      const cached = cache.get(match);
      if (cached) return cached;
      const resolved = resolveModernColorViaDom(match);
      cache.set(match, resolved);
      return resolved;
    });
  });
};

/**
 * Sanitizes all color-type computed styles on every element within the container.
 * Uses the provided Window's getComputedStyle (important: must match the element's document).
 */
const sanitizeElementColors = (container: HTMLElement, win: Window) => {
  const allElements = [container, ...Array.from(container.querySelectorAll<HTMLElement>("*"))];

  allElements.forEach((el) => {
    try {
      const computed = win.getComputedStyle(el);
      COLOR_PROPS.forEach((prop) => {
        const val = (computed as any)[prop] as string;
        if (val && hasModernColor(val)) {
          const resolved = resolveModernColorViaDom(val);
          if (resolved.startsWith("rgb")) {
            (el.style as any)[prop] = resolved;
          }
        }
      });
    } catch {
      // Skip inaccessible nodes
    }
  });
};

export async function exportToPdf({ filename = "Resume.pdf", elementId, element }: PdfExportOptions): Promise<boolean> {
  try {
    const targetElement = element || (elementId ? document.getElementById(elementId) : null);

    if (!targetElement) {
      console.error("Target element for PDF export not found.");
      return false;
    }

    // @ts-ignore
    const html2pdfModule = await import("html2pdf.js");
    const html2pdf = html2pdfModule.default || html2pdfModule;

    // Deep clone to isolate from layout
    const clone = targetElement.cloneNode(true) as HTMLElement;
    clone.classList.remove("dark");
    clone.style.width = "794px";
    clone.style.margin = "0";
    clone.style.padding = "32px";
    clone.style.minHeight = "auto";
    clone.style.boxShadow = "none";
    clone.style.borderRadius = "0";
    clone.style.background = "#ffffff";
    clone.style.color = "#18181b";

    // Off-screen container
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

    // Pre-sanitize element styles in the main document clone
    clone.querySelectorAll(".dark").forEach((el) => el.classList.remove("dark"));
    sanitizeElementColors(clone, window);

    const marginTuple: [number, number, number, number] = [4, 4, 4, 4];

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
          // 1. Rewrite <style> tag CSS text so html2canvas stylesheet parser never sees oklab
          sanitizeStylesheets(clonedDoc);

          // 2. Sanitize every element's computed colors in the cloned document
          const clonedWin = clonedDoc.defaultView;
          const root = clonedDoc.getElementById("cv-document-container") || clonedDoc.body;
          (root as HTMLElement).style.minHeight = "auto";

          // Remove dark mode
          clonedDoc.documentElement.classList.remove("dark");
          clonedDoc.body.classList.remove("dark");
          root.classList.remove("dark");
          root.querySelectorAll(".dark").forEach((el) => el.classList.remove("dark"));

          if (clonedWin) {
            sanitizeElementColors(root as HTMLElement, clonedWin);
          }
        },
      },
      jsPDF: {
        unit: "mm" as const,
        format: "a4" as const,
        orientation: "portrait" as const,
      },
      pagebreak: {
        mode: ["css" as const, "legacy" as const],
        avoid: [".avoid-break", ".cv-section-compact", ".cv-item"],
      },
    };

    await html2pdf().set(opt).from(clone).save();

    document.body.removeChild(container);
    return true;
  } catch (error) {
    console.error("Failed to generate PDF via html2pdf:", error);
    try {
      window.print();
      return true;
    } catch {
      return false;
    }
  }
}





