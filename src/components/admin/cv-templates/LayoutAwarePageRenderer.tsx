
import React from 'react';
import { DynamicSectionRenderer } from './DynamicSectionRenderer';
import { LayoutStyleFactory } from './layout/LayoutStyleFactory';
import { getLayoutConfiguration } from './layout/LayoutConfigurations';

interface TemplateSection {
  id: string;
  section_type: string;
  display_order: number;
  is_required: boolean;
  field_mapping: Record<string, any>;
  styling_config: {
    layout_placement?: 'main' | 'sidebar';
    [key: string]: any;
  };
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

  // If no sections configured, don't render anything
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

// Helper function to render content using unified layout system
function renderLayoutContent(
  sections: TemplateSection[], 
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

  console.log('LayoutAwarePageRenderer renderLayoutContent:', {
    layoutType,
    sectionsCount: sections.length,
    sectionsWithPlacement: sections.map(s => ({
      id: s.id,
      type: s.section_type,
      placement: s.styling_config?.layout_placement || 'main'
    }))
  });

  // Get layout configuration and styles
  const layoutConfig = getLayoutConfiguration(layoutType);
  const layoutStyles = styles.layoutStyles || LayoutStyleFactory.generateStyles(layoutType, styles.layoutConfig || {});

  // Group sections by their target zones
  const sectionsByZone: Record<string, TemplateSection[]> = {};
  
  layoutConfig.zones.forEach(zone => {
    sectionsByZone[zone.id] = [];
  });

  // Distribute sections to zones
  sections.forEach(section => {
    const placement = section.styling_config?.layout_placement || 'main';
    
    // Map placement to actual zone based on layout configuration
    let targetZone = 'main'; // default fallback
    
    if (placement === 'sidebar' && sectionsByZone['sidebar']) {
      targetZone = 'sidebar';
    } else if (placement === 'sidebar' && sectionsByZone['secondary']) {
      // For two-column layout, sidebar placement maps to secondary zone
      targetZone = 'secondary';
    } else {
      targetZone = 'main';
    }
    
    if (sectionsByZone[targetZone]) {
      sectionsByZone[targetZone].push(section);
    } else {
      // Fallback to main if zone doesn't exist
      sectionsByZone['main'] = sectionsByZone['main'] || [];
      sectionsByZone['main'].push(section);
    }
  });

  console.log('Section distribution by zone:', sectionsByZone);

  // Render columns based on layout configuration
  return (
    <>
      {layoutConfig.columns.map((column) => (
        <div 
          key={column.id}
          style={layoutStyles.columnStyles[column.id]}
        >
          <DynamicSectionRenderer
            sections={sectionsByZone[column.zone] || []}
            fieldMappings={fieldMappings}
            profile={profile}
            styles={LayoutStyleFactory.getSectionStyles(
              column.zone,
              layoutStyles.zoneStyles,
              styles
            )}
            partialSections={partialSections}
          />
        </div>
      ))}
    </>
  );
}
