
import { BaseExporter } from './BaseExporter';
import { ExportOptions, ExportResult } from '../CVExportService';
import { CVToPDFService } from '../pdf/CVToPDFService';

export class PDFExporter extends BaseExporter {
  async export(options: ExportOptions): Promise<ExportResult> {
    const { template, profile, sections, fieldMappings, styles } = options;
    
    try {
      console.log('PDF Export - Starting HTML-to-PDF export with template:', template.name);
      console.log('PDF Export - Profile:', profile?.first_name, profile?.last_name);
      console.log('PDF Export - Sections:', sections?.length || 0);
      console.log('PDF Export - Field mappings:', fieldMappings?.length || 0);
      
      if (!profile) {
        throw new Error('Profile data is required for PDF export');
      }

      if (!sections || sections.length === 0) {
        throw new Error('At least one section must be configured for PDF export');
      }

      // Generate PDF using HTML-to-PDF approach
      const pdfBlob = await CVToPDFService.exportCV({
        template,
        profile,
        sections,
        fieldMappings: fieldMappings || [],
        format: 'a4',
        orientation: template.orientation || 'portrait',
        hidePreviewInfo: true
      });
      
      const fileName = this.generateFileName(profile, 'pdf');
      
      // Download the file
      this.downloadFile(pdfBlob, fileName);
      
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
