
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

  return (
    <div style={styles.sectionStyles}>
      <h2 style={styles.sectionTitleStyles}>{sectionTitle}</h2>
      {profile.experiences.map((exp: any, index: number) => (
        <div key={index} style={styles.itemStyles}>
          <FieldProcessor
            fieldName="designation"
            value={exp.designation}
            fieldMappings={fieldMappings}
            sectionType="experience"
          >
            {(processedValue, displayName, shouldShow) => (
              shouldShow && <div style={styles.itemTitleStyles}>{processedValue}</div>
            )}
          </FieldProcessor>
          
          <FieldProcessor
            fieldName="company_name"
            value={exp.company_name}
            fieldMappings={fieldMappings}
            sectionType="experience"
          >
            {(processedCompany, companyDisplayName, showCompany) => (
              <div style={styles.itemSubtitleStyles}>
                {showCompany && processedCompany} • {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
              </div>
            )}
          </FieldProcessor>
          
          {exp.description && (
            <FieldProcessor
              fieldName="description"
              value={exp.description}
              fieldMappings={fieldMappings}
              sectionType="experience"
            >
              {(processedValue, displayName, shouldShow) => (
                shouldShow && (
                  <p style={{ marginTop: '3pt', fontSize: '0.9em' }}>{processedValue}</p>
                )
              )}
            </FieldProcessor>
          )}
        </div>
      ))}
    </div>
  );
};
