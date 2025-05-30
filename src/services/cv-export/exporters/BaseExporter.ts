
import { ExportOptions, ExportResult } from '../CVExportService';

export abstract class BaseExporter {
  abstract export(options: ExportOptions): Promise<ExportResult>;
  
  protected generateFileName(profile: any, format: string): string {
    const firstName = profile?.first_name || 'Unknown';
    const lastName = profile?.last_name || 'User';
    const timestamp = new Date().toISOString().split('T')[0];
    
    return `CV_${firstName}_${lastName}_${timestamp}.${format}`;
  }

  protected downloadFile(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
