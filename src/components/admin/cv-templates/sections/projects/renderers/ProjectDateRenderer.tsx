
import React from 'react';
import { FieldProcessor } from '../../../FieldProcessor';
import { formatDate } from '../utils/dateFormatting';

interface FieldMapping {
  original_field_name: string;
  display_name: string;
  is_masked: boolean;
  mask_value?: string;
  field_order: number;
  visibility_rules: Record<string, any>;
  section_type: string;
}

export const ProjectStartDateRenderer = (
  project: any, 
  index: number, 
  fieldMappings: FieldMapping[], 
  styles: any, 
  applyMasking: (value: any, fieldName: string) => any
) => {
  const formattedDate = formatDate(project.start_date);
  const maskedValue = applyMasking(formattedDate, 'start_date');
  return (
    <FieldProcessor
      key="start_date"
      fieldName="start_date"
      value={maskedValue}
      fieldMappings={fieldMappings}
      sectionType="projects"
    >
      {(processedValue, displayName, shouldShow) => (
        shouldShow && processedValue && (
          <span style={{ fontSize: '0.85em', color: '#666', fontStyle: 'italic' }}>
            {processedValue}
          </span>
        )
      )}
    </FieldProcessor>
  );
};

export const ProjectEndDateRenderer = (
  project: any, 
  index: number, 
  fieldMappings: FieldMapping[], 
  styles: any, 
  applyMasking: (value: any, fieldName: string) => any
) => {
  const dateValue = project.is_current ? 'Present' : formatDate(project.end_date);
  const maskedValue = applyMasking(dateValue, 'end_date');
  return (
    <FieldProcessor
      key="end_date"
      fieldName="end_date"
      value={maskedValue}
      fieldMappings={fieldMappings}
      sectionType="projects"
    >
      {(processedValue, displayName, shouldShow) => (
        shouldShow && processedValue && (
          <span style={{ fontSize: '0.85em', color: '#666', fontStyle: 'italic' }}>
            {processedValue}
          </span>
        )
      )}
    </FieldProcessor>
  );
};

export const ProjectDateRangeRenderer = (
  project: any, 
  index: number, 
  fieldMappings: FieldMapping[], 
  styles: any, 
  applyMasking: (value: any, fieldName: string) => any
) => {
  const startDate = formatDate(project.start_date);
  const endDate = project.is_current ? 'Present' : formatDate(project.end_date);
  const dateRange = `${startDate} - ${endDate}`;
  const maskedValue = applyMasking(dateRange, 'date_range');
  return (
    <FieldProcessor
      key="date_range"
      fieldName="date_range"
      value={maskedValue}
      fieldMappings={fieldMappings}
      sectionType="projects"
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
  );
};
