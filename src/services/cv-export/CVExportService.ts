
import { CVTemplate } from '@/types/cv-templates';
import { PDFExporter } from './exporters/PDFExporter';
import { DOCXExporter } from './exporters/DOCXExporter';
import { PPTExporter } from './exporters/PPTExporter';
import { TXTExporter } from './exporters/TXTExporter';
import { HTMLExporter } from './exporters/HTMLExporter';
import { JSONExporter } from './exporters/JSONExporter';
import { ExcelExporter } from './exporters/ExcelExporter';
import { MarkdownExporter } from './exporters/MarkdownExporter';

export type ExportFormat = 'pdf' | 'docx' | 'ppt' | 'txt' | 'html' | 'json' | 'excel' | 'markdown';

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

export interface ExportCategory {
  id: string;
  name: string;
  description: string;
  formats: ExportFormatInfo[];
}

interface ExportFormatInfo {
  format: ExportFormat;
  name: string;
  description: string;
  available: boolean;
  comingSoon?: boolean;
}

export class CVExportService {
  private static exporters = {
    pdf: new PDFExporter(),
    docx: new DOCXExporter(),
    ppt: new PPTExporter(),
    txt: new TXTExporter(),
    html: new HTMLExporter(),
    json: new JSONExporter(),
    excel: new ExcelExporter(),
    markdown: new MarkdownExporter()
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
    return ['pdf', 'docx', 'ppt', 'txt', 'html', 'json', 'excel', 'markdown'];
  }

  static getFormatLabel(format: ExportFormat): string {
    const labels = {
      pdf: 'PDF Document',
      docx: 'Word Document',
      ppt: 'PowerPoint Presentation',
      txt: 'Plain Text',
      html: 'HTML Document',
      json: 'JSON Data',
      excel: 'Excel Spreadsheet',
      markdown: 'Markdown Document'
    };
    return labels[format];
  }

  static getExportCategories(): ExportCategory[] {
    return [
      {
        id: 'documents',
        name: 'Documents',
        description: 'Professional document formats',
        formats: [
          {
            format: 'pdf',
            name: 'PDF',
            description: 'Portable Document Format - ideal for printing and sharing',
            available: false,
            comingSoon: true
          },
          {
            format: 'docx',
            name: 'Word',
            description: 'Microsoft Word document - editable format',
            available: true
          },
          {
            format: 'markdown',
            name: 'Markdown',
            description: 'Lightweight markup language - perfect for developers',
            available: true
          }
        ]
      },
      {
        id: 'presentation',
        name: 'Presentation',
        description: 'Formats for presentations and visual display',
        formats: [
          {
            format: 'ppt',
            name: 'PowerPoint',
            description: 'Microsoft PowerPoint presentation',
            available: false,
            comingSoon: true
          },
          {
            format: 'html',
            name: 'HTML',
            description: 'Web page format - viewable in any browser',
            available: true
          }
        ]
      },
      {
        id: 'data',
        name: 'Data & Analysis',
        description: 'Structured data formats for analysis',
        formats: [
          {
            format: 'json',
            name: 'JSON',
            description: 'JavaScript Object Notation - machine readable data',
            available: true
          },
          {
            format: 'excel',
            name: 'Excel',
            description: 'Microsoft Excel spreadsheet - great for data analysis',
            available: true
          },
          {
            format: 'txt',
            name: 'Plain Text',
            description: 'Simple text format - maximum compatibility',
            available: true
          }
        ]
      }
    ];
  }
}
