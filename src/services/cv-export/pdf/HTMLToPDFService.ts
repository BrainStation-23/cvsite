
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
    logging?: boolean;
    allowTaint?: boolean;
    width?: number;
    height?: number;
  };
  jsPDF?: {
    unit?: 'pt' | 'mm' | 'cm' | 'in';
    format?: string;
    orientation?: 'portrait' | 'landscape';
    compress?: boolean;
  };
}

export class HTMLToPDFService {
  static async exportElementToPDF(
    element: HTMLElement,
    options: PDFExportOptions = {}
  ): Promise<Blob> {
    console.log('HTMLToPDFService - Starting PDF export with element:', element);
    
    const defaultOptions = {
      margin: Array.isArray(options.margin) ? options.margin : [10, 10, 10, 10],
      filename: options.filename || 'cv-export.pdf',
      image: { 
        type: 'jpeg', 
        quality: options.quality || 0.98 
      },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        letterRendering: true,
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        ...options.html2canvas
      },
      jsPDF: { 
        unit: 'mm', 
        format: options.format || 'a4', 
        orientation: options.orientation || 'portrait',
        compress: true,
        ...options.jsPDF
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.cv-page',
        after: '.page-break'
      }
    };

    console.log('HTMLToPDFService - Using options:', defaultOptions);

    try {
      // Ensure the element is visible and has content
      if (!element.innerHTML.trim()) {
        throw new Error('Element is empty - no content to export');
      }

      console.log('HTMLToPDFService - Element content length:', element.innerHTML.length);

      const pdf = await html2pdf()
        .from(element)
        .set(defaultOptions)
        .outputPdf('blob');

      console.log('HTMLToPDFService - PDF generated successfully');
      return pdf;
    } catch (error) {
      console.error('HTMLToPDFService - PDF generation failed:', error);
      throw new Error(`Failed to generate PDF from HTML: ${error.message}`);
    }
  }

  static async exportHTMLStringToPDF(
    htmlString: string,
    options: PDFExportOptions = {}
  ): Promise<Blob> {
    console.log('HTMLToPDFService - Starting PDF export with HTML string length:', htmlString.length);
    
    if (!htmlString.trim()) {
      throw new Error('HTML string is empty - no content to export');
    }

    // Create a temporary element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = options.orientation === 'landscape' ? '297mm' : '210mm';
    tempDiv.style.height = options.orientation === 'landscape' ? '210mm' : '297mm';
    tempDiv.style.overflow = 'visible';
    
    document.body.appendChild(tempDiv);
    
    try {
      // Wait a bit for the DOM to settle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('HTMLToPDFService - Temp div content:', tempDiv.innerHTML.substring(0, 200) + '...');
      
      const blob = await this.exportElementToPDF(tempDiv, options);
      console.log('HTMLToPDFService - PDF blob size:', blob.size);
      
      return blob;
    } finally {
      document.body.removeChild(tempDiv);
    }
  }
}
