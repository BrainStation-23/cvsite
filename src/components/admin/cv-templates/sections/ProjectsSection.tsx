
import React from 'react';
import { FieldProcessor } from '../FieldProcessor';

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

  // Define all possible fields with their render functions
  const fieldRenderers = {
    name: (project: any, index: number) => (
      <FieldProcessor
        key="name"
        fieldName="name"
        value={project.name}
        fieldMappings={sortedFieldMappings}
        sectionType="projects"
      >
        {(processedValue, displayName, shouldShow) => (
          shouldShow && processedValue && (
            <div style={styles.itemTitleStyles}>{processedValue}</div>
          )
        )}
      </FieldProcessor>
    ),
    role: (project: any, index: number) => (
      <FieldProcessor
        key="role"
        fieldName="role"
        value={project.role}
        fieldMappings={sortedFieldMappings}
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
    ),
    start_date: (project: any, index: number) => (
      <FieldProcessor
        key="start_date"
        fieldName="start_date"
        value={project.start_date}
        fieldMappings={sortedFieldMappings}
        sectionType="projects"
      >
        {(processedValue, displayName, shouldShow) => (
          shouldShow && processedValue && (
            <span style={{ fontSize: '0.85em', color: '#666', fontStyle: 'italic' }}>
              {processedValue}
            </span>
          )
        )}
      </FieldProcessor>
    ),
    end_date: (project: any, index: number) => (
      <FieldProcessor
        key="end_date"
        fieldName="end_date"
        value={project.is_current ? 'Present' : project.end_date}
        fieldMappings={sortedFieldMappings}
        sectionType="projects"
      >
        {(processedValue, displayName, shouldShow) => (
          shouldShow && processedValue && (
            <span style={{ fontSize: '0.85em', color: '#666', fontStyle: 'italic' }}>
              {processedValue}
            </span>
          )
        )}
      </FieldProcessor>
    ),
    date_range: (project: any, index: number) => (
      <FieldProcessor
        key="date_range"
        fieldName="date_range"
        value={`${project.start_date || ''} - ${project.is_current ? 'Present' : (project.end_date || '')}`}
        fieldMappings={sortedFieldMappings}
        sectionType="projects"
      >
        {(processedValue, displayName, shouldShow) => (
          shouldShow && (
            <div style={{ 
              fontSize: '0.85em', 
              color: '#666',
              marginBottom: '6pt',
              fontStyle: 'italic'
            }}>
              {processedValue}
            </div>
          )
        )}
      </FieldProcessor>
    ),
    description: (project: any, index: number) => (
      <FieldProcessor
        key="description"
        fieldName="description"
        value={project.description}
        fieldMappings={sortedFieldMappings}
        sectionType="projects"
      >
        {(processedValue, displayName, shouldShow) => (
          shouldShow && processedValue && (
            <div style={{ 
              marginTop: '4pt', 
              fontSize: '0.9em',
              lineHeight: '1.4',
              textAlign: 'justify'
            }}>
              {processedValue}
            </div>
          )
        )}
      </FieldProcessor>
    ),
    technologies_used: (project: any, index: number) => (
      <FieldProcessor
        key="technologies_used"
        fieldName="technologies_used"
        value={project.technologies_used}
        fieldMappings={sortedFieldMappings}
        sectionType="projects"
      >
        {(processedValue, displayName, shouldShow) => (
          shouldShow && processedValue && processedValue.length > 0 && (
            <div style={{ marginTop: '5pt' }}>
              <div style={styles.skillsContainerStyles}>
                {processedValue.map((tech: string, techIndex: number) => (
                  <span key={techIndex} style={{ ...styles.skillStyles, backgroundColor: '#10b981' }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )
        )}
      </FieldProcessor>
    )
  };

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
      {sortedProjects.map((project: any, index: number) => {
        // Get the ordered fields based on field mappings
        const orderedFields = sortedFieldMappings
          .filter(mapping => fieldRenderers[mapping.original_field_name as keyof typeof fieldRenderers])
          .sort((a, b) => a.field_order - b.field_order)
          .map(mapping => mapping.original_field_name);

        // If no field mappings exist, use default order
        const fieldsToRender = orderedFields.length > 0 ? orderedFields : [
          'name',
          'role', 
          'date_range',
          'description',
          'technologies_used'
        ];

        return (
          <div key={index} style={styles.itemStyles}>
            {fieldsToRender.map((fieldName) => {
              const renderer = fieldRenderers[fieldName as keyof typeof fieldRenderers];
              return renderer ? renderer(project, index) : null;
            })}
          </div>
        );
      })}
    </div>
  );
};
