
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

  return (
    <div style={styles.sectionStyles}>
      <h2 style={styles.sectionTitleStyles}>{sectionTitle}</h2>
      {profile.experiences.map((exp: any, index: number) => (
        <div key={index} style={styles.itemStyles}>
          {/* Company Name and Designation */}
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '4pt' }}>
            <FieldProcessor
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
            
            <FieldProcessor
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
          </div>

          {/* Date Range */}
          <FieldProcessor
            fieldName="date_range"
            value={`${exp.start_date} - ${exp.is_current ? 'Present' : exp.end_date}`}
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
          
          {/* Description */}
          {exp.description && (
            <FieldProcessor
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
          )}
        </div>
      ))}
    </div>
  );
};
