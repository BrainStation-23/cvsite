
import React from 'react';
import { FieldProcessor } from '../FieldProcessor';
import { useSectionFieldConfig } from '@/hooks/use-section-field-config';

interface FieldMapping {
  original_field_name: string;
  display_name: string;
  is_masked: boolean;
  mask_value?: string;
  field_order: number;
  visibility_rules: Record<string, any>;
  section_type: string;
}

interface FieldConfig {
  field: string;
  label: string;
  enabled: boolean;
  masked: boolean;
  mask_value?: string;
  order: number;
}

interface EducationSectionProps {
  profile: any;
  styles: any;
  fieldMappings?: FieldMapping[];
  sectionConfig?: {
    styling_config?: {
      display_style?: string;
      fields?: FieldConfig[];
    };
  };
  customTitle?: string;
}

export const EducationSection: React.FC<EducationSectionProps> = ({ 
  profile, 
  styles, 
  fieldMappings = [],
  sectionConfig,
  customTitle
}) => {
  if (!profile.education || profile.education.length === 0) return null;

  const defaultFields: FieldConfig[] = [
    { field: 'degree', label: 'Degree', order: 1, enabled: true, masked: false },
    { field: 'university', label: 'University', order: 2, enabled: true, masked: false },
    { field: 'department', label: 'Department', order: 3, enabled: true, masked: false },
    { field: 'date_range', label: 'Date Range', order: 4, enabled: true, masked: false },
    { field: 'gpa', label: 'GPA', order: 5, enabled: true, masked: false }
  ];

  const {
    orderedFields,
    isFieldEnabled,
    applyMasking,
    sectionTitle
  } = useSectionFieldConfig({
    sectionType: 'education',
    fieldMappings,
    sectionConfig,
    defaultFields
  });

  // Define field renderers
  const fieldRenderers = {
    degree: (edu: any, index: number) => {
      const maskedValue = applyMasking(edu.degree, 'degree');
      return (
        <FieldProcessor
          key="degree"
          fieldName="degree"
          value={maskedValue}
          fieldMappings={fieldMappings}
          sectionType="education"
        >
          {(processedValue, displayName, shouldShow) => (
            shouldShow && processedValue && (
              <div style={styles.itemTitleStyles}>{processedValue}</div>
            )
          )}
        </FieldProcessor>
      );
    },
    university: (edu: any, index: number) => {
      const maskedValue = applyMasking(edu.university, 'university');
      return (
        <FieldProcessor
          key="university"
          fieldName="university"
          value={maskedValue}
          fieldMappings={fieldMappings}
          sectionType="education"
        >
          {(processedValue, displayName, shouldShow) => (
            shouldShow && processedValue && (
              <span style={{ fontSize: '0.9em', fontWeight: 'bold' }}>
                {processedValue}
              </span>
            )
          )}
        </FieldProcessor>
      );
    },
    department: (edu: any, index: number) => {
      const maskedValue = applyMasking(edu.department, 'department');
      return (
        <FieldProcessor
          key="department"
          fieldName="department"
          value={maskedValue}
          fieldMappings={fieldMappings}
          sectionType="education"
        >
          {(processedValue, displayName, shouldShow) => (
            shouldShow && processedValue && (
              <span style={{ fontSize: '0.85em', color: '#666' }}>
                • {processedValue}
              </span>
            )
          )}
        </FieldProcessor>
      );
    },
    date_range: (edu: any, index: number) => {
      const dateRange = `${edu.start_date} - ${edu.is_current ? 'Present' : edu.end_date}`;
      const maskedValue = applyMasking(dateRange, 'date_range');
      return (
        <FieldProcessor
          key="date_range"
          fieldName="date_range"
          value={maskedValue}
          fieldMappings={fieldMappings}
          sectionType="education"
        >
          {(processedValue, displayName, shouldShow) => (
            shouldShow && (
              <div style={{ 
                fontSize: '0.85em', 
                color: '#666',
                marginBottom: '4pt',
                fontStyle: 'italic'
              }}>
                {processedValue}
              </div>
            )
          )}
        </FieldProcessor>
      );
    },
    gpa: (edu: any, index: number) => {
      const maskedValue = applyMasking(edu.gpa, 'gpa');
      return (
        <FieldProcessor
          key="gpa"
          fieldName="gpa"
          value={maskedValue}
          fieldMappings={fieldMappings}
          sectionType="education"
        >
          {(processedValue, displayName, shouldShow) => (
            shouldShow && processedValue && (
              <div style={{ marginTop: '3pt', fontSize: '0.9em' }}>
                GPA: {processedValue}
              </div>
            )
          )}
        </FieldProcessor>
      );
    }
  };

  return (
    <div style={styles.sectionStyles}>
      <h2 style={styles.sectionTitleStyles}>{customTitle || sectionTitle || 'Education'}</h2>
      {profile.education.map((edu: any, index: number) => (
        <div key={index} style={styles.itemStyles}>
          {orderedFields.map((fieldConfig) => {
            const fieldName = fieldConfig.field;
            const renderer = fieldRenderers[fieldName as keyof typeof fieldRenderers];
            
            if (!renderer || !isFieldEnabled(fieldName)) return null;
            
            return renderer(edu, index);
          })}
        </div>
      ))}
    </div>
  );
};
