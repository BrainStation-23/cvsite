
import React from 'react';

interface TechnicalSkillsSectionProps {
  profile: any;
  styles: any;
  fieldMappings?: any[];
  sectionConfig?: any;
}

export const TechnicalSkillsSection: React.FC<TechnicalSkillsSectionProps> = ({ 
  profile, 
  styles 
}) => {
  const technicalSkills = profile?.technical_skills;
  
  if (!technicalSkills || technicalSkills.length === 0) {
    return null;
  }
  
  return (
    <div style={styles.sectionStyles}>
      <h2 style={styles.sectionTitleStyles}>Technical Skills</h2>
      <div style={styles.skillsContainerStyles}>
        {technicalSkills.map((skill: any, index: number) => (
          <span key={skill.id || index} style={styles.skillStyles}>
            {skill.name} ({skill.proficiency}/10)
          </span>
        ))}
      </div>
    </div>
  );
};
