
import React from 'react';
import { CVTemplate } from '@/types/cv-templates';
import { createCVStyles } from './cv-preview-styles';
import { CVPageRenderer } from './CVPageRenderer';

interface CVPreviewProps {
  template: CVTemplate;
  profile: any;
}

const CVPreview: React.FC<CVPreviewProps> = ({ template, profile }) => {
  const styles = createCVStyles(template);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'fit-content' }}>
      {Array.from({ length: template.pages_count }, (_, index) => (
        <CVPageRenderer
          key={index + 1}
          pageNumber={index + 1}
          totalPages={template.pages_count}
          profile={profile}
          styles={styles}
        />
      ))}
    </div>
  );
};

export default CVPreview;
