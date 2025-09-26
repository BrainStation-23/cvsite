
import html2pdf from 'html2pdf.js';
import { templateValidator } from '@/utils/template-validator';

interface PDFEngineOptions {
  filename?: string;
  includeStandardCSS?: boolean;
  validateTemplate?: boolean;
  pageSize?: 'a4' | 'letter';
  margin?: number;
  puppeteerOptions?: {
    format?: string;
    printBackground?: boolean;
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
  };
}

interface PuppeteerServiceConfig {
  url: string;
  timeout: number;
  retryCount: number;
  fallbackEnabled: boolean;
}

export class PDFEngine {
  private serviceConfig: PuppeteerServiceConfig;

  constructor() {
    this.serviceConfig = {
      url: import.meta.env.VITE_PUPPETEER_SERVICE_URL || 'https://puppeteer.brainstation-23.xyz',
      timeout: parseInt(import.meta.env.VITE_PUPPETEER_TIMEOUT || '30000'),
      retryCount: parseInt(import.meta.env.VITE_PUPPETEER_RETRY_COUNT || '1'),
      fallbackEnabled: import.meta.env.VITE_PDF_FALLBACK_ENABLED !== 'false'
    };
  }



  private async generatePDFWithPuppeteer(
    htmlContent: string, 
  ): Promise<Blob> {

    
    console.log('Attempting PDF generation with Puppeteer service...');
    



    const response = await fetch(this.serviceConfig.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/html',
        'Accept': 'application/pdf'
      },
      body: htmlContent,
      signal: AbortSignal.timeout(this.serviceConfig.timeout)
    });

    if (!response.ok) {
      throw new Error(`Puppeteer service error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/pdf')) {
      throw new Error(`Unexpected response type: ${contentType}. Expected application/pdf`);
    }

    return await response.blob();
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private getPageSize(pageSize: 'a4' | 'letter') {
    switch (pageSize) {
      case 'letter':
        return [8.5, 11]; // inches
      case 'a4':
      default:
        return [210, 297]; // mm
    }
  }

  private async generatePDFWithHtml2PDF(
    htmlContent: string, 
    options: PDFEngineOptions = {}
  ): Promise<void> {
    const {
      filename = 'cv-export',
      pageSize = 'a4',
    } = options;

    console.log('Generating PDF with html2pdf fallback...');

    // Configure PDF options
    const [width, height] = this.getPageSize(pageSize);
    
    const opt = {
      filename: `${filename}.pdf`,
      image: { 
        type: 'webp' as const, 
        quality: 0.98 
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        allowTaint: false,
        logging: false,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { 
        orientation: 'portrait' as const,
        unit: pageSize === 'a4' ? 'mm' : 'in',
        format: [width, height] as [number, number],
        putOnlyUsedFonts: true,
        floatPrecision: 16
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.cv-page-break-before',
        after: '.cv-page-break-after',
        avoid: '.cv-page-break-avoid'
      }
    };

    // Generate PDF
    await html2pdf()
      .from(htmlContent)
      .set(opt)
      .save();
  }

  private async attemptPuppeteerWithRetry(
    htmlContent: string, 
    options: PDFEngineOptions,
    retryCount: number = 0
  ): Promise<Blob> {
    try {
      return await this.generatePDFWithPuppeteer(htmlContent);
    } catch (error) {
      console.warn(`Puppeteer attempt ${retryCount + 1} failed:`, error);
      
      if (retryCount < this.serviceConfig.retryCount) {
        console.log(`Retrying Puppeteer service (attempt ${retryCount + 2}/${this.serviceConfig.retryCount + 1})...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        return this.attemptPuppeteerWithRetry(htmlContent, options, retryCount + 1);
      }
      
      throw error;
    }
  }

  async generatePDF(
    htmlContent: string, 
    options: PDFEngineOptions = {}
  ): Promise<void> {
    const {
      filename = 'cv-export',
      includeStandardCSS = true,
      validateTemplate = true,
    } = options;

    // Validate template if requested
    if (validateTemplate) {
      const validationResult = templateValidator.validate(htmlContent);
      if (!validationResult.isValid) {
        console.warn('Template validation failed:', validationResult.errors);
      }
    }

    // Process HTML content
    let processedHTML = htmlContent;
    
    // Try Puppeteer service first, fallback to html2pdf if it fails
    try {
      const pdfBlob = await this.attemptPuppeteerWithRetry(processedHTML, options);
      this.downloadBlob(pdfBlob, filename);
      console.log('PDF generated successfully with Puppeteer service');
    } catch (puppeteerError) {
      console.error('Puppeteer service failed:', puppeteerError);
      
      if (this.serviceConfig.fallbackEnabled) {
        console.log('Falling back to html2pdf...');
        try {
          await this.generatePDFWithHtml2PDF(processedHTML, options);
          console.log('PDF generated successfully with html2pdf fallback');
        } catch (fallbackError) {
          console.error('Fallback method also failed:', fallbackError);
          throw new Error(`Both PDF generation methods failed. Puppeteer: ${puppeteerError instanceof Error ? puppeteerError.message : 'Unknown error'}. Fallback: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
        }
      } else {
        throw new Error(`PDF generation failed: ${puppeteerError instanceof Error ? puppeteerError.message : 'Unknown error'}`);
      }
    }
  }
}

export const pdfEngine = new PDFEngine();
