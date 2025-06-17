
import React from 'react';

interface FieldMapping {
  original_field_name: string;
  display_name: string;
  is_masked: boolean;
  mask_value?: string;
  field_order: number;
  visibility_rules: Record<string, any>;
  section_type: string;
}

export const ProjectResponsibilityRenderer = (
  project: any,
  index: number,
  fieldMappings: FieldMapping[],
  styles: any,
  applyMasking: (value: any, fieldName: string) => any
) => {
  console.log(`ProjectResponsibilityRenderer called for project ${index}:`, {
    hasResponsibility: !!project.responsibility,
    responsibilityValue: project.responsibility,
    projectKeys: Object.keys(project)
  });

  const responsibility = applyMasking(project.responsibility, 'responsibility');
  
  if (!responsibility) return null;

  return (
    <div key={`responsibility-${index}`} style={{ marginTop: '8pt' }}>
      <h5 style={{ 
        fontSize: '0.9em',
        fontWeight: 'bold',
        margin: '0 0 4pt 0',
        color: '#374151'
      }}>
        Responsibility
      </h5>
      <div 
        style={{
          ...styles.fieldStyles,
          fontSize: '0.9em',
          lineHeight: '1.4',
          textAlign: 'justify'
        }}
        dangerouslySetInnerHTML={{ __html: responsibility }}
      />
    </div>
  );
};
