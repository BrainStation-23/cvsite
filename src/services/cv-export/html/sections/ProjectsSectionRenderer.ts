
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
  render(profile: any, fieldMappings: FieldMapping[], section: TemplateSection, customTitle?: string): string {
    const title = customTitle || 'Projects';
    const projects = profile.projects || [];
    
    const projectItems = projects.map((project: any) => {
      const technologies = Array.isArray(project.technologies_used) ? project.technologies_used : [];
      const techTags = technologies.map((tech: string) => `<span class="skill-tag">${tech}</span>`).join('');
      
      return `<div class="item project-item">
        <div class="item-header">
          <h4 class="item-title">${project.name || ''}</h4>
          <div class="item-subtitle">${project.role || ''} | ${project.start_date || ''} - ${project.end_date || 'Present'}</div>
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
