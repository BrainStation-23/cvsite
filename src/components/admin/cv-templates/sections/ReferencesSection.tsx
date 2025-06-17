
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
      <div
        key={fieldName}
        style={{
          ...(styles?.fieldStyles || {}),
          fontWeight: fieldName === 'name' ? 'bold' : 'normal',
          fontSize: fieldName === 'name' ? undefined : '0.9em',
          color: styles?.colors?.text,
          marginBottom: '2px',
        }}
      >
        {fieldName === 'email' && `Email: ${maskedValue}`}
        {fieldName === 'phone' && `Phone: ${maskedValue}`}
        {!['email', 'phone'].includes(fieldName) && maskedValue}
      </div>
    );
  };

  return (
    <div style={{ ...styles.sectionStyles, width: '100%', minWidth: 0 }}>
      <h2 style={styles.sectionTitleStyles}>
        {finalSectionTitle}
      </h2>
      <div
        style={{
          ...(styles?.bodyStyles || {}),
          display: 'grid',
          gap: styles?.spacing?.itemMargin || '12px',
          gridTemplateColumns:
            displayStyle === 'compact'
              ? 'repeat(auto-fit, minmax(0, 1fr))'
              : '1fr',
          width: '100%',
          minWidth: 0,
        }}
      >
        {selectedReferences.map((reference: Reference) => (
          <div
            key={reference.id}
            style={{
              ...(styles?.itemStyles || {}),
              padding: styles?.spacing?.itemPadding || '8px',
              border:
                displayStyle === 'detailed'
                  ? styles?.itemStyles?.border || `1px solid ${styles?.colors?.border || '#e0e0e0'}`
                  : 'none',
              borderRadius: '4px',
              background: styles?.itemStyles?.background,
              color: styles?.itemStyles?.color || styles?.colors?.text,
              width: '100%',
              minWidth: 0,
              boxSizing: 'border-box',
            }}
          >
            {orderedFields.map(field => (
              <div
                key={field.field}
                style={{
                  ...(styles?.fieldStyles || {}),
                  fontWeight: field.field === 'name' ? 'bold' : 'normal',
                  fontSize: field.field === 'name' ? undefined : '0.9em',
                  color: styles?.colors?.text,
                  marginBottom: '2px',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                }}
              >
                {renderFieldValue(reference, field.field)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
