
import React, { useState } from 'react';
import { CVTemplate } from '@/types/cv-templates';
import { createCVStyles } from './cv-preview-styles';
import { PageDistributor } from './PageDistributor';
import { useTemplateConfiguration } from '@/hooks/use-template-configuration';
import { useToast } from '@/hooks/use-toast';

interface CVPreviewProps {
  template: CVTemplate;
  profile: any;
}

const CVPreview: React.FC<CVPreviewProps> = ({ template, profile }) => {
  const { sections, fieldMappings, isLoading } = useTemplateConfiguration(template.id);
  const [overflowWarning, setOverflowWarning] = useState<string | null>(null);
  const { toast } = useToast();
  const styles = createCVStyles(template);

  const handleOverflow = (overflowInfo: { requiredPages: number; overflowHeight: number }) => {
    const warningMessage = `Content overflow detected! The current content requires ${overflowInfo.requiredPages} pages but template is configured for ${template.pages_count} pages. Consider reducing content or increasing page count.`;
    
    setOverflowWarning(warningMessage);
    
    toast({
      title: "Content Overflow Warning",
      description: `Content needs ${overflowInfo.requiredPages} pages but template allows ${template.pages_count}`,
      variant: "destructive"
    });
  };

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
      {overflowWarning && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '12px',
          margin: '0 0 20px 0',
          width: '210mm',
          color: '#991b1b',
          fontSize: '14px'
        }}>
          <strong>⚠️ Layout Warning:</strong><br />
          {overflowWarning}
        </div>
      )}
      
      <PageDistributor
        sections={sections}
        fieldMappings={fieldMappings}
        profile={profile}
        styles={styles}
        totalPages={template.pages_count}
        onOverflow={handleOverflow}
      />
    </div>
  );
};

export default CVPreview;
