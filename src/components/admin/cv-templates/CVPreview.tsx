
import React, { useState, useEffect } from 'react';
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
  const { sections, fieldMappings, isLoading, refetch } = useTemplateConfiguration(template.id);
  const [currentPageCount, setCurrentPageCount] = useState(1);
  const [previewKey, setPreviewKey] = useState(0);
  const { toast } = useToast();
  const styles = createCVStyles(template);

  // Force refetch when template changes
  useEffect(() => {
    if (template.id) {
      refetch?.();
    }
  }, [template, refetch]);

  // Force re-render when sections or field mappings change
  useEffect(() => {
    setPreviewKey(prev => prev + 1);
  }, [sections, fieldMappings]);

  const handlePagesCalculated = (pageCount: number) => {
    setCurrentPageCount(pageCount);
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
      <div style={{
        backgroundColor: '#f3f4f6',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '12px',
        margin: '0 0 20px 0',
        width: '210mm',
        color: '#374151',
        fontSize: '14px',
        textAlign: 'center'
      }}>
        <strong>📄 Pages:</strong> {currentPageCount} page{currentPageCount > 1 ? 's' : ''} (automatically calculated based on content)
      </div>
      
      <PageDistributor
        key={previewKey}
        sections={sections}
        fieldMappings={fieldMappings}
        profile={profile}
        styles={styles}
        onPagesCalculated={handlePagesCalculated}
        layoutConfig={template.layout_config}
      />
    </div>
  );
};

export default CVPreview;
