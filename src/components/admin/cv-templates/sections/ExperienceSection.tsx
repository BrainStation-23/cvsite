
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

interface ExperienceSectionProps {
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

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ 
  profile, 
  styles, 
  fieldMappings = [],
  sectionConfig,
  customTitle
}) => {
  if (!profile.experiences || profile.experiences.length === 0) return null;

  const defaultFields: FieldConfig[] = [
    { field: 'designation', label: 'Designation', order: 1, enabled: true, masked: false },
    { field: 'company_name', label: 'Company', order: 2, enabled: true, masked: false },
    { field: 'date_range', label: 'Date Range', order: 3, enabled: true, masked: false },
    { field: 'description', label: 'Description', order: 4, enabled: true, masked: false }
  ];

  const {
    orderedFields,
    isFieldEnabled,
    applyMasking,
    sectionTitle
  } = useSectionFieldConfig({
    sectionType: 'experience',
    fieldMappings,
    sectionConfig,
    defaultFields
  });

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
    } catch {
      return dateString;
    }
  };

  // Define field renderers
  const fieldRenderers = {
    company_name: (exp: any, index: number) => {
      const maskedValue = applyMasking(exp.company_name, 'company_name');
      return (
        <FieldProcessor
          key="company_name"
          fieldName="company_name"
          value={maskedValue}
          fieldMappings={fieldMappings}
          sectionType="experience"
        >
          {(processedValue, displayName, shouldShow) => (
            shouldShow && processedValue && (
              <div style={{ 
                ...styles.itemSubtitleStyles, 
                fontWeight: 'bold',
                marginBottom: '2pt'
              }}>
                {processedValue}
              </div>
            )
          )}
        </FieldProcessor>
      );
    },
    designation: (exp: any, index: number) => {
      const maskedValue = applyMasking(exp.designation, 'designation');
      return (
        <FieldProcessor
          key="designation"
          fieldName="designation"
          value={maskedValue}
          fieldMappings={fieldMappings}
          sectionType="experience"
        >
          {(processedValue, displayName, shouldShow) => (
            shouldShow && processedValue && (
              <div style={styles.itemTitleStyles}>{processedValue}</div>
            )
          )}
        </FieldProcessor>
      );
    },
    date_range: (exp: any, index: number) => {
      const dateRange = `${formatDate(exp.start_date)} - ${exp.is_current ? 'Present' : formatDate(exp.end_date)}`;
      const maskedValue = applyMasking(dateRange, 'date_range');
      return (
        <FieldProcessor
          key="date_range"
          fieldName="date_range"
          value={maskedValue}
          fieldMappings={fieldMappings}
          sectionType="experience"
        >
          {(processedValue, displayName, shouldShow) => (
            shouldShow && (
              <div style={{ 
                fontSize: '0.85em', 
                color: '#666',
                marginBottom: '6pt',
                fontStyle: 'italic'
              }}>
                {processedValue}
              </div>
            )
          )}
        </FieldProcessor>
      );
    },
    description: (exp: any, index: number) => {
      const maskedValue = applyMasking(exp.description, 'description');
      return (
        <FieldProcessor
          key="description"
          fieldName="description"
          value={maskedValue}
          fieldMappings={fieldMappings}
          sectionType="experience"
        >
          {(processedValue, displayName, shouldShow) => (
            shouldShow && processedValue && (
              <div style={{ 
                marginTop: '4pt', 
                fontSize: '0.9em',
                lineHeight: '1.4',
                textAlign: 'justify'
              }}>
                {processedValue}
              </div>
            )
          )}
        </FieldProcessor>
      );
    }
  };

  return (
    <div style={styles.sectionStyles}>
      <h2 style={styles.sectionTitleStyles}>{customTitle || sectionTitle || 'Work Experience'}</h2>
      {profile.experiences.map((exp: any, index: number) => (
        <div key={index} style={styles.itemStyles}>
          {orderedFields.map((fieldConfig) => {
            const fieldName = fieldConfig.field;
            const renderer = fieldRenderers[fieldName as keyof typeof fieldRenderers];
            
            if (!renderer || !isFieldEnabled(fieldName)) return null;
            
            return renderer(exp, index);
          })}
        </div>
      ))}
    </div>
  );
};
