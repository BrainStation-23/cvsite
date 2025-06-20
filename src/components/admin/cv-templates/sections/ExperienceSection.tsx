
import React from 'react';
import { FieldProcessor } from '../FieldProcessor';
import { useSectionFieldConfig } from '@/hooks/use-section-field-config';

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

interface ExperienceSectionProps {
  profile: any;
  styles: any;
  fieldMappings?: FieldMapping[];
  sectionConfig?: {
    styling_config?: {
      display_style?: string;
      fields?: FieldConfig[];
    };
  };
  customTitle?: string;
}

import { VerticalTimeline } from './VerticalTimeline';

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ 
  profile, 
  styles, 
  fieldMappings = [],
  sectionConfig,
  customTitle
}) => {
  if (!profile.experiences || profile.experiences.length === 0) return null;

  const defaultFields: FieldConfig[] = [
    { field: 'designation', label: 'Designation', order: 1, enabled: true, masked: false },
    { field: 'company_name', label: 'Company', order: 2, enabled: true, masked: false },
    { field: 'date_range', label: 'Date Range', order: 3, enabled: true, masked: false },
    { field: 'description', label: 'Description', order: 4, enabled: true, masked: false }
  ];

  const {
    orderedFields,
    isFieldEnabled,
    applyMasking,
    sectionTitle
  } = useSectionFieldConfig({
    sectionType: 'experience',
    fieldMappings,
    sectionConfig,
    defaultFields
  });

  // Helper function to format date
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
    } catch {
      return dateString.toString();
    }
  };

  // Helper function to clean HTML content for PDF rendering
  const cleanHtmlContent = (htmlContent: string) => {
    if (!htmlContent) return '';
    
    // Remove HTML tags for cleaner PDF output but preserve basic formatting
    return htmlContent
      .replace(/<strong>/g, '<b>')
      .replace(/<\/strong>/g, '</b>')
      .replace(/<em>/g, '<i>')
      .replace(/<\/em>/g, '</i>')
      .replace(/<u>/g, '<u>')
      .replace(/<\/u>/g, '</u>')
      .replace(/<ol>/g, '')
      .replace(/<\/ol>/g, '')
      .replace(/<ul>/g, '')
      .replace(/<\/ul>/g, '')
      .replace(/<li>/g, '• ')
      .replace(/<\/li>/g, '<br>')
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '<br>');
  };

  // Define field renderers
  const fieldRenderers = {
    company_name: (exp: any, index: number) => {
      const maskedValue = applyMasking(exp.company_name, 'company_name');
      return (
        <FieldProcessor
          key="company_name"
          fieldName="company_name"
          value={maskedValue}
          fieldMappings={fieldMappings}
          sectionType="experience"
        >
          {(processedValue, displayName, shouldShow) => (
            shouldShow && processedValue && (
              <div style={{ 
                ...styles.itemSubtitleStyles, 
                fontWeight: 'bold',
                marginBottom: '2pt'
              }}>
                {processedValue}
              </div>
            )
          )}
        </FieldProcessor>
      );
    },
    designation: (exp: any, index: number) => {
      const maskedValue = applyMasking(exp.designation, 'designation');
      return (
        <FieldProcessor
          key="designation"
          fieldName="designation"
          value={maskedValue}
          fieldMappings={fieldMappings}
          sectionType="experience"
        >
          {(processedValue, displayName, shouldShow) => (
            shouldShow && processedValue && (
              <div style={styles.itemTitleStyles}>{processedValue}</div>
            )
          )}
        </FieldProcessor>
      );
    },
    date_range: (exp: any, index: number) => {
      const startDate = formatDate(exp.start_date);
      const endDate = exp.is_current ? 'Present' : formatDate(exp.end_date);
      const dateRange = `${startDate} - ${endDate}`;
      const maskedValue = applyMasking(dateRange, 'date_range');
      return (
        <FieldProcessor
          key="date_range"
          fieldName="date_range"
          value={maskedValue}
          fieldMappings={fieldMappings}
          sectionType="experience"
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
    },
    description: (exp: any, index: number) => {
      const cleanedContent = cleanHtmlContent(exp.description || '');
      const maskedValue = applyMasking(cleanedContent, 'description');
      return (
        <FieldProcessor
          key="description"
          fieldName="description"
          value={maskedValue}
          fieldMappings={fieldMappings}
          sectionType="experience"
        >
          {(processedValue, displayName, shouldShow) => (
            shouldShow && processedValue && (
              <div 
                style={{ 
                  marginTop: '4pt', 
                  fontSize: '0.9em',
                  lineHeight: '1.4',
                  textAlign: 'justify'
                }}
                dangerouslySetInnerHTML={{ __html: processedValue }}
              />
            )
          )}
        </FieldProcessor>
      );
    }
  };

  // Check for timeline display style
  const displayStyle = sectionConfig?.styling_config?.display_style || 'default';

  if (displayStyle === 'timeline') {
    // Prepare timeline items
    const timelineItems = profile.experiences.map((exp: any, index: number) => {
      // Use the same field logic as the default render
      const title = isFieldEnabled('designation') ? (exp.designation || '') : '';
      const subtitle = isFieldEnabled('company_name') ? (exp.company_name || '') : '';
      const startDate = formatDate(exp.start_date);
      const endDate = exp.is_current ? 'Present' : formatDate(exp.end_date);
      const dateRange = isFieldEnabled('date_range') ? `${startDate} - ${endDate}` : '';
      const description = isFieldEnabled('description') ? cleanHtmlContent(exp.description || '') : '';
      return {
        title,
        subtitle,
        dateRange,
        description
      };
    });

    return (
      <div style={styles.sectionStyles}>
        <h2 style={styles.sectionTitleStyles}>{customTitle || sectionTitle || 'Work Experience'}</h2>
        <VerticalTimeline
          items={timelineItems}
          accentColor={styles?.layoutConfig?.accentColor || '#3b82f6'}
        />
      </div>
    );
  }

  // Default rendering (list)
  return (
    <div style={styles.sectionStyles}>
      <h2 style={styles.sectionTitleStyles}>{customTitle || sectionTitle || 'Work Experience'}</h2>
      {profile.experiences.map((exp: any, index: number) => (
        <div key={index} style={styles.itemStyles}>
          {orderedFields.map((fieldConfig) => {
            const fieldName = fieldConfig.field;
            const renderer = fieldRenderers[fieldName as keyof typeof fieldRenderers];
            
            if (!renderer || !isFieldEnabled(fieldName)) return null;
            
            return renderer(exp, index);
          })}
        </div>
      ))}
    </div>
  );
};
