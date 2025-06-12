
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

  // Get all available fields from profile and field mappings
  const getAllAvailableFields = () => {
    const profileFields = Object.keys(profile || {});
    const mappingFields = fieldMappings.map(mapping => mapping.original_field_name);
    const configFields = fieldConfigs.map(config => config.field);
    
    // Combine all fields and remove duplicates
    const allFields = [...new Set([...profileFields, ...mappingFields, ...configFields])];
    
    return allFields.filter(field => field && field !== 'id' && field !== 'created_at' && field !== 'updated_at');
  };

  // Sort fields by their configured order, or use default order if no configuration
  const getOrderedFields = () => {
    const allFields = getAllAvailableFields();
    
    if (fieldConfigs.length === 0) {
      // Default order if no configuration - prioritize known fields first
      const knownFields = ['profile_image', 'first_name', 'last_name', 'employee_id', 'designation', 'biography'];
      const unknownFields = allFields.filter(field => !knownFields.includes(field));
      
      return [
        ...knownFields.filter(field => allFields.includes(field)).map((field, index) => ({ name: field, order: index + 1 })),
        ...unknownFields.map((field, index) => ({ name: field, order: knownFields.length + index + 1 }))
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

  // Helper function to format field name for display
  const formatFieldName = (fieldName: string) => {
    return fieldName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper function to get display name for a field
  const getDisplayName = (fieldName: string) => {
    const mapping = fieldMappings.find(m => m.original_field_name === fieldName);
    const config = fieldConfigs.find(f => f.field === fieldName);
    
    return mapping?.display_name || config?.label || formatFieldName(fieldName);
  };

  // Generic field renderer for any field
  const renderGenericField = (fieldName: string, value: any) => {
    if (!value) return null;

    const displayName = getDisplayName(fieldName);
    const maskedValue = applyMasking(value, fieldName);

    return (
      <p key={fieldName} style={{ marginTop: '8pt', fontSize: '0.9em', color: 'inherit' }}>
        <strong>{displayName}:</strong> {maskedValue}
      </p>
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

      case 'current_designation':
      case 'currentDesignation':
        if (isFieldEnabled('current_designation') && profile.current_designation) {
          return (
            <p key="current_designation" style={{ marginTop: '8pt', fontSize: '0.9em', fontStyle: 'italic' }}>
              {applyMasking(profile.current_designation, 'current_designation')}
            </p>
          );
        }
        break;

      default:
        // Handle any other field generically
        if (isFieldEnabled(fieldName) && profile[fieldName]) {
          return renderGenericField(fieldName, profile[fieldName]);
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
