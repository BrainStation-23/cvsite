
import React from 'react';

interface FieldMapping {
  original_field_name: string;
  display_name: string;
  is_masked: boolean;
  mask_value?: string;
  field_order: number;
  visibility_rules: Record<string, any>;
}

interface TemplateSection {
  id: string;
  section_type: string;
  display_order: number;
  is_required: boolean;
  field_mapping: Record<string, any>;
  styling_config: Record<string, any>;
}

interface TechnicalSkillsSectionProps {
  profile: any;
  styles: any;
  fieldMappings: FieldMapping[];
  sectionConfig: TemplateSection;
  customTitle?: string;
}

export const TechnicalSkillsSection: React.FC<TechnicalSkillsSectionProps> = ({
  profile,
  styles,
  fieldMappings,
  sectionConfig,
  customTitle
}) => {
  const title = customTitle || 'Technical Skills';
  const skills = profile?.technical_skills || [];
  const maxSkillsCount = sectionConfig?.styling_config?.max_skills_count || 10;
  
  // Access colors from layout config
  const accentColor = styles?.layoutConfig?.accentColor;
  const subheadingSize = styles?.layoutConfig?.subheadingSize;
  
  // Use zone-aware section title styles (automatically adjusts color based on background)
  const sectionTitleStyles = styles?.sectionTitleStyles || {};
  
  // Log errors if style data is missing
  if (!styles) {
    console.error('TechnicalSkillsSection: No styles object provided');
    return null;
  }
  
  if (!accentColor) {
    console.error('TechnicalSkillsSection: No accentColor found in styles.layoutConfig', styles);
    return null;
  }
  
  if (!Array.isArray(skills) || skills.length === 0) {
    return null;
  }

  // Sort by priority and limit to max count
  const limitedSkills = skills
    .sort((a, b) => (a.priority || 0) - (b.priority || 0))
    .slice(0, maxSkillsCount);

  return (
    <div className="section technical-skills-section" style={{ marginBottom: '16pt' }}>
      <h2 
        className="section-title" 
        style={{ 
          fontSize: `${subheadingSize || 14}pt`,
          color: sectionTitleStyles.color || 'inherit',
          fontWeight: 'bold',
          borderBottom: `1px solid ${sectionTitleStyles.borderBottomColor || accentColor}`,
          paddingBottom: '2pt',
          marginBottom: '8pt',
          marginTop: '0'
        }}
      >
        {title}
      </h2>
      <div className="section-content">
        <div 
          className="skills-container" 
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '5pt',
            margin: '6pt 0'
          }}
        >
          {limitedSkills.map((skill: any, index: number) => (
            <span 
              key={skill.id || index}
              className="skill-tag"
              style={{
                backgroundColor: accentColor,
                color: 'white',
                padding: '2pt 6pt',
                borderRadius: '3pt',
                fontSize: '0.8em',
                display: 'inline-block',
                margin: '2pt'
              }}
            >
              {skill.name} ({skill.proficiency}/10)
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
