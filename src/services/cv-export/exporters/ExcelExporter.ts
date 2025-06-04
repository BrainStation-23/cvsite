
import { BaseExporter } from './BaseExporter';
import { ExportOptions, ExportResult } from '../CVExportService';

export class ExcelExporter extends BaseExporter {
  async export(options: ExportOptions): Promise<ExportResult> {
    const { template, profile, sections, fieldMappings } = options;
    
    try {
      console.log('Excel Export - Starting export process');
      
      if (!profile) {
        throw new Error('Profile data is required for Excel export');
      }

      // Create CSV content for now (would be enhanced to actual Excel format)
      const csvContent = this.generateCSVContent(profile, sections, fieldMappings);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const fileName = this.generateFileName(profile, 'csv'); // Using CSV extension for now
      
      this.downloadFile(blob, fileName);
      
      return {
        success: true,
        blob,
        url: URL.createObjectURL(blob)
      };
    } catch (error) {
      console.error('Excel export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Excel export failed'
      };
    }
  }

  private generateCSVContent(profile: any, sections: any[], fieldMappings: any[]): string {
    const rows = [];
    
    // Header row
    rows.push(['Field', 'Value']);
    
    // Profile data
    rows.push(['Full Name', `${profile.first_name || ''} ${profile.last_name || ''}`]);
    rows.push(['Email', profile.email || '']);
    rows.push(['Phone', profile.phone || '']);
    rows.push(['Location', profile.location || '']);
    
    // Sections data
    sections.forEach(section => {
      rows.push(['', '']); // Empty row
      rows.push([`${section.section_type.toUpperCase()} SECTION`, '']);
      rows.push(['Section Type', section.section_type]);
      rows.push(['Display Order', section.display_order]);
      rows.push(['Required', section.is_required ? 'Yes' : 'No']);
    });
    
    // Convert to CSV format
    return rows.map(row => 
      row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }
}
