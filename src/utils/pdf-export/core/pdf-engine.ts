
import html2pdf from 'html2pdf.js';
import { STANDARD_CV_CSS } from '@/constants/cv-template-standards';
import { templateValidator } from '@/utils/template-validator';

interface PDFEngineOptions {
  filename?: string;
  includeStandardCSS?: boolean;
  validateTemplate?: boolean;
  pageSize?: 'a4' | 'letter';
  margin?: number;
}

export class PDFEngine {
  private injectStandardCSS(htmlContent: string): string {
    // Check if standard CSS is already included
    if (htmlContent.includes('cv-container') && htmlContent.includes('<style>')) {
      return htmlContent;
    }

    // Find the head tag or create one
    const headMatch = htmlContent.match(/<head[^>]*>/i);
    if (headMatch) {
      return htmlContent.replace(
        headMatch[0],
        `${headMatch[0]}\n<style>\n${STANDARD_CV_CSS}\n</style>`
      );
    }

    // If no head tag, add style at the beginning
    return `<style>\n${STANDARD_CV_CSS}\n</style>\n${htmlContent}`;
  }

  private optimizeForPDF(htmlContent: string): string {
    let optimized = htmlContent;

    // Ensure proper page break handling
    optimized = optimized.replace(
      /<div class="cv-section"/g,
      '<div class="cv-section cv-page-break-avoid"'
    );

    // Add page break opportunities between major sections
    optimized = optimized.replace(
      /<\/section>\s*<section/g,
      '</section>\n<div class="cv-page-break-auto"></div>\n<section'
    );

    return optimized;
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

  async generatePDF(
    htmlContent: string, 
    options: PDFEngineOptions = {}
  ): Promise<void> {
    const {
      filename = 'cv-export',
      includeStandardCSS = true,
      validateTemplate = true,
      pageSize = 'a4',
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
    
    if (includeStandardCSS) {
      processedHTML = this.injectStandardCSS(processedHTML);
    }
    
    processedHTML = this.optimizeForPDF(processedHTML);

    // Configure PDF options
    const [width, height] = this.getPageSize(pageSize);
    
    const opt = {
      filename: `${filename}.pdf`,
      image: { 
        type: 'webp', 
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
        orientation: 'portrait',
        unit: pageSize === 'a4' ? 'mm' : 'in',
        format: [width, height],
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
      .from(processedHTML)
      .set(opt)
      .save();
  }
}

export const pdfEngine = new PDFEngine();
