
import React from 'react';
import { LayoutAwarePageRenderer } from './LayoutAwarePageRenderer';

interface TemplateSection {
  id: string;
  section_type: string;
  display_order: number;
  is_required: boolean;
  field_mapping: Record<string, any>;
  styling_config: Record<string, any>;
}

interface FieldMapping {
  original_field_name: string;
  display_name: string;
  is_masked: boolean;
  mask_value?: string;
  field_order: number;
  visibility_rules: Record<string, any>;
  section_type: string;
}

interface CVPageRendererProps {
  pageNumber: number;
  totalPages: number;
  profile: any;
  styles: any;
  sections?: TemplateSection[];
  fieldMappings?: FieldMapping[];
  layoutType?: string;
}

export const CVPageRenderer: React.FC<CVPageRendererProps> = ({ 
  pageNumber, 
  totalPages, 
  profile, 
  styles,
  sections = [],
  fieldMappings = [],
  layoutType = 'single-column'
}) => {
  // If no sections are configured, show a message instead of default content
  if (sections.length === 0) {
    return (
      <div style={styles.baseStyles} key={pageNumber}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          color: '#666',
          fontSize: '14px',
          textAlign: 'center',
          padding: '40px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>📄</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
            No Sections Configured
          </h3>
          <p style={{ margin: 0, opacity: 0.7, maxWidth: '300px', lineHeight: '1.4' }}>
            Add sections using the Template Inspector to see content in this preview.
            Use the "Sections" tab to configure which profile data should be displayed.
          </p>
        </div>
      </div>
    );
  }

  // Use the layout-aware renderer when sections are configured
  return (
    <LayoutAwarePageRenderer
      pageNumber={pageNumber}
      totalPages={totalPages}
      profile={profile}
      styles={styles}
      sections={sections}
      fieldMappings={fieldMappings}
      layoutType={layoutType}
    />
  );
};
