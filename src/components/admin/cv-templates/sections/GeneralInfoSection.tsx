
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

  // Render profile image
  const renderProfileImage = () => {
    if (isFieldEnabled('profile_image') && profile.profile_image) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'flex-start',
          paddingRight: '20pt'
        }}>
          <img 
            src={profile.profile_image} 
            alt="Profile" 
            style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              objectFit: 'cover',
              border: '2px solid #e5e7eb'
            }} 
          />
        </div>
      );
    }
    return null;
  };

  // Render name and biography section
  const renderNameAndBio = () => {
    const hasFirstName = isFieldEnabled('first_name') && profile.first_name;
    const hasLastName = isFieldEnabled('last_name') && profile.last_name;
    const hasBiography = isFieldEnabled('biography') && profile.biography;
    const hasEmployeeId = isFieldEnabled('employee_id') && profile.employee_id;

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'flex-start',
        paddingLeft: '10pt'
      }}>
        {/* Name */}
        {(hasFirstName || hasLastName) && (
          <div style={{
            ...styles.nameStyles,
            marginBottom: '8pt',
            fontSize: '24pt',
            fontWeight: 'bold',
            color: styles.primaryColor || '#1f2937'
          }}>
            {hasFirstName && (
              <span>{applyMasking(profile.first_name, 'first_name')} </span>
            )}
            {hasLastName && (
              <span>{applyMasking(profile.last_name, 'last_name')}</span>
            )}
          </div>
        )}

        {/* Employee ID */}
        {hasEmployeeId && (
          <div style={{
            ...styles.titleStyles,
            marginBottom: '12pt',
            fontSize: '12pt',
            color: styles.secondaryColor || '#6b7280',
            fontWeight: '500'
          }}>
            Employee ID: {applyMasking(profile.employee_id, 'employee_id')}
          </div>
        )}

        {/* Biography */}
        {hasBiography && (
          <div style={{ 
            fontSize: '11pt', 
            lineHeight: '1.4',
            color: styles.primaryColor || '#1f2937',
            textAlign: 'justify'
          }}>
            {applyMasking(profile.biography, 'biography')}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ 
      ...styles.headerStyles, 
      ...displayStyleClasses,
      display: 'flex',
      alignItems: 'flex-start',
      gap: '20pt',
      marginBottom: '20pt',
      paddingBottom: '15pt',
      borderBottom: `2px solid ${styles.accentColor || '#3b82f6'}`
    }}>
      {/* Left column - Profile Image */}
      <div style={{ 
        flex: '0 0 auto',
        minWidth: '140px'
      }}>
        {renderProfileImage()}
      </div>

      {/* Right column - Name and Biography */}
      <div style={{ 
        flex: '1 1 auto',
        minWidth: '0'
      }}>
        {renderNameAndBio()}
      </div>
    </div>
  );
};
