
interface FieldMapping {
  original_field_name: string;
  display_name: string;
  is_masked: boolean;
  mask_value?: string;
  field_order: number;
  visibility_rules: Record<string, any>;
  section_type: string;
}

interface TemplateSection {
  id: string;
  section_type: string;
  display_order: number;
  is_required: boolean;
  field_mapping: Record<string, any>;
  styling_config: Record<string, any>;
}

export class ProjectsSectionRenderer {
  // Helper function to format date in MMM'YYYY format (e.g., Jan'2021)
  private formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      return `${month}'${year}`;
    } catch {
      return dateString.toString();
    }
  }

  render(profile: any, fieldMappings: FieldMapping[], section: TemplateSection, customTitle?: string): string {
    const title = customTitle || 'Projects';
    const projects = profile.projects || [];

    const projectItems = projects.map((project: any) => {
      const technologies = Array.isArray(project.technologies_used) ? project.technologies_used : [];
      const techTags = technologies.map((tech: string) => `<span class="skill-tag">${tech}</span>`).join('');

      const startDate = this.formatDate(project.start_date);
      const endDate = project.end_date ? this.formatDate(project.end_date) : 'Present';

      return `<div class="item project-item">
        <div class="item-header">
          <h4 class="item-title">${project.name || ''}</h4>
          <div class="item-subtitle">
            <div class="field-heading">${project.role || ''}</div>
            <div class="field-subheading">${startDate} - ${endDate}</div>
          </div>
        </div>
        ${project.description ? `<div class="item-description">${project.description}</div>` : ''}
        ${technologies.length > 0 ? `<div class="technologies">${techTags}</div>` : ''}
        ${project.url ? `<div class="project-url"><a href="${project.url}" target="_blank">${project.url}</a></div>` : ''}
      </div>`;
    }).join('');

    return `<div class="section projects-section">
      <h2 class="section-title">${title}</h2>
      <div class="section-content">
        ${projectItems}
      </div>
    </div>`;
  }
}
