
import React from 'react';
import { CVTemplate } from '@/types/cv-templates';
import { createCVStyles } from './cv-preview-styles';
import { CVPageRenderer } from './CVPageRenderer';
import { useTemplateConfiguration } from '@/hooks/use-template-configuration';

interface CVPreviewProps {
  template: CVTemplate;
  profile: any;
}

const CVPreview: React.FC<CVPreviewProps> = ({ template, profile }) => {
  const { sections, fieldMappings, isLoading } = useTemplateConfiguration(template.id);
  const styles = createCVStyles(template);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontFamily: 'Arial, sans-serif'
      }}>
        Loading template configuration...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'fit-content' }}>
      {Array.from({ length: template.pages_count }, (_, index) => (
        <CVPageRenderer
          key={index + 1}
          pageNumber={index + 1}
          totalPages={template.pages_count}
          profile={profile}
          styles={styles}
          sections={sections}
          fieldMappings={fieldMappings}
        />
      ))}
    </div>
  );
};

export default CVPreview;
