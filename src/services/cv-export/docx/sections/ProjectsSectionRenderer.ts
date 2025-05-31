
import { Paragraph, Table } from 'docx';
import { BaseSectionRenderer } from './BaseSectionRenderer';
import { RichTextProcessor } from '../RichTextProcessor';

export class ProjectsSectionRenderer extends BaseSectionRenderer {
  private richTextProcessor: RichTextProcessor;

  constructor() {
    super();
    this.richTextProcessor = new RichTextProcessor();
  }

  render(projects: any[], styles: any): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];
    const baseStyles = styles?.baseStyles || {};
    
    try {
      projects.forEach((project) => {
        // Apply masking to each field
        const name = this.maskingService.applyMasking(project.name, 'name', 'projects');
        const role = this.maskingService.applyMasking(project.role, 'role', 'projects');
        const description = this.maskingService.applyMasking(project.description, 'description', 'projects');
        const technologies = this.maskingService.applyMasking(project.technologies_used, 'technologies_used', 'projects');

        // Project Name and Role
        if (name || role) {
          const titleText = name || '';
          const roleText = role ? ` (${role})` : '';
          elements.push(this.styler.createItemTitle(`${titleText}${roleText}`, baseStyles));
        }

        // Date Range
        if (project.start_date || project.end_date) {
          const dateRange = this.formatDateRange(project.start_date, project.end_date, false);
          const maskedDateRange = this.maskingService.applyMasking(dateRange, 'date_range', 'projects');
          elements.push(this.styler.createItemSubtitle(maskedDateRange, baseStyles));
        }

        // Description with rich text parsing and masking
        if (description) {
          const richTextParagraphs = this.richTextProcessor.parseRichTextToDocx(description, baseStyles);
          elements.push(...richTextParagraphs);
        }

        // Technologies
        if (technologies && technologies.length > 0) {
          const techText = Array.isArray(technologies) 
            ? technologies.join(', ')
            : technologies;
          
          elements.push(this.styler.createRegularText(`Technologies: ${techText}`, baseStyles));
        }
      });
    } catch (error) {
      console.error('Error rendering projects section:', error);
    }

    return elements;
  }
}
