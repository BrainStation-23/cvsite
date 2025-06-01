
import html2pdf from 'html2pdf.js';

export interface PDFExportOptions {
  filename?: string;
  margin?: number | [number, number, number, number];
  format?: 'a4' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
  quality?: number;
  enableLinks?: boolean;
  html2canvas?: {
    scale?: number;
    useCORS?: boolean;
    letterRendering?: boolean;
  };
  jsPDF?: {
    unit?: 'pt' | 'mm' | 'cm' | 'in';
    format?: string;
    orientation?: 'portrait' | 'landscape';
  };
}

export class HTMLToPDFService {
  static async exportElementToPDF(
    element: HTMLElement,
    options: PDFExportOptions = {}
  ): Promise<Blob> {
    const defaultOptions = {
      margin: 10,
      filename: 'cv-export.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        ...options.html2canvas
      },
      jsPDF: { 
        unit: 'mm', 
        format: options.format || 'a4', 
        orientation: options.orientation || 'portrait',
        ...options.jsPDF
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      const pdf = await html2pdf()
        .from(element)
        .set(defaultOptions)
        .outputPdf('blob');

      return pdf;
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new Error('Failed to generate PDF from HTML');
    }
  }

  static async exportHTMLStringToPDF(
    htmlString: string,
    options: PDFExportOptions = {}
  ): Promise<Blob> {
    // Create a temporary element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    
    document.body.appendChild(tempDiv);
    
    try {
      const blob = await this.exportElementToPDF(tempDiv, options);
      return blob;
    } finally {
      document.body.removeChild(tempDiv);
    }
  }
}
