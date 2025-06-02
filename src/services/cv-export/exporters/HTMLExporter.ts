
import { BaseExporter } from './BaseExporter';
import { ExportOptions, ExportResult } from '../CVExportService';
import { HTMLCSSGenerator } from '../html/HTMLCSSGenerator';
import { HTMLHeaderGenerator } from '../html/HTMLHeaderGenerator';
import { HTMLSectionsGenerator } from '../html/HTMLSectionsGenerator';

export class HTMLExporter extends BaseExporter {
  private cssGenerator = new HTMLCSSGenerator();
  private headerGenerator = new HTMLHeaderGenerator();
  private sectionsGenerator = new HTMLSectionsGenerator();

  async export(options: ExportOptions): Promise<ExportResult> {
    const { template, profile, sections, fieldMappings, styles } = options;
    
    try {
      console.log('=== HTML EXPORT DEBUG START ===');
      console.log('HTML Export - Template:', template.name);
      console.log('HTML Export - Profile:', profile?.first_name, profile?.last_name);
      console.log('HTML Export - Sections:', sections?.length || 0);
      console.log('HTML Export - Field mappings:', fieldMappings?.length || 0);
      console.log('HTML Export - Field mappings data:', fieldMappings);
      
      if (!profile) {
        throw new Error('Profile data is required for HTML export');
      }

      if (!sections || sections.length === 0) {
        throw new Error('At least one section must be configured for HTML export');
      }

      // Generate comprehensive HTML CV
      const htmlContent = this.generateCompleteHTMLCV(profile, template, sections, fieldMappings, styles);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const fileName = this.generateFileName(profile, 'html');
      
      this.downloadFile(blob, fileName);
      
      console.log('=== HTML EXPORT DEBUG END ===');
      
      return {
        success: true,
        blob,
        url: URL.createObjectURL(blob)
      };
    } catch (error) {
      console.error('HTML export failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'HTML export failed'
      };
    }
  }

  private generateCompleteHTMLCV(profile: any, template: any, sections: any[], fieldMappings: any[], styles: any): string {
    const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
    const layoutConfig = template.layout_config || {};
    
    // Generate CSS based on template configuration
    const css = this.cssGenerator.generateCSS(layoutConfig, template.orientation);
    
    // Generate sections HTML
    const sectionsHTML = this.sectionsGenerator.generateSectionsHTML(sections, profile, fieldMappings);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV - ${fullName}</title>
    <style>
        ${css}
    </style>
</head>
<body>
    <div class="cv-container">
        ${this.headerGenerator.generateHeaderHTML(profile, layoutConfig, fieldMappings)}
        ${sectionsHTML}
    </div>
</body>
</html>`;
  }
}
