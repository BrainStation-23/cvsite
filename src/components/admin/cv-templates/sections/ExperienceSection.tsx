
import React from 'react';

interface ExperienceSectionProps {
  profile: any;
  styles: any;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ profile, styles }) => {
  if (!profile.experiences || profile.experiences.length === 0) return null;
  
  return (
    <div style={styles.sectionStyles}>
      <h2 style={styles.sectionTitleStyles}>Work Experience</h2>
      {profile.experiences.map((exp: any, index: number) => (
        <div key={index} style={styles.itemStyles}>
          <div style={styles.itemTitleStyles}>{exp.designation}</div>
          <div style={styles.itemSubtitleStyles}>
            {exp.company_name} • {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
          </div>
          {exp.description && (
            <p style={{ marginTop: '3pt', fontSize: '0.9em' }}>{exp.description}</p>
          )}
        </div>
      ))}
    </div>
  );
};
