
import { CVTemplate } from '@/types/cv-templates';
import { PDFExporter } from './exporters/PDFExporter';
import { DOCXExporter } from './exporters/DOCXExporter';
import { PPTExporter } from './exporters/PPTExporter';
import { TXTExporter } from './exporters/TXTExporter';
import { HTMLExporter } from './exporters/HTMLExporter';

export type ExportFormat = 'pdf' | 'docx' | 'ppt' | 'txt' | 'html';

export interface ExportOptions {
  format: ExportFormat;
  template: CVTemplate;
  profile: any;
  sections: any[];
  fieldMappings: any[];
  styles: any;
}

export interface ExportResult {
  success: boolean;
  url?: string;
  blob?: Blob;
  error?: string;
}

export class CVExportService {
  private static exporters = {
    pdf: new PDFExporter(),
    docx: new DOCXExporter(),
    ppt: new PPTExporter(),
    txt: new TXTExporter(),
    html: new HTMLExporter()
  };

  static async export(options: ExportOptions): Promise<ExportResult> {
    const { format } = options;
    
    try {
      console.log(`Starting ${format.toUpperCase()} export...`);
      
      const exporter = this.exporters[format];
      if (!exporter) {
        throw new Error(`Unsupported export format: ${format}`);
      }

      const result = await exporter.export(options);
      
      console.log(`${format.toUpperCase()} export completed successfully`);
      return result;
    } catch (error) {
      console.error(`Export failed for format ${format}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }

  static getSupportedFormats(): ExportFormat[] {
    return ['pdf', 'docx', 'ppt', 'txt', 'html'];
  }

  static getFormatLabel(format: ExportFormat): string {
    const labels = {
      pdf: 'PDF Document',
      docx: 'Word Document',
      ppt: 'PowerPoint Presentation',
      txt: 'Plain Text',
      html: 'HTML Document'
    };
    return labels[format];
  }
}
