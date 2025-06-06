

import React from 'react';
import { ProjectFieldRenderers } from './ProjectFieldRenderers';

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

interface ProjectItemProps {
  project: any;
  index: number;
  orderedFields: FieldConfig[];
  fieldMappings: FieldMapping[];
  styles: any;
  isFieldEnabled: (fieldName: string) => boolean;
  applyMasking: (value: any, fieldName: string) => any;
}

export const ProjectItem: React.FC<ProjectItemProps> = ({
  project,
  index,
  orderedFields,
  fieldMappings,
  styles,
  isFieldEnabled,
  applyMasking
}) => {
  return (
    <div 
      style={{
        ...styles.itemStyles,
        pageBreakInside: 'auto', // Allow page breaks within this item if necessary
        breakInside: 'auto', // Modern CSS property
        orphans: 2, // Prevent orphaned lines
        widows: 2, // Prevent widow lines
        position: 'relative' // Ensure proper positioning context
      }}
    >
      {orderedFields.map((fieldConfig) => {
        const fieldName = fieldConfig.field;
        const renderer = ProjectFieldRenderers[fieldName as keyof typeof ProjectFieldRenderers];
        
        if (!renderer || !isFieldEnabled(fieldName)) return null;
        
        // All renderers receive: project, index, fieldMappings, styles, applyMasking
        return renderer(project, index, fieldMappings, styles, applyMasking);
      })}
    </div>
  );
};

