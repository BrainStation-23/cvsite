
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

  // Sort fields by their configured order, or use default order if no configuration
  const getOrderedFields = () => {
    if (fieldConfigs.length === 0) {
      // Default order if no configuration
      return [
        { name: 'profile_image', order: 1 },
        { name: 'name', order: 2 },
        { name: 'employee_id', order: 3 },
        { name: 'biography', order: 4 },
      ];
    }

    // Use configuration order and map to display fields
    const enabledFields = fieldConfigs.filter(f => f.enabled);
    const orderedFields = [...enabledFields].sort((a, b) => a.order - b.order);
    
    return orderedFields.map(field => {
      // Handle composite fields like name
      if (field.field === 'first_name' || field.field === 'last_name') {
        return { name: 'name', order: field.order };
      }
      return { name: field.field, order: field.order };
    }).filter((field, index, self) => 
      // Remove duplicates (like multiple name entries)
      self.findIndex(f => f.name === field.name) === index
    );
  };

  const renderField = (fieldName: string) => {
    switch (fieldName) {
      case 'profile_image':
        if (isFieldEnabled('profile_image') && profile.profile_image) {
          // Get orientation from styles to determine image size
          const isLandscape = styles.baseStyles?.width === '297mm';
          const imageSize = isLandscape ? '60px' : '80px'; // Smaller for landscape
          
          return (
            <div key="profile_image" style={{ marginBottom: '10pt', textAlign: 'center' }}>
              <img 
                src={profile.profile_image} 
                alt="Profile" 
                style={{ 
                  width: imageSize, 
                  height: imageSize, 
                  borderRadius: '4px', // Square with slight rounding instead of circular
                  objectFit: 'cover',
                  border: '1px solid #e5e7eb'
                }} 
              />
            </div>
          );
        }
        break;

      case 'name':
        const hasFirstName = isFieldEnabled('first_name') && profile.first_name;
        const hasLastName = isFieldEnabled('last_name') && profile.last_name;
        
        if (hasFirstName || hasLastName) {
          return (
            <div key="name" style={styles.nameStyles}>
              {hasFirstName && (
                <span>{applyMasking(profile.first_name, 'first_name')} </span>
              )}
              {hasLastName && (
                <span>{applyMasking(profile.last_name, 'last_name')}</span>
              )}
            </div>
          );
        }
        break;

      case 'employee_id':
        // Use employee_id from profiles table
        const employeeId = profile.employee_id;
        if (isFieldEnabled('employee_id') && employeeId) {
          return (
            <p key="employee_id" style={styles.titleStyles}>
              Employee ID: {applyMasking(employeeId, 'employee_id')}
            </p>
          );
        }
        break;

      case 'biography':
        if (isFieldEnabled('biography') && profile.biography) {
          return (
            <p key="biography" style={{ marginTop: '10pt', fontSize: '0.9em', fontStyle: 'italic' }}>
              {applyMasking(profile.biography, 'biography')}
            </p>
          );
        }
        break;
    }
    return null;
  };

  const orderedFields = getOrderedFields();

  return (
    <div style={{ ...styles.headerStyles, ...displayStyleClasses }}>
      {orderedFields.map(field => renderField(field.name)).filter(Boolean)}
    </div>
  );
};
