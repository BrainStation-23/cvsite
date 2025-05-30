
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
      fields?: FieldConfig[];
    };
  };
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ 
  profile, 
  styles, 
  fieldMappings = [],
  sectionConfig 
}) => {
  if (!profile.projects || profile.projects.length === 0) return null;
  
  // Get field configurations from section config
  const fieldConfigs = sectionConfig?.styling_config?.fields || [];
  const displayStyle = sectionConfig?.styling_config?.display_style || 'default';

  // Helper function to check if a field is enabled
  const isFieldEnabled = (fieldName: string) => {
    const config = fieldConfigs.find(f => f.field === fieldName);
    return config ? config.enabled : true; // Default to enabled if no config
  };

  // Helper function to apply masking
  const applyMasking = (value: any, fieldName: string) => {
    const config = fieldConfigs.find(f => f.field === fieldName);
    if (!config?.masked || !value) return value;

    if (config.mask_value) {
      return config.mask_value;
    } else {
      // Default masking
      if (typeof value === 'string' && value.length > 3) {
        return value.substring(0, 3) + '***';
      }
      return '***';
    }
  };

  // Get section title from field mappings or use default
  const sectionTitleMapping = fieldMappings.find(
    mapping => mapping.original_field_name === 'section_title' && mapping.section_type === 'projects'
  );
  const sectionTitle = sectionTitleMapping?.display_name || 'Projects';

  // Get ordered fields based on section config, or use default order
  const getOrderedFields = (): FieldConfig[] => {
    if (fieldConfigs.length === 0) {
      // Default order if no configuration - ensure all properties match FieldConfig interface
      return [
        { field: 'name', label: 'Name', order: 1, enabled: true, masked: false },
        { field: 'role', label: 'Role', order: 2, enabled: true, masked: false },
        { field: 'date_range', label: 'Date Range', order: 3, enabled: true, masked: false },
        { field: 'description', label: 'Description', order: 4, enabled: true, masked: false },
        { field: 'technologies_used', label: 'Technologies', order: 5, enabled: true, masked: false },
        { field: 'url', label: 'URL', order: 6, enabled: true, masked: false }
      ];
    }

    // Use configuration order and filter enabled fields
    return [...fieldConfigs]
      .filter(f => f.enabled)
      .sort((a, b) => a.order - b.order);
  };

  const orderedFields = getOrderedFields();

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
          orderedFields={orderedFields}
          fieldMappings={fieldMappings}
          styles={styles}
          isFieldEnabled={isFieldEnabled}
          applyMasking={applyMasking}
        />
      ))}
    </div>
  );
};
