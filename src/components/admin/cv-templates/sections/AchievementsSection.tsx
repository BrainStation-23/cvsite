
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

interface AchievementsSectionProps {
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

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ 
  profile, 
  styles, 
  fieldMappings = [],
  sectionConfig,
  customTitle
}) => {
  if (!profile.achievements || profile.achievements.length === 0) return null;

  const defaultFields: FieldConfig[] = [
    { field: 'title', label: 'Title', order: 1, enabled: true, masked: false },
    { field: 'date', label: 'Date', order: 2, enabled: true, masked: false },
    { field: 'description', label: 'Description', order: 3, enabled: true, masked: false }
  ];

  const {
    orderedFields,
    isFieldEnabled,
    applyMasking,
    sectionTitle
  } = useSectionFieldConfig({
    sectionType: 'achievements',
    fieldMappings,
    sectionConfig,
    defaultFields
  });

  // Define field renderers
  const fieldRenderers = {
    title: (achievement: any, index: number) => {
      const maskedValue = applyMasking(achievement.title, 'title');
      return (
        <FieldProcessor
          key="title"
          fieldName="title"
          value={maskedValue}
          fieldMappings={fieldMappings}
          sectionType="achievements"
        >
          {(processedValue, displayName, shouldShow) => (
            shouldShow && processedValue && (
              <div style={styles.itemTitleStyles}>{processedValue}</div>
            )
          )}
        </FieldProcessor>
      );
    },
    date: (achievement: any, index: number) => {
      const maskedValue = applyMasking(achievement.date, 'date');
      return (
        <FieldProcessor
          key="date"
          fieldName="date"
          value={maskedValue}
          fieldMappings={fieldMappings}
          sectionType="achievements"
        >
          {(processedValue, displayName, shouldShow) => (
            shouldShow && processedValue && (
              <div style={styles.itemSubtitleStyles}>{processedValue}</div>
            )
          )}
        </FieldProcessor>
      );
    },
    description: (achievement: any, index: number) => {
      const maskedValue = applyMasking(achievement.description, 'description');
      return (
        <FieldProcessor
          key="description"
          fieldName="description"
          value={maskedValue}
          fieldMappings={fieldMappings}
          sectionType="achievements"
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
      <h2 style={styles.sectionTitleStyles}>{customTitle || sectionTitle || 'Achievements'}</h2>
      {profile.achievements.map((achievement: any, index: number) => (
        <div key={index} style={styles.itemStyles}>
          {orderedFields.map((fieldConfig) => {
            const fieldName = fieldConfig.field;
            const renderer = fieldRenderers[fieldName as keyof typeof fieldRenderers];
            
            if (!renderer || !isFieldEnabled(fieldName)) return null;
            
            return renderer(achievement, index);
          })}
        </div>
      ))}
    </div>
  );
};
