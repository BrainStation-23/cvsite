
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

export const ProjectNameRenderer = (
  project: any, 
  index: number, 
  fieldMappings: FieldMapping[], 
  styles: any, 
  applyMasking: (value: any, fieldName: string) => any
) => {
  const maskedValue = applyMasking(project.name, 'name');
  return (
    <FieldProcessor
      key="name"
      fieldName="name"
      value={maskedValue}
      fieldMappings={fieldMappings}
      sectionType="projects"
    >
      {(processedValue, displayName, shouldShow) => (
        shouldShow && processedValue && (
          <div style={{ fontWeight: 'bold', fontSize: '1.1em', marginBottom: '4pt' }}>
            {processedValue}
          </div>
        )
      )}
    </FieldProcessor>
  );
};
