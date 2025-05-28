
import React from 'react';

interface EducationSectionProps {
  profile: any;
  styles: any;
}

export const EducationSection: React.FC<EducationSectionProps> = ({ profile, styles }) => {
  if (!profile.education || profile.education.length === 0) return null;
  
  return (
    <div style={styles.sectionStyles}>
      <h2 style={styles.sectionTitleStyles}>Education</h2>
      {profile.education.map((edu: any, index: number) => (
        <div key={index} style={styles.itemStyles}>
          <div style={styles.itemTitleStyles}>{edu.degree}</div>
          <div style={styles.itemSubtitleStyles}>
            {edu.university} • {edu.department} • {edu.start_date} - {edu.is_current ? 'Present' : edu.end_date}
          </div>
          {edu.gpa && (
            <p style={{ marginTop: '3pt', fontSize: '0.9em' }}>GPA: {edu.gpa}</p>
          )}
        </div>
      ))}
    </div>
  );
};
