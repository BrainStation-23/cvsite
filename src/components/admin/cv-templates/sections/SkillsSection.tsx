
import React from 'react';

interface SkillsSectionProps {
  profile: any;
  styles: any;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ profile, styles }) => {
  const hasSkills = (profile.technical_skills && profile.technical_skills.length > 0) ||
                   (profile.specialized_skills && profile.specialized_skills.length > 0);
  
  if (!hasSkills) return null;
  
  return (
    <div style={styles.sectionStyles}>
      <h2 style={styles.sectionTitleStyles}>Skills</h2>
      
      {profile.technical_skills && profile.technical_skills.length > 0 && (
        <div style={{ marginBottom: '10pt' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5pt' }}>Technical Skills</div>
          <div style={styles.skillsContainerStyles}>
            {profile.technical_skills.map((skill: any, index: number) => (
              <span key={index} style={styles.skillStyles}>
                {skill.name} ({skill.proficiency}/10)
              </span>
            ))}
          </div>
        </div>
      )}
      
      {profile.specialized_skills && profile.specialized_skills.length > 0 && (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '5pt' }}>Specialized Skills</div>
          <div style={styles.skillsContainerStyles}>
            {profile.specialized_skills.map((skill: any, index: number) => (
              <span key={index} style={styles.skillStyles}>
                {skill.name} ({skill.proficiency}/10)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
