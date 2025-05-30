
import React from 'react';
import { FieldProcessor } from '../../FieldProcessor';

interface FieldMapping {
  original_field_name: string;
  display_name: string;
  is_masked: boolean;
  mask_value?: string;
  field_order: number;
  visibility_rules: Record<string, any>;
  section_type: string;
}

export const ProjectFieldRenderers = {
  name: (project: any, index: number, fieldMappings: FieldMapping[], styles: any) => (
    <FieldProcessor
      key="name"
      fieldName="name"
      value={project.name}
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
  ),

  role: (project: any, index: number, fieldMappings: FieldMapping[], styles: any) => (
    <FieldProcessor
      key="role"
      fieldName="role"
      value={project.role}
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
  ),

  start_date: (project: any, index: number, fieldMappings: FieldMapping[], styles: any) => (
    <FieldProcessor
      key="start_date"
      fieldName="start_date"
      value={project.start_date}
      fieldMappings={fieldMappings}
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

  end_date: (project: any, index: number, fieldMappings: FieldMapping[], styles: any) => (
    <FieldProcessor
      key="end_date"
      fieldName="end_date"
      value={project.is_current ? 'Present' : project.end_date}
      fieldMappings={fieldMappings}
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

  date_range: (project: any, index: number, fieldMappings: FieldMapping[], styles: any) => (
    <FieldProcessor
      key="date_range"
      fieldName="date_range"
      value={`${project.start_date || ''} - ${project.is_current ? 'Present' : (project.end_date || '')}`}
      fieldMappings={fieldMappings}
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

  description: (project: any, index: number, fieldMappings: FieldMapping[], styles: any) => (
    <FieldProcessor
      key="description"
      fieldName="description"
      value={project.description}
      fieldMappings={fieldMappings}
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

  technologies_used: (project: any, index: number, fieldMappings: FieldMapping[], styles: any) => (
    <FieldProcessor
      key="technologies_used"
      fieldName="technologies_used"
      value={project.technologies_used}
      fieldMappings={fieldMappings}
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
  ),

  url: (project: any, index: number, fieldMappings: FieldMapping[], styles: any) => (
    <FieldProcessor
      key="url"
      fieldName="url"
      value={project.url}
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
  )
};
