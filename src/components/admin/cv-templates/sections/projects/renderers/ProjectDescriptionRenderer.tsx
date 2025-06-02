
import React from 'react';
import { FieldProcessor } from '../../../FieldProcessor';

interface FieldMapping {
  original_field_name: string;
  display_name: string;
  is_masked: boolean;
  mask_value?: string;
  field_order: number;
  visibility_rules: Record<string, any>;
  section_type: string;
}

export const ProjectDescriptionRenderer = (
  project: any, 
  index: number, 
  fieldMappings: FieldMapping[], 
  styles: any, 
  applyMasking: (value: any, fieldName: string) => any
) => {
  const maskedValue = applyMasking(project.description, 'description');
  return (
    <FieldProcessor
      key="description"
      fieldName="description"
      value={maskedValue}
      fieldMappings={fieldMappings}
      sectionType="projects"
    >
      {(processedValue, displayName, shouldShow) => (
        shouldShow && processedValue && (
          <div 
            style={{ 
              marginTop: '4pt', 
              fontSize: '0.9em',
              lineHeight: '1.4',
              textAlign: 'justify'
            }}
            dangerouslySetInnerHTML={{ __html: processedValue }}
          />
        )
      )}
    </FieldProcessor>
  );
};
