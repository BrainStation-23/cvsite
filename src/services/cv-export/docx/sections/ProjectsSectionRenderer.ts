
import { Paragraph, Table } from 'docx';
import { BaseSectionRenderer } from './BaseSectionRenderer';
import { RichTextProcessor } from '../RichTextProcessor';

export class ProjectsSectionRenderer extends BaseSectionRenderer {
  private richTextProcessor: RichTextProcessor;

  constructor() {
    super();
    this.richTextProcessor = new RichTextProcessor();
  }

  render(projects: any[], styles: any, sectionConfig?: any): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];
    const baseStyles = styles?.baseStyles || {};
    
    try {
      // Apply projects limit from section configuration
      const maxProjects = sectionConfig?.styling_config?.projects_to_view || sectionConfig?.styling_config?.items_per_column || projects.length;
      
      // Sort projects by display_order, then by start_date as fallback
      const sortedProjects = [...projects].sort((a, b) => {
        if (a.display_order !== undefined && b.display_order !== undefined) {
          return a.display_order - b.display_order;
        }
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      });

      // Limit the number of projects to show
      const projectsToShow = sortedProjects.slice(0, maxProjects);
      
      console.log(`DOCX Projects section - Total: ${projects.length}, Max to show: ${maxProjects}, Showing: ${projectsToShow.length}`);

      projectsToShow.forEach((project) => {
        // Check field visibility and apply masking
        const showName = this.isFieldVisible('name', 'projects');
        const showRole = this.isFieldVisible('role', 'projects');
        const showDescription = this.isFieldVisible('description', 'projects');
        const showTechnologies = this.isFieldVisible('technologies_used', 'projects');
        const showDateRange = this.isFieldVisible('date_range', 'projects');

        // Project Name and Role
        if (showName || showRole) {
          let titleText = '';
          let roleText = '';
          
          if (showName) {
            const name = this.applyFieldMasking(project.name, 'name', 'projects');
            titleText = name || '';
          }
          
          if (showRole) {
            const role = this.applyFieldMasking(project.role, 'role', 'projects');
            roleText = role ? ` (${role})` : '';
          }
          
          if (titleText || roleText) {
            elements.push(this.styler.createItemTitle(`${titleText}${roleText}`, baseStyles));
          }
        }

        // Date Range
        if (showDateRange && (project.start_date || project.end_date)) {
          const dateRange = this.formatDateRange(project.start_date, project.end_date, false);
          const maskedDateRange = this.applyFieldMasking(dateRange, 'date_range', 'projects');
          elements.push(this.styler.createItemSubtitle(maskedDateRange, baseStyles));
        }

        // Description with rich text parsing and masking
        if (showDescription) {
          const description = this.applyFieldMasking(project.description, 'description', 'projects');
          if (description) {
            const richTextParagraphs = this.richTextProcessor.parseRichTextToDocx(description, baseStyles);
            elements.push(...richTextParagraphs);
          }
        }

        // Technologies
        if (showTechnologies) {
          const technologies = this.applyFieldMasking(project.technologies_used, 'technologies_used', 'projects');
          if (technologies && technologies.length > 0) {
            const techText = Array.isArray(technologies) 
              ? technologies.join(', ')
              : technologies;
            
            elements.push(this.styler.createRegularText(`Technologies: ${techText}`, baseStyles));
          }
        }
      });
    } catch (error) {
      console.error('Error rendering projects section:', error);
    }

    return elements;
  }
}
