
import React from 'react';

interface Reference {
  id: string;
  name: string;
  designation: string;
  company: string;
  email?: string;
  phone?: string;
}

interface ReferencesSectionProps {
  profile: any;
  styles: any;
  fieldMappings?: any[];
  sectionConfig?: any;
  customTitle?: string;
}

export const ReferencesSection: React.FC<ReferencesSectionProps> = ({
  profile,
  styles,
  fieldMappings = [],
  sectionConfig,
  customTitle
}) => {
  // Get selected references from the section config
  const selectedReferenceIds = sectionConfig?.styling_config?.selected_references || [];
  const selectedReferences = profile.references?.filter((ref: Reference) => 
    selectedReferenceIds.includes(ref.id)
  ) || [];

  if (selectedReferences.length === 0) {
    return null;
  }

  const sectionTitle = customTitle || 'References';

  return (
    <div style={{ marginBottom: styles?.spacing?.sectionMargin || '16px' }}>
      <h3 style={{
        fontSize: styles?.typography?.sectionTitleSize || '18px',
        fontWeight: styles?.typography?.sectionTitleWeight || 'bold',
        color: styles?.colors?.primary || '#000',
        marginBottom: styles?.spacing?.titleMargin || '12px',
        borderBottom: `2px solid ${styles?.colors?.primary || '#000'}`,
        paddingBottom: '4px'
      }}>
        {sectionTitle}
      </h3>
      
      <div style={{ 
        display: 'grid', 
        gap: styles?.spacing?.itemMargin || '12px',
        gridTemplateColumns: sectionConfig?.styling_config?.display_style === 'compact' 
          ? 'repeat(auto-fit, minmax(250px, 1fr))' 
          : '1fr'
      }}>
        {selectedReferences.map((reference: Reference) => (
          <div key={reference.id} style={{
            padding: styles?.spacing?.itemPadding || '8px',
            border: sectionConfig?.styling_config?.display_style === 'detailed' 
              ? `1px solid ${styles?.colors?.border || '#e0e0e0'}` 
              : 'none',
            borderRadius: '4px'
          }}>
            <div style={{
              fontSize: styles?.typography?.bodySize || '14px',
              fontWeight: 'bold',
              color: styles?.colors?.text || '#000',
              marginBottom: '4px'
            }}>
              {reference.name}
            </div>
            
            <div style={{
              fontSize: styles?.typography?.bodySize || '14px',
              color: styles?.colors?.secondary || '#666',
              marginBottom: '2px'
            }}>
              {reference.designation}
            </div>
            
            <div style={{
              fontSize: styles?.typography?.bodySize || '14px',
              color: styles?.colors?.secondary || '#666',
              marginBottom: '2px'
            }}>
              {reference.company}
            </div>
            
            {reference.email && (
              <div style={{
                fontSize: styles?.typography?.captionSize || '12px',
                color: styles?.colors?.secondary || '#666',
                marginBottom: '2px'
              }}>
                Email: {reference.email}
              </div>
            )}
            
            {reference.phone && (
              <div style={{
                fontSize: styles?.typography?.captionSize || '12px',
                color: styles?.colors?.secondary || '#666'
              }}>
                Phone: {reference.phone}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
