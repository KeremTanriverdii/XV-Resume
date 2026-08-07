import * as pdfjsLib from 'pdfjs-dist';

// Set worker source URL for browser runtime
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

/**
 * Extract clean plain text from a PDF file ArrayBuffer.
 */
export async function extractTextFromPdfBuffer(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    const textPieces: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items
        .map((item: any) => item.str)
        .filter((str: string) => str && str.trim().length > 0);
      textPieces.push(pageStrings.join(' '));
    }

    return textPieces.join('\n\n').trim();
  } catch (error) {
    console.error('Error parsing PDF file:', error);
    return '';
  }
}
