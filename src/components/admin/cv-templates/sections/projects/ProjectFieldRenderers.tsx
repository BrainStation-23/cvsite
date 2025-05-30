
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

// Helper function to format date
const formatDate = (dateString: string | Date) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  } catch {
    return dateString.toString();
  }
};

export const ProjectFieldRenderers = {
  name: (project: any, index: number, fieldMappings: FieldMapping[], styles: any, applyMasking: (value: any, fieldName: string) => any) => {
    const maskedValue = applyMasking(project.name, 'name');
    return (
      <FieldProcessor
        key="name"
        fieldName="name"
        value={maskedValue}
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
    );
  },

  role: (project: any, index: number, fieldMappings: FieldMapping[], styles: any, applyMasking: (value: any, fieldName: string) => any) => {
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
  },

  start_date: (project: any, index: number, fieldMappings: FieldMapping[], styles: any, applyMasking: (value: any, fieldName: string) => any) => {
    const formattedDate = formatDate(project.start_date);
    const maskedValue = applyMasking(formattedDate, 'start_date');
    return (
      <FieldProcessor
        key="start_date"
        fieldName="start_date"
        value={maskedValue}
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
    );
  },

  end_date: (project: any, index: number, fieldMappings: FieldMapping[], styles: any, applyMasking: (value: any, fieldName: string) => any) => {
    const dateValue = project.is_current ? 'Present' : formatDate(project.end_date);
    const maskedValue = applyMasking(dateValue, 'end_date');
    return (
      <FieldProcessor
        key="end_date"
        fieldName="end_date"
        value={maskedValue}
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
    );
  },

  date_range: (project: any, index: number, fieldMappings: FieldMapping[], styles: any, applyMasking: (value: any, fieldName: string) => any) => {
    const startDate = formatDate(project.start_date);
    const endDate = project.is_current ? 'Present' : formatDate(project.end_date);
    const dateRange = `${startDate} - ${endDate}`;
    const maskedValue = applyMasking(dateRange, 'date_range');
    return (
      <FieldProcessor
        key="date_range"
        fieldName="date_range"
        value={maskedValue}
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
    );
  },

  description: (project: any, index: number, fieldMappings: FieldMapping[], styles: any, applyMasking: (value: any, fieldName: string) => any) => {
    const maskedValue = applyMasking(project.description, 'description');
    return (
      <FieldProcessor
        key="description"
        fieldName="description"
        value={maskedValue}
        fieldMappings={fieldMappings}
        sectionType="projects"
      >
        {(processedValue, displayName, shouldShow) => (
          shouldShow && processedValue && (
            <div 
              style={{ 
                marginTop: '4pt', 
                fontSize: '0.9em',
                lineHeight: '1.4',
                textAlign: 'justify'
              }}
              dangerouslySetInnerHTML={{ __html: processedValue }}
            />
          )
        )}
      </FieldProcessor>
    );
  },

  technologies_used: (project: any, index: number, fieldMappings: FieldMapping[], styles: any, applyMasking: (value: any, fieldName: string) => any) => {
    // Apply masking to each technology individually
    const maskedTechnologies = project.technologies_used?.map((tech: string) => 
      applyMasking(tech, 'technologies_used')
    );
    
    return (
      <FieldProcessor
        key="technologies_used"
        fieldName="technologies_used"
        value={maskedTechnologies}
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
    );
  },

  url: (project: any, index: number, fieldMappings: FieldMapping[], styles: any, applyMasking: (value: any, fieldName: string) => any) => {
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
  }
};
