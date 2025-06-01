
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

      // Validate that we have some content to export
      const hasBasicInfo = profile.first_name || profile.last_name || profile.employee_id;
      const hasDataSections = sections?.some((section: any) => {
        const sectionType = section.section_type;
        const sectionData = profile[sectionType] || profile[sectionType.replace('_', '')];
        return sectionData && (Array.isArray(sectionData) ? sectionData.length > 0 : true);
      });

      if (!hasBasicInfo && !hasDataSections) {
        throw new Error('No content available to export - profile appears to be empty');
      }

      console.log('PDFExporter - Content validation passed, proceeding with PDF generation');

      // Generate PDF using the new HTML-based approach
      const pdfBlob = await CVToPDFService.exportCV({
        template,
        profile,
        sections: sections || [],
        fieldMappings: fieldMappings || [],
        format: 'a4',
        orientation: template.orientation || 'portrait',
        hidePreviewInfo: true,
        margin: [15, 15, 15, 15]
      });
      
      console.log('PDFExporter - PDF generated successfully, size:', pdfBlob.size);
      
      if (pdfBlob.size === 0) {
        throw new Error('Generated PDF is empty - no content was rendered');
      }
      
      if (pdfBlob.size < 1000) {
        console.warn('PDFExporter - Warning: PDF size is very small, might indicate rendering issues');
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
