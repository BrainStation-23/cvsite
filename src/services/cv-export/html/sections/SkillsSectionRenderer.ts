
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
  renderTechnicalSkills(profile: any, fieldMappings: FieldMapping[], section: TemplateSection, customTitle?: string, styles?: any): string {
    console.log('Skills Section Renderer - Technical Skills - Profile data:', {
      technicalSkills: profile?.technical_skills,
      technicalSkillsType: typeof profile?.technical_skills,
      technicalSkillsArray: Array.isArray(profile?.technical_skills),
      technicalSkillsLength: Array.isArray(profile?.technical_skills) ? profile.technical_skills.length : 'not array'
    });

    const title = customTitle || 'Technical Skills';
    const skills = profile?.technical_skills || [];
    const maxSkillsCount = section?.styling_config?.max_skills_count || 10;
    
    // Access colors from layout config
    const accentColor = styles?.layoutConfig?.accentColor;
    
    // Log errors if style data is missing
    if (!styles) {
      console.error('SkillsSectionRenderer - Technical Skills: No styles object provided');
      return '';
    }
    
    if (!accentColor) {
      console.error('SkillsSectionRenderer - Technical Skills: No accentColor found in styles.layoutConfig', styles);
      return '';
    }
    
    console.log('Skills Section Renderer - Technical Skills processed:', {
      skillsCount: skills.length,
      maxSkillsCount: maxSkillsCount,
      skills: skills,
      accentColor: accentColor
    });
    
    if (!Array.isArray(skills) || skills.length === 0) {
      console.log('Skills Section Renderer - Technical Skills - No valid skills data, returning empty');
      return '';
    }
    
    // Sort by priority and limit to max count
    const limitedSkills = skills
      .sort((a: any, b: any) => (a.priority || 0) - (b.priority || 0))
      .slice(0, maxSkillsCount);

    const skillsHTML = limitedSkills.map((skill: any) => {
      console.log('Skills Section Renderer - Processing technical skill:', skill);
      const skillName = skill?.name || '';
      const proficiency = skill?.proficiency || 0;
      const displayText = `${skillName} (${proficiency}/10)`;
      
      return `<span class="skill-tag" style="
        background-color: ${accentColor};
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

  renderSpecializedSkills(profile: any, fieldMappings: FieldMapping[], section: TemplateSection, customTitle?: string, styles?: any): string {
    console.log('Skills Section Renderer - Specialized Skills - Profile data:', {
      specializedSkills: profile?.specialized_skills,
      specializedSkillsType: typeof profile?.specialized_skills,
      specializedSkillsArray: Array.isArray(profile?.specialized_skills),
      specializedSkillsLength: Array.isArray(profile?.specialized_skills) ? profile.specialized_skills.length : 'not array'
    });

    const title = customTitle || 'Specialized Skills';
    const skills = profile?.specialized_skills || [];
    const maxSkillsCount = section?.styling_config?.max_skills_count || 10;
    
    // Access colors from layout config
    const accentColor = styles?.layoutConfig?.accentColor;
    
    // Log errors if style data is missing
    if (!styles) {
      console.error('SkillsSectionRenderer - Specialized Skills: No styles object provided');
      return '';
    }
    
    if (!accentColor) {
      console.error('SkillsSectionRenderer - Specialized Skills: No accentColor found in styles.layoutConfig', styles);
      return '';
    }
    
    console.log('Skills Section Renderer - Specialized Skills processed:', {
      skillsCount: skills.length,
      maxSkillsCount: maxSkillsCount,
      skills: skills,
      accentColor: accentColor
    });
    
    if (!Array.isArray(skills) || skills.length === 0) {
      console.log('Skills Section Renderer - Specialized Skills - No valid skills data, returning empty');
      return '';
    }
    
    // Sort by priority and limit to max count
    const limitedSkills = skills
      .sort((a: any, b: any) => (a.priority || 0) - (b.priority || 0))
      .slice(0, maxSkillsCount);

    const skillsHTML = limitedSkills.map((skill: any) => {
      console.log('Skills Section Renderer - Processing specialized skill:', skill);
      const skillName = skill?.name || '';
      const proficiency = skill?.proficiency || 0;
      const displayText = `${skillName} (${proficiency}/10)`;
      
      return `<span class="skill-tag" style="
        background-color: ${accentColor};
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
