
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

export class ExperienceSectionRenderer {
  render(profile: any, fieldMappings: FieldMapping[], section: TemplateSection, customTitle?: string): string {
    const title = customTitle || 'Professional Experience';
    const experiences = profile.experiences || [];
    
    const experienceItems = experiences.map((exp: any) => `
      <div class="item experience-item">
        <div class="item-header">
          <h4 class="item-title">${exp.job_title || ''}</h4>
          <div class="item-subtitle">${exp.company_name || ''} | ${exp.start_date || ''} - ${exp.end_date || 'Present'}</div>
        </div>
        ${exp.description ? `<div class="item-description">${exp.description}</div>` : ''}
      </div>
    `).join('');

    return `<div class="section experience-section">
      <h2 class="section-title">${title}</h2>
      <div class="section-content">
        ${experienceItems}
      </div>
    </div>`;
  }
}
