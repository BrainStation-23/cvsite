
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

export const ProjectUrlRenderer = (
  project: any, 
  index: number, 
  fieldMappings: FieldMapping[], 
  styles: any, 
  applyMasking: (value: any, fieldName: string) => any
) => {
  const maskedValue = applyMasking(project.url, 'url');
  return (
    <FieldProcessor
      key="url"
      fieldName="url"
      value={maskedValue}
      fieldMappings={fieldMappings}
      sectionType="projects"
    >
      {(processedValue, displayName, shouldShow) => (
        shouldShow && processedValue && (
          <div style={{ 
            marginTop: '4pt', 
            fontSize: '0.85em',
            color: '#0066cc'
          }}>
            <strong>URL:</strong> {processedValue}
          </div>
        )
      )}
    </FieldProcessor>
  );
};
