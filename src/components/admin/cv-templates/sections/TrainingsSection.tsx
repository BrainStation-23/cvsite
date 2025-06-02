
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

interface TrainingsSectionProps {
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

export const TrainingsSection: React.FC<TrainingsSectionProps> = ({ 
  profile, 
  styles, 
  fieldMappings = [],
  sectionConfig,
  customTitle
}) => {
  if (!profile.trainings || profile.trainings.length === 0) return null;

  const defaultFields: FieldConfig[] = [
    { field: 'title', label: 'Title', order: 1, enabled: true, masked: false },
    { field: 'provider', label: 'Provider', order: 2, enabled: true, masked: false },
    { field: 'certification_date', label: 'Date', order: 3, enabled: true, masked: false },
    { field: 'description', label: 'Description', order: 4, enabled: true, masked: false }
  ];

  const {
    orderedFields,
    isFieldEnabled,
    applyMasking,
    sectionTitle
  } = useSectionFieldConfig({
    sectionType: 'training',
    fieldMappings,
    sectionConfig,
    defaultFields
  });

  // Define field renderers
  const fieldRenderers = {
    title: (training: any, index: number) => {
      const maskedValue = applyMasking(training.title, 'title');
      return (
        <FieldProcessor
          key="title"
          fieldName="title"
          value={maskedValue}
          fieldMappings={fieldMappings}
          sectionType="training"
        >
          {(processedValue, displayName, shouldShow) => (
            shouldShow && processedValue && (
              <div style={styles.itemTitleStyles}>{processedValue}</div>
            )
          )}
        </FieldProcessor>
      );
    },
    provider: (training: any, index: number) => {
      const maskedValue = applyMasking(training.provider, 'provider');
      return (
        <FieldProcessor
          key="provider"
          fieldName="provider"
          value={maskedValue}
          fieldMappings={fieldMappings}
          sectionType="training"
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
    certification_date: (training: any, index: number) => {
      const maskedValue = applyMasking(training.certification_date, 'certification_date');
      return (
        <FieldProcessor
          key="certification_date"
          fieldName="certification_date"
          value={maskedValue}
          fieldMappings={fieldMappings}
          sectionType="training"
        >
          {(processedValue, displayName, shouldShow) => (
            shouldShow && processedValue && (
              <span style={{ fontSize: '0.85em', color: '#666', fontStyle: 'italic' }}>
                • {processedValue}
              </span>
            )
          )}
        </FieldProcessor>
      );
    },
    description: (training: any, index: number) => {
      const maskedValue = applyMasking(training.description, 'description');
      return (
        <FieldProcessor
          key="description"
          fieldName="description"
          value={maskedValue}
          fieldMappings={fieldMappings}
          sectionType="training"
        >
          {(processedValue, displayName, shouldShow) => (
            shouldShow && processedValue && (
              <div style={{ marginTop: '3pt', fontSize: '0.9em' }}>
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
      <h2 style={styles.sectionTitleStyles}>{customTitle || sectionTitle || 'Training & Certifications'}</h2>
      {profile.trainings.map((training: any, index: number) => (
        <div key={index} style={styles.itemStyles}>
          {orderedFields.map((fieldConfig) => {
            const fieldName = fieldConfig.field;
            const renderer = fieldRenderers[fieldName as keyof typeof fieldRenderers];
            
            if (!renderer || !isFieldEnabled(fieldName)) return null;
            
            return renderer(training, index);
          })}
        </div>
      ))}
    </div>
  );
};
