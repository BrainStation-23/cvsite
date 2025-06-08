
import React from 'react';
import { DynamicSectionRenderer } from './DynamicSectionRenderer';

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

// Helper function to get contrast color for text visibility
function getContrastColor(backgroundColor: string) {
  if (!backgroundColor || backgroundColor === 'transparent') return 'inherit';
  
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
}

// Helper function to render content based on layout type
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

  switch (layoutType) {
    case 'two-column':
      // For two-column layout, use the section's layout_placement setting
      const twoColMainSections = sections.filter(s => 
        (s.styling_config?.layout_placement || 'main') === 'main'
      );
      const twoColSecondarySections = sections.filter(s => 
        (s.styling_config?.layout_placement || 'main') === 'sidebar'
      );
      
      console.log('Two-column layout distribution:', {
        mainSections: twoColMainSections.map(s => s.section_type),
        secondarySections: twoColSecondarySections.map(s => s.section_type)
      });
      
      return (
        <>
          <div style={{ gridColumn: '1' }}>
            <DynamicSectionRenderer
              sections={twoColMainSections}
              fieldMappings={fieldMappings}
              profile={profile}
              styles={styles}
              partialSections={partialSections}
            />
          </div>
          <div style={{ 
            gridColumn: '2',
            ...styles.secondaryColumnStyles
          }}>
            <DynamicSectionRenderer
              sections={twoColSecondarySections}
              fieldMappings={fieldMappings}
              profile={profile}
              styles={styles}
              partialSections={partialSections}
            />
          </div>
        </>
      );

    case 'sidebar':
      // For sidebar layout, use the section's layout_placement setting
      const sidebarSections = sections.filter(s => 
        (s.styling_config?.layout_placement || 'main') === 'sidebar'
      );
      const mainSections = sections.filter(s => 
        (s.styling_config?.layout_placement || 'main') === 'main'
      );
      
      console.log('Sidebar layout distribution:', {
        sidebarSections: sidebarSections.map(s => s.section_type),
        mainSections: mainSections.map(s => s.section_type)
      });

      // Get layout config for sidebar styling
      const layoutConfig = styles.layoutConfig || {};
      const sidebarBg = layoutConfig.sidebarBg || layoutConfig.primaryColor || '#1f2937';
      const mainColumnBg = layoutConfig.mainColumnBg || 'transparent';
      
      return (
        <>
          <div style={{ 
            gridColumn: '1',
            backgroundColor: sidebarBg,
            padding: '20px 15px',
            borderRadius: '0 12px 12px 0',
            color: getContrastColor(sidebarBg),
            minHeight: '100%'
          }}>
            <DynamicSectionRenderer
              sections={sidebarSections}
              fieldMappings={fieldMappings}
              profile={profile}
              styles={{
                ...styles,
                sectionTitleStyles: {
                  ...styles.sectionTitleStyles,
                  color: getContrastColor(sidebarBg),
                  borderBottomColor: `${getContrastColor(sidebarBg)}30`
                },
                itemTitleStyles: {
                  ...styles.itemTitleStyles,
                  color: getContrastColor(sidebarBg)
                },
                itemSubtitleStyles: {
                  ...styles.itemSubtitleStyles,
                  color: sidebarBg !== 'transparent' ? `${getContrastColor(sidebarBg)}CC` : styles.itemSubtitleStyles.color
                }
              }}
              partialSections={partialSections}
            />
          </div>
          <div style={{ 
            gridColumn: '2',
            backgroundColor: mainColumnBg,
            padding: mainColumnBg !== 'transparent' ? '15px' : '0',
            borderRadius: mainColumnBg !== 'transparent' ? '8px' : '0',
            color: getContrastColor(mainColumnBg)
          }}>
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
