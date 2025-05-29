
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

interface ExperienceSectionProps {
  profile: any;
  styles: any;
  fieldMappings?: FieldMapping[];
  sectionConfig?: any;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ 
  profile, 
  styles, 
  fieldMappings = [],
  sectionConfig 
}) => {
  if (!profile.experiences || profile.experiences.length === 0) return null;
  
  // Get section title from field mappings or use default
  const sectionTitleMapping = fieldMappings.find(
    mapping => mapping.original_field_name === 'section_title' && mapping.section_type === 'experience'
  );
  const sectionTitle = sectionTitleMapping?.display_name || 'Work Experience';

  // Sort field mappings by field_order for consistent display
  const sortedFieldMappings = [...fieldMappings].sort((a, b) => a.field_order - b.field_order);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
    } catch {
      return dateString;
    }
  };

  // Define all possible fields with their render functions
  const fieldRenderers = {
    company_name: (exp: any, index: number) => (
      <FieldProcessor
        key="company_name"
        fieldName="company_name"
        value={exp.company_name}
        fieldMappings={sortedFieldMappings}
        sectionType="experience"
      >
        {(processedCompany, companyDisplayName, showCompany) => (
          showCompany && processedCompany && (
            <div style={{ 
              ...styles.itemSubtitleStyles, 
              fontWeight: 'bold',
              marginBottom: '2pt'
            }}>
              {processedCompany}
            </div>
          )
        )}
      </FieldProcessor>
    ),
    designation: (exp: any, index: number) => (
      <FieldProcessor
        key="designation"
        fieldName="designation"
        value={exp.designation}
        fieldMappings={sortedFieldMappings}
        sectionType="experience"
      >
        {(processedValue, displayName, shouldShow) => (
          shouldShow && processedValue && (
            <div style={styles.itemTitleStyles}>{processedValue}</div>
          )
        )}
      </FieldProcessor>
    ),
    start_date: (exp: any, index: number) => (
      <FieldProcessor
        key="start_date"
        fieldName="start_date"
        value={formatDate(exp.start_date)}
        fieldMappings={sortedFieldMappings}
        sectionType="experience"
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
    end_date: (exp: any, index: number) => (
      <FieldProcessor
        key="end_date"
        fieldName="end_date"
        value={exp.is_current ? 'Present' : formatDate(exp.end_date)}
        fieldMappings={sortedFieldMappings}
        sectionType="experience"
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
    date_range: (exp: any, index: number) => (
      <FieldProcessor
        key="date_range"
        fieldName="date_range"
        value={`${formatDate(exp.start_date)} - ${exp.is_current ? 'Present' : formatDate(exp.end_date)}`}
        fieldMappings={sortedFieldMappings}
        sectionType="experience"
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
    is_current: (exp: any, index: number) => (
      <FieldProcessor
        key="is_current"
        fieldName="is_current"
        value={exp.is_current ? 'Current Position' : ''}
        fieldMappings={sortedFieldMappings}
        sectionType="experience"
      >
        {(processedValue, displayName, shouldShow) => (
          shouldShow && processedValue && (
            <div style={{ 
              fontSize: '0.8em', 
              color: '#28a745',
              fontWeight: 'bold',
              marginBottom: '4pt'
            }}>
              {processedValue}
            </div>
          )
        )}
      </FieldProcessor>
    ),
    description: (exp: any, index: number) => (
      <FieldProcessor
        key="description"
        fieldName="description"
        value={exp.description}
        fieldMappings={sortedFieldMappings}
        sectionType="experience"
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
    )
  };

  return (
    <div style={styles.sectionStyles}>
      <h2 style={styles.sectionTitleStyles}>{sectionTitle}</h2>
      {profile.experiences.map((exp: any, index: number) => {
        // Get the ordered fields based on field mappings
        const orderedFields = sortedFieldMappings
          .filter(mapping => fieldRenderers[mapping.original_field_name as keyof typeof fieldRenderers])
          .sort((a, b) => a.field_order - b.field_order)
          .map(mapping => mapping.original_field_name);

        // If no field mappings exist, use default order
        const fieldsToRender = orderedFields.length > 0 ? orderedFields : [
          'designation',
          'company_name', 
          'date_range',
          'description'
        ];

        return (
          <div key={index} style={styles.itemStyles}>
            {fieldsToRender.map((fieldName) => {
              const renderer = fieldRenderers[fieldName as keyof typeof fieldRenderers];
              return renderer ? renderer(exp, index) : null;
            })}
          </div>
        );
      })}
    </div>
  );
};
