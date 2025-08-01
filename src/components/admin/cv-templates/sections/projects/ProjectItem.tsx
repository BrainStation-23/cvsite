
import React from 'react';
import { ProjectDescriptionRenderer } from './renderers/ProjectDescriptionRenderer';
import { ProjectTechnologiesRenderer } from './renderers/ProjectTechnologiesRenderer';

interface FieldMapping {
  original_field_name: string;
  display_name: string;
  is_masked: boolean;
  mask_value?: string;
  field_order: number;
  visibility_rules?: Record<string, any>;
  section_type?: string;
}

interface ProjectItemProps {
  project: any;
  index: number;
  fieldMappings: FieldMapping[];
  styles: any;
  applyMasking: (value: any, fieldName: string) => any;
}

export const ProjectItem: React.FC<ProjectItemProps> = ({
  project,
  index,
  fieldMappings,
  styles,
  applyMasking
}) => {
  return (
    <div style={{ 
      marginBottom: index < (project.length - 1) ? '10pt' : '0' 
    }}>
      {ProjectDescriptionRenderer(project, fieldMappings, styles, applyMasking)}
      {ProjectTechnologiesRenderer(project, fieldMappings, styles, applyMasking)}
    </div>
  );
};
