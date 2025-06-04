
import { BaseExporter } from './BaseExporter';
import { ExportOptions, ExportResult } from '../CVExportService';

export class MarkdownExporter extends BaseExporter {
  async export(options: ExportOptions): Promise<ExportResult> {
    const { template, profile, sections, fieldMappings } = options;
    
    try {
      console.log('Markdown Export - Starting export process');
      
      if (!profile) {
        throw new Error('Profile data is required for Markdown export');
      }

      const markdownContent = this.generateMarkdownContent(profile, sections, template);
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

  private generateMarkdownContent(profile: any, sections: any[], template: any): string {
    let markdown = '';
    
    // Header
    markdown += `# ${profile.first_name || ''} ${profile.last_name || ''}\n\n`;
    
    // Contact information
    if (profile.email || profile.phone || profile.location) {
      markdown += '## Contact Information\n\n';
      if (profile.email) markdown += `**Email:** ${profile.email}\n\n`;
      if (profile.phone) markdown += `**Phone:** ${profile.phone}\n\n`;
      if (profile.location) markdown += `**Location:** ${profile.location}\n\n`;
    }
    
    // Sections
    sections
      .sort((a, b) => a.display_order - b.display_order)
      .forEach(section => {
        markdown += `## ${this.formatSectionTitle(section.section_type)}\n\n`;
        markdown += `*${section.is_required ? 'Required' : 'Optional'} section*\n\n`;
        
        // Add placeholder content based on section type
        switch (section.section_type) {
          case 'experience':
            markdown += '### Work Experience\n\n';
            markdown += '- **Position:** [Position Title]\n';
            markdown += '- **Company:** [Company Name]\n';
            markdown += '- **Duration:** [Start Date] - [End Date]\n';
            markdown += '- **Description:** [Job description and achievements]\n\n';
            break;
          case 'education':
            markdown += '### Education\n\n';
            markdown += '- **Degree:** [Degree Title]\n';
            markdown += '- **Institution:** [University/School Name]\n';
            markdown += '- **Year:** [Graduation Year]\n\n';
            break;
          case 'technical_skills':
            markdown += '### Technical Skills\n\n';
            markdown += '- **Programming Languages:** [Languages]\n';
            markdown += '- **Frameworks:** [Frameworks]\n';
            markdown += '- **Tools:** [Tools and Technologies]\n\n';
            break;
          default:
            markdown += `Content for ${section.section_type} section would be rendered here.\n\n`;
        }
      });
    
    // Footer
    markdown += '---\n\n';
    markdown += `*Generated from ${template.name} template*\n`;
    markdown += `*Export Date: ${new Date().toLocaleDateString()}*\n`;
    
    return markdown;
  }

  private formatSectionTitle(sectionType: string): string {
    return sectionType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
