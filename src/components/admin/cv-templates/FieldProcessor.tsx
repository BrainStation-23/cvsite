
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

interface FieldProcessorProps {
  fieldName: string;
  value: any;
  fieldMappings: FieldMapping[];
  sectionType: string;
  children: (processedValue: any, displayName: string, shouldShow: boolean) => React.ReactNode;
}

export const FieldProcessor: React.FC<FieldProcessorProps> = ({
  fieldName,
  value,
  fieldMappings,
  sectionType,
  children
}) => {
  // Find the field mapping for this field
  const fieldMapping = fieldMappings.find(
    mapping => mapping.original_field_name === fieldName && mapping.section_type === sectionType
  );

  // If no mapping found, use defaults and show the field
  const displayName = fieldMapping?.display_name || fieldName;
  const isMasked = fieldMapping?.is_masked || false;
  const maskValue = fieldMapping?.mask_value;

  // Apply masking if configured
  let processedValue = value;
  if (isMasked && value !== null && value !== undefined) {
    if (maskValue) {
      // Use custom mask pattern
      processedValue = maskValue;
    } else {
      // Default masking - show only first few characters
      if (typeof value === 'string' && value.length > 3) {
        processedValue = value.substring(0, 3) + '***';
      } else if (value) {
        processedValue = '***';
      }
    }
  }

  // Check visibility rules
  const shouldShow = checkVisibilityRules(value, fieldMapping?.visibility_rules || {}, fieldMapping);

  return <>{children(processedValue, displayName, shouldShow)}</>;
};

const checkVisibilityRules = (value: any, rules: Record<string, any>, fieldMapping?: FieldMapping): boolean => {
  // If no field mapping exists, show the field by default
  if (!fieldMapping) {
    return true;
  }

  // If no rules, show the field
  if (!rules || Object.keys(rules).length === 0) {
    return true;
  }

  // Implement basic visibility rules
  if (rules.showIfNotEmpty && (!value || value === '' || value === null || value === undefined)) {
    return false;
  }

  if (rules.showIfEmpty && value && value !== '' && value !== null && value !== undefined) {
    return false;
  }

  if (rules.hidden === true) {
    return false;
  }

  if (rules.visible === false) {
    return false;
  }

  return true;
};
