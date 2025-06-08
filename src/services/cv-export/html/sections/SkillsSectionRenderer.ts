
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

export class SkillsSectionRenderer {
  renderTechnicalSkills(profile: any, fieldMappings: FieldMapping[], section: TemplateSection, customTitle?: string): string {
    const title = customTitle || 'Technical Skills';
    const skills = profile.technical_skills || [];
    
    const skillsHTML = skills.map((skill: any) => {
      const technologies = Array.isArray(skill.technologies) ? skill.technologies : [];
      const techItems = technologies.map((tech: string) => `<span class="skill-tag">${tech}</span>`).join('');
      
      return `<div class="skill-category">
        <h4 class="skill-category-title">${skill.category || ''}</h4>
        <div class="skills-container">${techItems}</div>
      </div>`;
    }).join('');

    return `<div class="section technical-skills-section">
      <h2 class="section-title">${title}</h2>
      <div class="section-content">
        ${skillsHTML}
      </div>
    </div>`;
  }

  renderSpecializedSkills(profile: any, fieldMappings: FieldMapping[], section: TemplateSection, customTitle?: string): string {
    const title = customTitle || 'Specialized Skills';
    const skills = profile.specialized_skills || [];
    
    const skillsHTML = skills.map((skill: any) => {
      const technologies = Array.isArray(skill.technologies) ? skill.technologies : [];
      const techItems = technologies.map((tech: string) => `<span class="skill-tag">${tech}</span>`).join('');
      
      return `<div class="skill-category">
        <h4 class="skill-category-title">${skill.category || ''}</h4>
        <div class="skills-container">${techItems}</div>
      </div>`;
    }).join('');

    return `<div class="section specialized-skills-section">
      <h2 class="section-title">${title}</h2>
      <div class="section-content">
        ${skillsHTML}
      </div>
    </div>`;
  }
}
