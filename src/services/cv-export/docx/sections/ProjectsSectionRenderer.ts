
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

      // Get ordered fields for projects section via fieldMappings
      const fieldMappings = styles?.fieldMappings || [];
      const getOrderedFields = () => {
        console.log('[ProjectsSectionRenderer] fieldMappings received:', fieldMappings);
        const filtered = fieldMappings
          .filter((f: any) => f.section_type === 'projects')
          .sort((a: any, b: any) => a.field_order - b.field_order);
        console.log('[ProjectsSectionRenderer] filtered fieldMappings for projects:', filtered);
        if (filtered.length === 0) {
          throw new Error('No fieldMappings found for projects section. This must be provided for correct rendering.');
        }
        return filtered;
      };

      projectsToShow.forEach((project) => {
        const orderedFields = getOrderedFields();
        orderedFields.forEach((field: any) => {
          const fieldName = field.original_field_name;
          let value = '';
          switch (fieldName) {
            case 'name':
              value = this.applyFieldMasking(project.name, 'name', 'projects');
              if (value) elements.push(this.styler.createItemTitle(value, baseStyles));
              break;
            case 'role':
              value = this.applyFieldMasking(project.role, 'role', 'projects');
              if (value) elements.push(this.styler.createItemSubtitle(value, baseStyles));
              break;
            case 'date_range':
              if (project.start_date || project.end_date) {
                const dateRange = this.formatDateRange(project.start_date, project.end_date, false);
                value = this.applyFieldMasking(dateRange, 'date_range', 'projects');
                if (value) elements.push(this.styler.createItemSubtitle(value, baseStyles));
              }
              break;
            case 'description':
              value = this.applyFieldMasking(project.description, 'description', 'projects');
              if (value) {
                const richTextParagraphs = this.richTextProcessor.parseRichTextToDocx(value, baseStyles);
                elements.push(...richTextParagraphs);
              }
              break;
            case 'responsibility':
              value = this.applyFieldMasking(project.responsibility, 'responsibility', 'projects');
              if (value) {
                const richTextParagraphs = this.richTextProcessor.parseRichTextToDocx(value, baseStyles);
                elements.push(...richTextParagraphs);
              }
              break;
            case 'technologies_used':
              value = this.applyFieldMasking(project.technologies_used, 'technologies_used', 'projects');
              if (value && value.length > 0) {
                const techText = Array.isArray(value) ? value.join(', ') : value;
                elements.push(this.styler.createRegularText(`Technologies: ${techText}`, baseStyles));
              }
              break;
            default:
              value = this.applyFieldMasking(project[fieldName], fieldName, 'projects');
              if (value) elements.push(this.styler.createItemSubtitle(value, baseStyles));
          }
        });
        // Optionally add a blank paragraph for spacing between projects
        elements.push(new Paragraph({ text: '', spacing: { after: 200 } }));
      });
    } catch (error) {
      console.error('Error rendering projects section:', error);
    }

    return elements;
  }
}
