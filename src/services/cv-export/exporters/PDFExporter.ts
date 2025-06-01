
import { BaseExporter } from './BaseExporter';
import { ExportOptions, ExportResult } from '../CVExportService';
import { CVToPDFService } from '../pdf/CVToPDFService';

export class PDFExporter extends BaseExporter {
  async export(options: ExportOptions): Promise<ExportResult> {
    const { template, profile, sections, fieldMappings, styles } = options;
    
    try {
      console.log('PDFExporter - Starting export with template:', template.name);
      console.log('PDFExporter - Profile:', profile?.first_name, profile?.last_name);
      console.log('PDFExporter - Sections count:', sections?.length || 0);
      console.log('PDFExporter - Field mappings count:', fieldMappings?.length || 0);
      
      if (!profile) {
        throw new Error('Profile data is required for PDF export');
      }

      if (!sections || sections.length === 0) {
        console.warn('PDFExporter - No sections configured, creating empty CV');
      }

      // Generate PDF using HTML-to-PDF approach
      const pdfBlob = await CVToPDFService.exportCV({
        template,
        profile,
        sections: sections || [],
        fieldMappings: fieldMappings || [],
        format: 'a4',
        orientation: template.orientation || 'portrait',
        hidePreviewInfo: true,
        margin: [10, 10, 10, 10]
      });
      
      console.log('PDFExporter - PDF generated, size:', pdfBlob.size);
      
      if (pdfBlob.size === 0) {
        throw new Error('Generated PDF is empty');
      }
      
      const fileName = this.generateFileName(profile, 'pdf');
      
      // Download the file
      this.downloadFile(pdfBlob, fileName);
      
      return {
        success: true,
        blob: pdfBlob,
        url: URL.createObjectURL(pdfBlob)
      };
    } catch (error) {
      console.error('PDFExporter - Export failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PDF export failed'
      };
    }
  }
}
