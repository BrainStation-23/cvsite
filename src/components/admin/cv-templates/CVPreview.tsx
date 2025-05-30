import React, { useState, useEffect } from 'react';
import { CVTemplate } from '@/types/cv-templates';
import { createCVStyles } from './cv-preview-styles';
import { PageDistributor } from './PageDistributor';
import { useTemplateConfiguration } from '@/hooks/templates/use-template-configuration';
import { useToast } from '@/hooks/ui/use-toast';

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

  // Show information about sections configuration
  const sectionsCount = sections?.length || 0;
  const hasProfile = profile && Object.keys(profile).length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'fit-content' }}>
      <div style={{
        backgroundColor: sectionsCount === 0 ? '#fef3c7' : '#f3f4f6',
        border: `1px solid ${sectionsCount === 0 ? '#f59e0b' : '#d1d5db'}`,
        borderRadius: '8px',
        padding: '12px',
        margin: '0 0 20px 0',
        width: '210mm',
        color: sectionsCount === 0 ? '#92400e' : '#374151',
        fontSize: '14px',
        textAlign: 'center'
      }}>
        {sectionsCount === 0 ? (
          <div>
            <strong>⚠️ No sections configured</strong>
            <br />
            <span style={{ fontSize: '12px' }}>
              Add sections in the Template Inspector → Sections tab to see CV content
            </span>
          </div>
        ) : (
          <div>
            <strong>📄 Pages:</strong> {currentPageCount} page{currentPageCount > 1 ? 's' : ''} | 
            <strong> Sections:</strong> {sectionsCount} configured
            {!hasProfile && (
              <span style={{ color: '#ef4444', marginLeft: '8px' }}>
                | No profile selected
              </span>
            )}
          </div>
        )}
      </div>
      
      <PageDistributor
        key={previewKey}
        sections={sections || []}
        fieldMappings={fieldMappings || []}
        profile={profile}
        styles={styles}
        onPagesCalculated={handlePagesCalculated}
        layoutConfig={template.layout_config}
      />
    </div>
  );
};

export default CVPreview;
