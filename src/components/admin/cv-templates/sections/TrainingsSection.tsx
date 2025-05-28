
import React from 'react';

interface TrainingsSectionProps {
  profile: any;
  styles: any;
}

export const TrainingsSection: React.FC<TrainingsSectionProps> = ({ profile, styles }) => {
  if (!profile.trainings || profile.trainings.length === 0) return null;
  
  return (
    <div style={styles.sectionStyles}>
      <h2 style={styles.sectionTitleStyles}>Training & Certifications</h2>
      {profile.trainings.map((training: any, index: number) => (
        <div key={index} style={styles.itemStyles}>
          <div style={styles.itemTitleStyles}>{training.title}</div>
          <div style={styles.itemSubtitleStyles}>
            {training.provider} • {training.certification_date}
          </div>
          {training.description && (
            <p style={{ marginTop: '3pt', fontSize: '0.9em' }}>{training.description}</p>
          )}
        </div>
      ))}
    </div>
  );
};
