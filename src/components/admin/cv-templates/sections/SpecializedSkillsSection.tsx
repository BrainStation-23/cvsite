
import React from 'react';

interface SpecializedSkillsSectionProps {
  profile: any;
  styles: any;
  fieldMappings?: any[];
  sectionConfig?: any;
}

export const SpecializedSkillsSection: React.FC<SpecializedSkillsSectionProps> = ({ 
  profile, 
  styles 
}) => {
  const specializedSkills = profile?.specialized_skills;
  
  if (!specializedSkills || specializedSkills.length === 0) {
    return null;
  }
  
  return (
    <div style={styles.sectionStyles}>
      <h2 style={styles.sectionTitleStyles}>Specialized Skills</h2>
      <div style={styles.skillsContainerStyles}>
        {specializedSkills.map((skill: any, index: number) => (
          <span key={skill.id || index} style={styles.skillStyles}>
            {skill.name} ({skill.proficiency}/10)
          </span>
        ))}
      </div>
    </div>
  );
};
