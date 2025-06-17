
import React from 'react';
import { SegmentedBar } from './SegmentedBar';

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

interface SkillsSectionProps {
  profile: any;
  styles: any;
  fieldMappings: FieldMapping[];
  sectionConfig: TemplateSection;
  skillType: 'technical' | 'specialized';
  customTitle?: string;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  profile,
  styles,
  fieldMappings,
  sectionConfig,
  skillType,
  customTitle
}) => {
  const skills = profile?.[`${skillType}_skills`] || [];
  const title = customTitle || (skillType === 'technical' ? 'Technical Skills' : 'Specialized Skills');
  const maxSkillsCount = sectionConfig?.styling_config?.max_skills_count || 10;
  const accentColor = styles?.layoutConfig?.accentColor;
  const subheadingSize = styles?.layoutConfig?.subheadingSize;
  const sectionTitleStyles = styles?.sectionTitleStyles || {};
  if (!styles) {
    console.error('SkillsSection: No styles object provided');
    return null;
  }
  if (!accentColor) {
    console.error('SkillsSection: No accentColor found in styles.layoutConfig', styles);
    return null;
  }
  if (!Array.isArray(skills) || skills.length === 0) {
    return null;
  }
  const limitedSkills = skills
    .sort((a, b) => (a.priority || 0) - (b.priority || 0))
    .slice(0, maxSkillsCount);
  const displayStyle = sectionConfig?.styling_config?.display_style || 'default';
  return (
    <div
      className={`section ${skillType}-skills-section`}
      style={{ marginBottom: '16pt', width: '100%', minWidth: 0 }}
    >
      <h2
        className="section-title"
        style={{
          fontSize: `${subheadingSize || 14}pt`,
          color: sectionTitleStyles.color || 'inherit',
          fontWeight: 'bold',
          borderBottom: `1px solid ${sectionTitleStyles.borderBottomColor || accentColor}`,
          paddingBottom: '2pt',
          marginBottom: '8pt',
          marginTop: '0',
        }}
      >
        {title}
      </h2>
      <div className="section-content" style={{ width: '100%', minWidth: 0 }}>
        {displayStyle === 'detailed' ? (
          <div className="flex flex-col gap-3" style={{ width: '100%', minWidth: 0 }}>
            {limitedSkills.map((skill: any, index: number) => (
              <div
                key={skill.id || index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  width: '100%',
                  minWidth: 0,
                  boxSizing: 'border-box',
                }}
              >
                <span
                  style={{
                    fontWeight: 500,
                    marginBottom: 2,
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                    width: '100%',
                    minWidth: 0,
                  }}
                >
                  {skill.name}
                </span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    minWidth: 0,
                  }}
                >
                  <SegmentedBar
                    value={typeof skill.proficiency === 'number' ? skill.proficiency : 0}
                    max={10}
                    filledColor={accentColor}
                    height={12}
                  />
                  <span
                    style={{
                      minWidth: 32,
                      textAlign: 'right',
                      fontSize: '0.9em',
                      color: '#555',
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                    }}
                  >
                    {skill.proficiency}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="skills-container"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '5pt',
              margin: '6pt 0',
              width: '100%',
              minWidth: 0,
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
                  margin: '2pt',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  maxWidth: '100%',
                }}
              >
                {skill.name} ({skill.proficiency}/10)
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
