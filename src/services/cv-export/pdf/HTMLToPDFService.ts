
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
    
    // Ensure the element has content
    if (!element.innerHTML.trim()) {
      throw new Error('Element is empty - no content to export');
    }

    const defaultOptions = {
      margin: Array.isArray(options.margin) ? options.margin : [15, 15, 15, 15],
      filename: options.filename || 'cv-export.pdf',
      image: { 
        type: 'jpeg', 
        quality: options.quality || 0.95 
      },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        letterRendering: true,
        logging: true, // Enable logging for debugging
        width: element.scrollWidth || 794, // A4 width in pixels at 96 DPI
        height: element.scrollHeight || 1123, // A4 height in pixels at 96 DPI
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
        mode: ['css', 'legacy'],
        before: '.section',
        after: '.page-break',
        avoid: '.page-break-inside-avoid'
      }
    };

    console.log('HTMLToPDFService - Using options:', defaultOptions);
    console.log('HTMLToPDFService - Element content length:', element.innerHTML.length);
    console.log('HTMLToPDFService - Element dimensions:', {
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight,
      offsetWidth: element.offsetWidth,
      offsetHeight: element.offsetHeight
    });

    try {
      const pdf = await html2pdf()
        .from(element)
        .set(defaultOptions)
        .outputPdf('blob');

      console.log('HTMLToPDFService - PDF generated successfully, size:', pdf.size);
      
      if (pdf.size === 0) {
        throw new Error('Generated PDF is empty (0 bytes)');
      }
      
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
    console.log('HTMLToPDFService - HTML content preview (first 1000 chars):', htmlString.substring(0, 1000));
    
    if (!htmlString.trim()) {
      throw new Error('HTML string is empty - no content to export');
    }

    // Create a temporary element with proper styling
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '210mm'; // A4 width
    tempDiv.style.minHeight = '297mm'; // A4 height
    tempDiv.style.maxWidth = '210mm';
    tempDiv.style.overflow = 'visible';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.fontSize = '12pt';
    tempDiv.style.lineHeight = '1.6';
    tempDiv.style.color = '#333';
    
    document.body.appendChild(tempDiv);
    
    try {
      // Wait for the DOM to settle and any images to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('HTMLToPDFService - Temp div dimensions after DOM settlement:', {
        scrollWidth: tempDiv.scrollWidth,
        scrollHeight: tempDiv.scrollHeight,
        offsetWidth: tempDiv.offsetWidth,
        offsetHeight: tempDiv.offsetHeight
      });
      
      console.log('HTMLToPDFService - Temp div content length:', tempDiv.innerHTML.length);
      
      if (tempDiv.scrollHeight === 0) {
        console.warn('HTMLToPDFService - Warning: temp div has 0 height');
      }
      
      const blob = await this.exportElementToPDF(tempDiv, options);
      console.log('HTMLToPDFService - PDF blob generated, size:', blob.size);
      
      return blob;
    } finally {
      document.body.removeChild(tempDiv);
    }
  }
}
