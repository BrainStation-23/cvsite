
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

interface GeneralInfoSectionProps {
  profile: any;
  styles: any;
  fieldMappings?: FieldMapping[];
  sectionConfig?: any;
}

export const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({ 
  profile, 
  styles, 
  fieldMappings = [],
  sectionConfig 
}) => {
  // Sort field mappings by field_order for this section
  const sortedFieldMappings = fieldMappings
    .filter(mapping => mapping.section_type === 'general')
    .sort((a, b) => a.field_order - b.field_order);

  return (
    <div style={styles.headerStyles}>
      <FieldProcessor
        fieldName="first_name"
        value={profile.first_name}
        fieldMappings={fieldMappings}
        sectionType="general"
      >
        {(processedFirstName, firstNameDisplay, showFirstName) => (
          <FieldProcessor
            fieldName="last_name"
            value={profile.last_name}
            fieldMappings={fieldMappings}
            sectionType="general"
          >
            {(processedLastName, lastNameDisplay, showLastName) => (
              <h1 style={styles.nameStyles}>
                {showFirstName && processedFirstName} {showLastName && processedLastName}
              </h1>
            )}
          </FieldProcessor>
        )}
      </FieldProcessor>
      
      <FieldProcessor
        fieldName="employee_id"
        value={profile.employee_id}
        fieldMappings={fieldMappings}
        sectionType="general"
      >
        {(processedValue, displayName, shouldShow) => (
          shouldShow && processedValue && (
            <p style={styles.titleStyles}>
              {displayName}: {processedValue}
            </p>
          )
        )}
      </FieldProcessor>

      {profile.biography && (
        <FieldProcessor
          fieldName="biography"
          value={profile.biography}
          fieldMappings={fieldMappings}
          sectionType="general"
        >
          {(processedValue, displayName, shouldShow) => (
            shouldShow && (
              <p style={{ marginTop: '10pt', fontSize: '0.9em', fontStyle: 'italic' }}>
                {processedValue}
              </p>
            )
          )}
        </FieldProcessor>
      )}
    </div>
  );
};
