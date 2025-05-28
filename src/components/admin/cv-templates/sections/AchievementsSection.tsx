
import React from 'react';

interface AchievementsSectionProps {
  profile: any;
  styles: any;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ profile, styles }) => {
  if (!profile.achievements || profile.achievements.length === 0) return null;
  
  return (
    <div style={styles.sectionStyles}>
      <h2 style={styles.sectionTitleStyles}>Achievements</h2>
      {profile.achievements.map((achievement: any, index: number) => (
        <div key={index} style={styles.itemStyles}>
          <div style={styles.itemTitleStyles}>{achievement.title}</div>
          <div style={styles.itemSubtitleStyles}>{achievement.date}</div>
          {achievement.description && (
            <p style={{ marginTop: '3pt', fontSize: '0.9em' }}>{achievement.description}</p>
          )}
        </div>
      ))}
    </div>
  );
};
