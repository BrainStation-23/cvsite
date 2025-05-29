
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

interface FieldConfig {
  field: string;
  label: string;
  enabled: boolean;
  masked: boolean;
  mask_value?: string;
  order: number;
}

interface GeneralInfoSectionProps {
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

export const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({ 
  profile, 
  styles, 
  fieldMappings = [],
  sectionConfig 
}) => {
  // Get field configurations from section config
  const fieldConfigs = sectionConfig?.styling_config?.fields || [];
  const displayStyle = sectionConfig?.styling_config?.display_style || 'default';

  // Helper function to check if a field is enabled
  const isFieldEnabled = (fieldName: string) => {
    const config = fieldConfigs.find(f => f.field === fieldName);
    return config ? config.enabled : true; // Default to enabled if no config
  };

  // Helper function to get field mask value
  const getFieldMaskValue = (fieldName: string) => {
    const config = fieldConfigs.find(f => f.field === fieldName);
    return config?.masked ? config.mask_value : undefined;
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

  // Apply display style classes
  const getDisplayStyleClasses = () => {
    switch (displayStyle) {
      case 'compact':
        return { fontSize: '0.8em', lineHeight: '1.2' };
      case 'detailed':
        return { fontSize: '1.1em', lineHeight: '1.6' };
      default:
        return {};
    }
  };

  const displayStyleClasses = getDisplayStyleClasses();

  return (
    <div style={{ ...styles.headerStyles, ...displayStyleClasses }}>
      {/* Name */}
      <div style={styles.nameStyles}>
        {isFieldEnabled('first_name') && profile.first_name && (
          <span>{applyMasking(profile.first_name, 'first_name')} </span>
        )}
        {isFieldEnabled('last_name') && profile.last_name && (
          <span>{applyMasking(profile.last_name, 'last_name')}</span>
        )}
      </div>

      {/* Employee ID */}
      {isFieldEnabled('employee_id') && profile.employee_id && (
        <p style={styles.titleStyles}>
          Employee ID: {applyMasking(profile.employee_id, 'employee_id')}
        </p>
      )}

      {/* Profile Image */}
      {isFieldEnabled('profile_image') && profile.profile_image && (
        <div style={{ marginBottom: '10pt', textAlign: 'center' }}>
          <img 
            src={profile.profile_image} 
            alt="Profile" 
            style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              objectFit: 'cover' 
            }} 
          />
        </div>
      )}

      {/* Biography */}
      {isFieldEnabled('biography') && profile.biography && (
        <p style={{ marginTop: '10pt', fontSize: '0.9em', fontStyle: 'italic' }}>
          {applyMasking(profile.biography, 'biography')}
        </p>
      )}
    </div>
  );
};
