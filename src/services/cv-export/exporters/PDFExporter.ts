
import { BaseExporter } from './BaseExporter';
import { ExportOptions, ExportResult } from '../CVExportService';
import { PDFDocumentBuilder } from '../pdf/PDFDocumentBuilder';

export class PDFExporter extends BaseExporter {
  async export(options: ExportOptions): Promise<ExportResult> {
    const { template, profile, sections, fieldMappings, styles } = options;
    
    try {
      console.log('PDF Export - Starting export with template:', template.name);
      console.log('PDF Export - Profile:', profile?.first_name, profile?.last_name);
      console.log('PDF Export - Sections:', sections?.length || 0);
      console.log('PDF Export - Field mappings:', fieldMappings?.length || 0);
      
      if (!profile) {
        throw new Error('Profile data is required for PDF export');
      }

      if (!sections || sections.length === 0) {
        throw new Error('At least one section must be configured for PDF export');
      }

      // Create PDF document builder
      const pdfBuilder = new PDFDocumentBuilder();
      
      // Build the PDF document
      const pdfArrayBuffer = await pdfBuilder.build(
        profile,
        sections,
        fieldMappings || [],
        styles,
        template.layout_config || {}
      );
      
      // Convert ArrayBuffer to Blob
      const blob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
      const fileName = this.generateFileName(profile, 'pdf');
      
      // Download the file
      this.downloadFile(blob, fileName);
      
      return {
        success: true,
        blob,
        url: URL.createObjectURL(blob)
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
