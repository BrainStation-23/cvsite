
import React from 'react';
import { useSectionFieldConfig } from '@/hooks/use-section-field-config';

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

  // Default field configuration for references
  const defaultFields = [
    { field: 'name', label: 'Name', enabled: true, masked: false, order: 1 },
    { field: 'designation', label: 'Designation', enabled: true, masked: false, order: 2 },
    { field: 'company', label: 'Company', enabled: true, masked: false, order: 3 },
    { field: 'email', label: 'Email', enabled: true, masked: false, order: 4 },
    { field: 'phone', label: 'Phone', enabled: false, masked: false, order: 5 }
  ];

  const {
    orderedFields,
    displayStyle,
    isFieldEnabled,
    applyMasking,
    sectionTitle
  } = useSectionFieldConfig({
    sectionType: 'references',
    fieldMappings,
    sectionConfig,
    defaultFields
  });

  if (selectedReferences.length === 0) {
    return null;
  }

  const finalSectionTitle = customTitle || sectionTitle || 'References';

  const renderFieldValue = (reference: Reference, fieldName: string) => {
    if (!isFieldEnabled(fieldName)) return null;
    
    const value = reference[fieldName as keyof Reference];
    if (!value) return null;
    
    const maskedValue = applyMasking(value, fieldName);
    
    return (
      <div key={fieldName} style={{
        fontSize: styles?.typography?.bodySize || '14px',
        color: fieldName === 'name' ? styles?.colors?.text || '#000' : styles?.colors?.secondary || '#666',
        marginBottom: '2px',
        fontWeight: fieldName === 'name' ? 'bold' : 'normal'
      }}>
        {fieldName === 'email' && `Email: ${maskedValue}`}
        {fieldName === 'phone' && `Phone: ${maskedValue}`}
        {!['email', 'phone'].includes(fieldName) && maskedValue}
      </div>
    );
  };

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
        {finalSectionTitle}
      </h3>
      
      <div style={{ 
        display: 'grid', 
        gap: styles?.spacing?.itemMargin || '12px',
        gridTemplateColumns: displayStyle === 'compact' 
          ? 'repeat(auto-fit, minmax(250px, 1fr))' 
          : '1fr'
      }}>
        {selectedReferences.map((reference: Reference) => (
          <div key={reference.id} style={{
            padding: styles?.spacing?.itemPadding || '8px',
            border: displayStyle === 'detailed' 
              ? `1px solid ${styles?.colors?.border || '#e0e0e0'}` 
              : 'none',
            borderRadius: '4px'
          }}>
            {orderedFields.map(field => 
              renderFieldValue(reference, field.field)
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
