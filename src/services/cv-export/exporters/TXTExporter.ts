
import { BaseExporter } from './BaseExporter';
import { ExportOptions, ExportResult } from '../CVExportService';

export class TXTExporter extends BaseExporter {
  async export(options: ExportOptions): Promise<ExportResult> {
    const { template, profile, sections, fieldMappings } = options;
    
    try {
      console.log('TXT Export - Template:', template.name);
      console.log('TXT Export - Profile:', profile?.first_name, profile?.last_name);
      
      // Generate plain text CV
      const textContent = this.generateTextCV(profile, template, sections, fieldMappings);
      const blob = new Blob([textContent], { type: 'text/plain' });
      const fileName = this.generateFileName(profile, 'txt');
      
      this.downloadFile(blob, fileName);
      
      return {
        success: true,
        blob,
        url: URL.createObjectURL(blob)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'TXT export failed'
      };
    }
  }

  private generateTextCV(profile: any, template: any, sections: any[], fieldMappings: any[]): string {
    let content = '';
    
    // Header
    content += '=====================================\n';
    content += `         CURRICULUM VITAE\n`;
    content += '=====================================\n\n';
    
    // Basic info
    if (profile?.first_name || profile?.last_name) {
      content += `Name: ${profile?.first_name || ''} ${profile?.last_name || ''}\n`;
    }
    if (profile?.email) {
      content += `Email: ${profile.email}\n`;
    }
    if (profile?.phone) {
      content += `Phone: ${profile.phone}\n`;
    }
    content += '\n';
    
    // TODO: Process sections and fieldMappings to generate structured content
    content += 'SECTIONS:\n';
    content += '---------\n';
    sections.forEach(section => {
      content += `- ${section.section_type}\n`;
    });
    
    content += '\n';
    content += `Generated from template: ${template?.name || 'Unknown'}\n`;
    content += `Export date: ${new Date().toLocaleDateString()}\n`;
    
    return content;
  }
}
