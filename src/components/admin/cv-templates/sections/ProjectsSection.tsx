
import React from 'react';
import { ProjectItem } from './projects/ProjectItem';
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

interface ProjectsSectionProps {
  profile: any;
  styles: any;
  fieldMappings?: FieldMapping[];
  sectionConfig?: {
    styling_config?: {
      display_style?: string;
      projects_to_view?: number;
      fields?: FieldConfig[];
    };
  };
  customTitle?: string;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ 
  profile, 
  styles, 
  fieldMappings = [],
  sectionConfig,
  customTitle
}) => {
  if (!profile.projects || profile.projects.length === 0) return null;
  
  const defaultFields: FieldConfig[] = [
    { field: 'name', label: 'Name', order: 1, enabled: true, masked: false },
    { field: 'role', label: 'Role', order: 2, enabled: true, masked: false },
    { field: 'date_range', label: 'Date Range', order: 3, enabled: true, masked: false },
    { field: 'description', label: 'Description', order: 4, enabled: true, masked: false },
    { field: 'responsibility', label: 'Responsibility', order: 5, enabled: true, masked: false },
    { field: 'technologies_used', label: 'Technologies', order: 6, enabled: true, masked: false },
    { field: 'url', label: 'URL', order: 7, enabled: true, masked: false }
  ];

  const {
    orderedFields,
    isFieldEnabled,
    applyMasking,
    sectionTitle
  } = useSectionFieldConfig({
    sectionType: 'projects',
    fieldMappings,
    sectionConfig,
    defaultFields
  });

  // Sort projects by display_order, then by start_date as fallback
  const sortedProjects = [...profile.projects].sort((a, b) => {
    if (a.display_order !== undefined && b.display_order !== undefined) {
      return a.display_order - b.display_order;
    }
    return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
  });

  // Get the maximum number of projects to show from section config
  const maxProjects = sectionConfig?.styling_config?.projects_to_view || sortedProjects.length;
  const projectsToShow = sortedProjects.slice(0, maxProjects);

  console.log(`=== PROJECTS SECTION CONFIG DEBUG ===`);
  console.log(`Total projects: ${sortedProjects.length}`);
  console.log(`Max projects to show: ${maxProjects}`);
  console.log(`Projects to display: ${projectsToShow.length}`);
  console.log(`Section config:`, sectionConfig?.styling_config);

  return (
    <div style={styles.sectionStyles}>
      <h2 style={styles.sectionTitleStyles}>{customTitle || sectionTitle || 'Projects'}</h2>
      {projectsToShow.map((project: any, index: number) => (
        <div 
          key={index}
          style={{
            pageBreakInside: 'auto', // Allow breaking inside items if needed
            breakInside: 'auto', // CSS Grid/Flexbox version
            marginBottom: '16px'
          }}
        >
          <ProjectItem
            project={project}
            index={index}
            orderedFields={orderedFields}
            fieldMappings={fieldMappings}
            styles={styles}
            isFieldEnabled={isFieldEnabled}
            applyMasking={applyMasking}
          />
        </div>
      ))}
    </div>
  );
};
