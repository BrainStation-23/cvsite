
import React from 'react';

interface GeneralInfoSectionProps {
  profile: any;
  styles: any;
}

export const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({ profile, styles }) => (
  <div style={styles.headerStyles}>
    <h1 style={styles.nameStyles}>
      {profile.first_name} {profile.last_name}
    </h1>
    <p style={styles.titleStyles}>
      {profile.employee_id && `Employee ID: ${profile.employee_id}`}
    </p>
    {profile.biography && (
      <p style={{ marginTop: '10pt', fontSize: '0.9em', fontStyle: 'italic' }}>
        {profile.biography}
      </p>
    )}
  </div>
);
