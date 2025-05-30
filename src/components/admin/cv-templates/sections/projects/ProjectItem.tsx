
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

interface ProjectItemProps {
  project: any;
  index: number;
  fieldMappings: FieldMapping[];
  styles: any;
  hasFieldMappings: boolean;
}

export const ProjectItem: React.FC<ProjectItemProps> = ({
  project,
  index,
  fieldMappings,
  styles,
  hasFieldMappings
}) => {
  // Determine which fields to render
  let fieldsToRender: string[];
  
  if (hasFieldMappings) {
    // Use only enabled fields from field mappings when they exist
    const enabledFields = fieldMappings
      .filter(mapping => mapping.section_type === 'projects')
      .map(mapping => mapping.original_field_name);
      
    fieldsToRender = enabledFields.filter(fieldName => 
      ProjectFieldRenderers[fieldName as keyof typeof ProjectFieldRenderers]
    );
  } else {
    // Use default field order when no field mappings are configured
    fieldsToRender = [
      'name',
      'role', 
      'date_range',
      'description',
      'technologies_used',
      'url'
    ];
  }

  return (
    <div style={styles.itemStyles}>
      {fieldsToRender.map((fieldName) => {
        const renderer = ProjectFieldRenderers[fieldName as keyof typeof ProjectFieldRenderers];
        if (!renderer) return null;
        
        // Handle special case for technologies_used which needs styles
        if (fieldName === 'technologies_used') {
          return renderer(project, index, fieldMappings, styles);
        }
        
        return renderer(project, index, fieldMappings);
      })}
    </div>
  );
};
