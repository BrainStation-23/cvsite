
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
    
    if (skills.length === 0) {
      return '';
    }
    
    const skillsHTML = skills.map((skill: any) => {
      // Match the CV preview structure: skill.name and skill.proficiency
      const skillName = skill.name || '';
      const proficiency = skill.proficiency || 0;
      const displayText = `${skillName} (${proficiency}/10)`;
      
      return `<span class="skill-tag" style="
        background-color: #3b82f6;
        color: white;
        padding: 2pt 6pt;
        border-radius: 3pt;
        font-size: 0.8em;
        display: inline-block;
        margin: 2pt;
      ">${displayText}</span>`;
    }).join('');

    return `<div class="section technical-skills-section">
      <h2 class="section-title">${title}</h2>
      <div class="section-content">
        <div class="skills-container" style="
          display: flex;
          flex-wrap: wrap;
          gap: 5pt;
          margin: 6pt 0;
        ">${skillsHTML}</div>
      </div>
    </div>`;
  }

  renderSpecializedSkills(profile: any, fieldMappings: FieldMapping[], section: TemplateSection, customTitle?: string): string {
    const title = customTitle || 'Specialized Skills';
    const skills = profile.specialized_skills || [];
    
    if (skills.length === 0) {
      return '';
    }
    
    const skillsHTML = skills.map((skill: any) => {
      // Match the CV preview structure: skill.name and skill.proficiency
      const skillName = skill.name || '';
      const proficiency = skill.proficiency || 0;
      const displayText = `${skillName} (${proficiency}/10)`;
      
      return `<span class="skill-tag" style="
        background-color: #3b82f6;
        color: white;
        padding: 2pt 6pt;
        border-radius: 3pt;
        font-size: 0.8em;
        display: inline-block;
        margin: 2pt;
      ">${displayText}</span>`;
    }).join('');

    return `<div class="section specialized-skills-section">
      <h2 class="section-title">${title}</h2>
      <div class="section-content">
        <div class="skills-container" style="
          display: flex;
          flex-wrap: wrap;
          gap: 5pt;
          margin: 6pt 0;
        ">${skillsHTML}</div>
      </div>
    </div>`;
  }
}
