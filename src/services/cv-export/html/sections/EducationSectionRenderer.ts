
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

export class EducationSectionRenderer {
  render(profile: any, fieldMappings: FieldMapping[], section: TemplateSection, customTitle?: string): string {
    const title = customTitle || 'Education';
    const education = profile.education || [];
    
    const educationItems = education.map((edu: any) => `
      <div class="item education-item">
        <div class="item-header">
          <h4 class="item-title">${edu.degree || ''}</h4>
          <div class="item-subtitle">${edu.university || ''} | ${edu.graduation_year || ''}</div>
        </div>
        ${edu.department ? `<div class="item-detail">Department: ${edu.department}</div>` : ''}
        ${edu.gpa ? `<div class="item-detail">GPA: ${edu.gpa}</div>` : ''}
      </div>
    `).join('');

    return `<div class="section education-section">
      <h2 class="section-title">${title}</h2>
      <div class="section-content">
        ${educationItems}
      </div>
    </div>`;
  }
}
