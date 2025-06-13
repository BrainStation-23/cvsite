
import { BaseExporter } from './BaseExporter';
import { ExportOptions, ExportResult } from '../CVExportService';
import { HTMLExporter } from './HTMLExporter';
import html2pdf from 'html2pdf.js';

export class PDFExporter extends BaseExporter {
  private htmlExporter = new HTMLExporter();

  async export(options: ExportOptions): Promise<ExportResult> {
    const { template, profile, sections, fieldMappings, styles } = options;
    
    try {
      console.log('PDF Export - Starting HTML to PDF conversion for template:', template.name);
      console.log('PDF Export - Profile:', profile?.first_name, profile?.last_name);
      console.log('PDF Export - Sections:', sections?.length || 0);
      console.log('PDF Export - Field mappings:', fieldMappings?.length || 0);
      
      if (!profile) {
        throw new Error('Profile data is required for PDF export');
      }

      if (!sections || sections.length === 0) {
        throw new Error('At least one section must be configured for PDF export');
      }

      // First generate HTML using the existing HTML exporter
      console.log('PDF Export - Generating HTML content...');
      const htmlResult = await this.htmlExporter.export(options);
      
      if (!htmlResult.success || !htmlResult.blob) {
        throw new Error('Failed to generate HTML for PDF conversion');
      }

      // Convert HTML blob to text
      const htmlText = await htmlResult.blob.text();
      
      // Create a temporary div to hold the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlText;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      document.body.appendChild(tempDiv);

      console.log('PDF Export - Converting HTML to PDF...');

      // Configure html2pdf options
      const orientation = template.orientation || 'portrait';
      const opt = {
        margin: 10,
        filename: this.generateFileName(profile, 'pdf'),
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: orientation
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // Generate PDF
      const pdfBlob = await html2pdf()
        .set(opt)
        .from(tempDiv)
        .outputPdf('blob');

      // Clean up temporary element
      document.body.removeChild(tempDiv);

      // Download the PDF
      this.downloadFile(pdfBlob, this.generateFileName(profile, 'pdf'));

      console.log('PDF Export - Successfully converted HTML to PDF');

      return {
        success: true,
        blob: pdfBlob,
        url: URL.createObjectURL(pdfBlob)
      };
    } catch (error) {
      console.error('PDF export failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PDF export failed'
      };
    }
  }
}
