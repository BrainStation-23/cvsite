
import { BaseExporter } from './BaseExporter';
import { ExportOptions, ExportResult } from '../CVExportService';
import { PPTDocumentBuilder } from '../ppt/PPTDocumentBuilder';

export class PPTExporter extends BaseExporter {
  async export(options: ExportOptions): Promise<ExportResult> {
    const { template, profile, sections, fieldMappings, styles } = options;
    
    try {
      console.log('PPT Export - Starting export with template:', template.name);
      console.log('PPT Export - Profile:', profile?.first_name, profile?.last_name);
      console.log('PPT Export - Sections:', sections?.length || 0);
      console.log('PPT Export - Field mappings:', fieldMappings?.length || 0);
      
      if (!profile) {
        throw new Error('Profile data is required for PPT export');
      }

      if (!sections || sections.length === 0) {
        throw new Error('At least one section must be configured for PPT export');
      }

      // Create PPT document builder
      const pptBuilder = new PPTDocumentBuilder();
      
      // Build the PPT document
      const pptBlob = await pptBuilder.build(
        profile,
        sections,
        fieldMappings || [],
        styles,
        template.layout_config || {}
      );
      
      const fileName = this.generateFileName(profile, 'pptx');
      
      // Download the file
      this.downloadFile(pptBlob, fileName);
      
      return {
        success: true,
        blob: pptBlob,
        url: URL.createObjectURL(pptBlob)
      };
    } catch (error) {
      console.error('PPT export failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PPT export failed'
      };
    }
  }
}
