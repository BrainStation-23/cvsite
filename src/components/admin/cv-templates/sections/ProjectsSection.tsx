
import React from 'react';
import { ProjectItem } from './projects/ProjectItem';

interface FieldMapping {
  original_field_name: string;
  display_name: string;
  is_masked: boolean;
  mask_value?: string;
  field_order: number;
  visibility_rules: Record<string, any>;
  section_type: string;
}

interface ProjectsSectionProps {
  profile: any;
  styles: any;
  fieldMappings?: FieldMapping[];
  sectionConfig?: any;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ 
  profile, 
  styles, 
  fieldMappings = [],
  sectionConfig 
}) => {
  if (!profile.projects || profile.projects.length === 0) return null;
  
  // Get section title from field mappings or use default
  const sectionTitleMapping = fieldMappings.find(
    mapping => mapping.original_field_name === 'section_title' && mapping.section_type === 'projects'
  );
  const sectionTitle = sectionTitleMapping?.display_name || 'Projects';

  // Sort field mappings by field_order for consistent display
  const sortedFieldMappings = [...fieldMappings].sort((a, b) => a.field_order - b.field_order);

  // Get only the fields that are enabled (have field mappings)
  const enabledFields = sortedFieldMappings
    .filter(mapping => mapping.section_type === 'projects')
    .map(mapping => mapping.original_field_name);

  // Check if we have any field mappings configured for projects section
  const hasFieldMappings = enabledFields.length > 0;

  // Sort projects by display_order, then by start_date as fallback
  const sortedProjects = [...profile.projects].sort((a, b) => {
    if (a.display_order !== undefined && b.display_order !== undefined) {
      return a.display_order - b.display_order;
    }
    return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
  });

  return (
    <div style={styles.sectionStyles}>
      <h2 style={styles.sectionTitleStyles}>{sectionTitle}</h2>
      {sortedProjects.map((project: any, index: number) => (
        <ProjectItem
          key={index}
          project={project}
          index={index}
          fieldMappings={sortedFieldMappings}
          styles={styles}
          hasFieldMappings={hasFieldMappings}
        />
      ))}
    </div>
  );
};
