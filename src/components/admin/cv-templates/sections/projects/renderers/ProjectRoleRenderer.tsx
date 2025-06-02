
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

export const ProjectRoleRenderer = (
  project: any, 
  index: number, 
  fieldMappings: FieldMapping[], 
  styles: any, 
  applyMasking: (value: any, fieldName: string) => any
) => {
  const maskedValue = applyMasking(project.role, 'role');
  return (
    <FieldProcessor
      key="role"
      fieldName="role"
      value={maskedValue}
      fieldMappings={fieldMappings}
      sectionType="projects"
    >
      {(processedValue, displayName, shouldShow) => (
        shouldShow && processedValue && (
          <span style={{ fontSize: '0.85em', color: '#666', fontWeight: 'bold' }}>
            {processedValue}
          </span>
        )
      )}
    </FieldProcessor>
  );
};
