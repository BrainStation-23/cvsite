
import React from 'react';

interface FieldMapping {
  original_field_name: string;
  display_name: string;
  is_masked: boolean;
  mask_value?: string;
  field_order: number;
  visibility_rules: Record<string, any>;
  section_type: string;
}

export const ProjectResponsibilityRenderer = (
  project: any,
  index: number,
  fieldMappings: FieldMapping[],
  styles: any,
  applyMasking: (value: any, fieldName: string) => any
) => {
  const responsibility = applyMasking(project.responsibility, 'responsibility');
  
  if (!responsibility) return null;

  return (
    <div 
      key={`responsibility-${index}`}
      style={{
        ...styles.fieldStyles,
        marginBottom: styles?.spacing?.fieldMargin || '8px',
        lineHeight: '1.5'
      }}
      dangerouslySetInnerHTML={{ __html: responsibility }}
    />
  );
};
