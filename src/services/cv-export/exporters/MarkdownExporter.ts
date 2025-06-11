
import { BaseExporter } from './BaseExporter';
import { ExportOptions, ExportResult } from '../CVExportService';
import { MarkdownContentGenerator } from './markdown/MarkdownContentGenerator';

export class MarkdownExporter extends BaseExporter {
  async export(options: ExportOptions): Promise<ExportResult> {
    const { template, profile, sections, fieldMappings } = options;
    
    try {
      console.log('Markdown Export - Starting export process');
      
      if (!profile) {
        throw new Error('Profile data is required for Markdown export');
      }

      const markdownContent = MarkdownContentGenerator.generateMarkdownContent(profile, sections, template, fieldMappings);
      const blob = new Blob([markdownContent], { type: 'text/markdown' });
      const fileName = this.generateFileName(profile, 'md');
      
      this.downloadFile(blob, fileName);
      
      return {
        success: true,
        blob,
        url: URL.createObjectURL(blob)
      };
    } catch (error) {
      console.error('Markdown export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Markdown export failed'
      };
    }
  }
}
