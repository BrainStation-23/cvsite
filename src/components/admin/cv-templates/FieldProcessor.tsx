
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

  // If no mapping found, use defaults
  const displayName = fieldMapping?.display_name || fieldName;
  const isMasked = fieldMapping?.is_masked || false;
  const maskValue = fieldMapping?.mask_value;

  // Apply masking if configured
  let processedValue = value;
  if (isMasked && value) {
    if (maskValue) {
      // Use custom mask pattern
      processedValue = maskValue;
    } else {
      // Default masking - show only first few characters
      if (typeof value === 'string' && value.length > 3) {
        processedValue = value.substring(0, 3) + '***';
      } else {
        processedValue = '***';
      }
    }
  }

  // Check visibility rules (simplified for now)
  const shouldShow = checkVisibilityRules(value, fieldMapping?.visibility_rules || {});

  return <>{children(processedValue, displayName, shouldShow)}</>;
};

const checkVisibilityRules = (value: any, rules: Record<string, any>): boolean => {
  // If no rules, show the field
  if (!rules || Object.keys(rules).length === 0) {
    return true;
  }

  // Implement basic visibility rules
  // This can be extended based on requirements
  if (rules.showIfNotEmpty && (!value || value === '')) {
    return false;
  }

  if (rules.showIfEmpty && value && value !== '') {
    return false;
  }

  return true;
};
