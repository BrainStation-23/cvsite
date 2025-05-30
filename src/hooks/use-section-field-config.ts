
import { useMemo } from 'react';

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

interface SectionConfig {
  styling_config?: {
    display_style?: string;
    fields?: FieldConfig[];
  };
}

interface UseSectionFieldConfigProps {
  sectionType: string;
  fieldMappings: FieldMapping[];
  sectionConfig?: SectionConfig;
  defaultFields: FieldConfig[];
}

export const useSectionFieldConfig = ({
  sectionType,
  fieldMappings,
  sectionConfig,
  defaultFields
}: UseSectionFieldConfigProps) => {
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

  // Get section title from field mappings or use default
  const sectionTitleMapping = fieldMappings.find(
    mapping => mapping.original_field_name === 'section_title' && mapping.section_type === sectionType
  );

  // Get ordered fields based on section config, or use default order
  const orderedFields = useMemo((): FieldConfig[] => {
    if (fieldConfigs.length === 0) {
      return defaultFields;
    }

    // Use configuration order and filter enabled fields
    return [...fieldConfigs]
      .filter(f => f.enabled)
      .sort((a, b) => a.order - b.order);
  }, [fieldConfigs, defaultFields]);

  return {
    orderedFields,
    displayStyle,
    isFieldEnabled,
    applyMasking,
    sectionTitle: sectionTitleMapping?.display_name
  };
};
