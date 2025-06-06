
import React from 'react';
import { DynamicSectionRenderer } from './DynamicSectionRenderer';

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

interface LayoutAwarePageRendererProps {
  pageNumber: number;
  totalPages: number;
  profile: any;
  styles: any;
  sections?: TemplateSection[];
  fieldMappings?: FieldMapping[];
  layoutType?: string;
  partialSections?: {
    [sectionId: string]: {
      items: any[];
      startIndex: number;
      totalItems: number;
      isPartial: boolean;
      title: string;
    };
  };
}

export const LayoutAwarePageRenderer: React.FC<LayoutAwarePageRendererProps> = ({ 
  pageNumber, 
  totalPages, 
  profile, 
  styles,
  sections = [],
  fieldMappings = [],
  layoutType = 'single-column',
  partialSections = {}
}) => {
  const enhancedProfile = {
    ...profile,
    employee_id: profile.employee_id || profile.id,
    profile_image: profile.profile_image || profile.profileImage,
  };

  // If no sections configured, don't render anything (parent should handle this case)
  if (!sections || sections.length === 0) {
    return null;
  }

  // Sort sections by display order
  const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);

  return (
    <div style={styles.baseStyles} key={pageNumber}>
      {renderLayoutContent(sortedSections, fieldMappings, enhancedProfile, styles, layoutType, partialSections)}
    </div>
  );
};

// Helper function to render content based on layout type
function renderLayoutContent(
  sections: any[], 
  fieldMappings: FieldMapping[], 
  profile: any, 
  styles: any, 
  layoutType: string,
  partialSections: any = {}
) {
  // If no sections, return null
  if (!sections || sections.length === 0) {
    return null;
  }

  switch (layoutType) {
    case 'two-column':
      const midPoint = Math.ceil(sections.length / 2);
      const leftSections = sections.slice(0, midPoint);
      const rightSections = sections.slice(midPoint);
      
      return (
        <>
          <div style={{ gridColumn: '1' }}>
            <DynamicSectionRenderer
              sections={leftSections}
              fieldMappings={fieldMappings}
              profile={profile}
              styles={styles}
              partialSections={partialSections}
            />
          </div>
          <div style={{ gridColumn: '2' }}>
            <DynamicSectionRenderer
              sections={rightSections}
              fieldMappings={fieldMappings}
              profile={profile}
              styles={styles}
              partialSections={partialSections}
            />
          </div>
        </>
      );

    case 'sidebar':
      const sidebarSections = sections.filter(s => 
        ['technical_skills', 'specialized_skills'].includes(s.section_type)
      );
      const mainSections = sections.filter(s => 
        !['technical_skills', 'specialized_skills'].includes(s.section_type)
      );
      
      return (
        <>
          <div style={{ gridColumn: '1' }}>
            <DynamicSectionRenderer
              sections={sidebarSections}
              fieldMappings={fieldMappings}
              profile={profile}
              styles={styles}
              partialSections={partialSections}
            />
          </div>
          <div style={{ gridColumn: '2' }}>
            <DynamicSectionRenderer
              sections={mainSections}
              fieldMappings={fieldMappings}
              profile={profile}
              styles={styles}
              partialSections={partialSections}
            />
          </div>
        </>
      );

    default: // single-column
      return (
        <DynamicSectionRenderer
          sections={sections}
          fieldMappings={fieldMappings}
          profile={profile}
          styles={styles}
          partialSections={partialSections}
        />
      );
  }
}
