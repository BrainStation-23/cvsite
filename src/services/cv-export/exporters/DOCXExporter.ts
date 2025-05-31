
import { BaseExporter } from './BaseExporter';
import { ExportOptions, ExportResult } from '../CVExportService';
import { DocumentBuilder } from '../docx/DocumentBuilder';

export class DOCXExporter extends BaseExporter {
  private documentBuilder: DocumentBuilder;

  constructor() {
    super();
    this.documentBuilder = new DocumentBuilder();
  }

  async export(options: ExportOptions): Promise<ExportResult> {
    const { profile } = options;
    
    try {
      console.log('DOCX Export - Starting export process');
      console.log('DOCX Export - Template:', options.template?.name);
      console.log('DOCX Export - Profile:', profile?.first_name, profile?.last_name);
      console.log('DOCX Export - Sections count:', options.sections?.length);
      console.log('DOCX Export - Field mappings count:', options.fieldMappings?.length);
      
      if (!profile) {
        throw new Error('Profile data is required for export');
      }

      if (!options.sections || options.sections.length === 0) {
        throw new Error('No sections configured for export');
      }
      
      const blob = await this.documentBuilder.exportToBlob(options);
      console.log('DOCX Export - Blob created, size:', blob.size, 'bytes');
      
      const fileName = this.generateFileName(profile, 'docx');
      console.log('DOCX Export - Downloading file:', fileName);
      
      this.downloadFile(blob, fileName);
      
      return {
        success: true,
        blob,
        url: URL.createObjectURL(blob)
      };
    } catch (error) {
      console.error('DOCX export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'DOCX export failed'
      };
    }
  }
}
