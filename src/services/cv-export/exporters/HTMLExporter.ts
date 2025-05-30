
import { BaseExporter } from './BaseExporter';
import { ExportOptions, ExportResult } from '../CVExportService';

export class HTMLExporter extends BaseExporter {
  async export(options: ExportOptions): Promise<ExportResult> {
    const { template, profile, sections, fieldMappings, styles } = options;
    
    try {
      console.log('HTML Export - Template:', template.name);
      console.log('HTML Export - Profile:', profile?.first_name, profile?.last_name);
      
      // Generate HTML CV
      const htmlContent = this.generateHTMLCV(profile, template, sections, fieldMappings, styles);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const fileName = this.generateFileName(profile, 'html');
      
      this.downloadFile(blob, fileName);
      
      return {
        success: true,
        blob,
        url: URL.createObjectURL(blob)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'HTML export failed'
      };
    }
  }

  private generateHTMLCV(profile: any, template: any, sections: any[], fieldMappings: any[], styles: any): string {
    const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV - ${fullName}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .cv-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .name {
            font-size: 2em;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        .contact-info {
            color: #666;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 1.2em;
            font-weight: bold;
            color: #333;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .placeholder {
            color: #888;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="cv-container">
        <div class="header">
            <div class="name">${fullName || 'Your Name'}</div>
            <div class="contact-info">
                ${profile?.email ? `Email: ${profile.email}` : ''}
                ${profile?.phone ? ` | Phone: ${profile.phone}` : ''}
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Template Information</div>
            <p>Template: ${template?.name || 'Unknown Template'}</p>
            <p>Orientation: ${template?.orientation || 'Not specified'}</p>
            <p class="placeholder">This is a placeholder HTML export. Full implementation will render all CV sections with proper styling.</p>
        </div>
        
        <div class="section">
            <div class="section-title">Configured Sections</div>
            ${sections.length > 0 ? 
              sections.map(s => `<p>• ${s.section_type}</p>`).join('') : 
              '<p class="placeholder">No sections configured</p>'
            }
        </div>
        
        <div class="section">
            <div class="section-title">Export Information</div>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Format: HTML</p>
        </div>
    </div>
</body>
</html>`;
  }
}
