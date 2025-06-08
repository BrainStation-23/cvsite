
import { CVTemplate } from '@/types/cv-templates';

export const createCVStyles = (template: CVTemplate) => {
  const layoutConfig = template.layout_config || {};
  
  const pageWidth = template.orientation === 'portrait' ? '210mm' : '297mm';
  const pageHeight = template.orientation === 'portrait' ? '297mm' : '210mm';
  
  // Helper function to ensure text visibility on colored backgrounds
  const getContrastColor = (backgroundColor: string) => {
    // Simple contrast check - if background is dark, use light text
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  // Layout type specific styles
  const getLayoutStyles = () => {
    const primaryColor = layoutConfig.primaryColor || '#1f2937';
    const secondaryColor = layoutConfig.secondaryColor || '#6b7280';
    const accentColor = layoutConfig.accentColor || '#3b82f6';

    switch (layoutConfig.layoutType) {
      case 'two-column':
        return {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: `${layoutConfig.columnGap || 10}mm`,
          alignItems: 'start',
          // Apply background colors to columns
          '& > div:first-child': {
            backgroundColor: layoutConfig.mainColumnBg || 'transparent',
            padding: layoutConfig.mainColumnBg ? '15px' : '0',
            borderRadius: layoutConfig.mainColumnBg ? '8px' : '0',
            color: layoutConfig.mainColumnBg ? getContrastColor(layoutConfig.mainColumnBg) : 'inherit'
          },
          '& > div:last-child': {
            backgroundColor: layoutConfig.secondaryColumnBg || `${accentColor}15`, // 15 for light opacity
            padding: '15px',
            borderRadius: '8px',
            color: layoutConfig.secondaryColumnBg ? getContrastColor(layoutConfig.secondaryColumnBg) : 'inherit'
          }
        };
      case 'sidebar':
        return {
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: `${layoutConfig.columnGap || 10}mm`,
          alignItems: 'start',
          // Apply background colors with sidebar styling
          '& > div:first-child': {
            backgroundColor: layoutConfig.sidebarBg || primaryColor,
            padding: '20px 15px',
            borderRadius: '0 12px 12px 0',
            color: layoutConfig.sidebarBg ? getContrastColor(layoutConfig.sidebarBg) : getContrastColor(primaryColor),
            minHeight: '100%'
          },
          '& > div:last-child': {
            backgroundColor: layoutConfig.mainColumnBg || 'transparent',
            padding: layoutConfig.mainColumnBg ? '15px' : '0',
            borderRadius: layoutConfig.mainColumnBg ? '8px' : '0',
            color: layoutConfig.mainColumnBg ? getContrastColor(layoutConfig.mainColumnBg) : 'inherit'
          }
        };
      default: // single-column
        return {
          display: 'block'
        };
    }
  };
  
  return {
    baseStyles: {
      width: pageWidth,
      height: pageHeight,
      margin: '0 auto 20px',
      backgroundColor: 'white',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      padding: `${layoutConfig.margin || 20}mm`,
      fontFamily: `${layoutConfig.primaryFont || 'Arial'}, sans-serif`,
      fontSize: `${layoutConfig.baseFontSize || 12}pt`,
      lineHeight: layoutConfig.lineHeight || 1.4,
      color: '#333',
      position: 'relative' as const,
      pageBreakAfter: 'always' as const,
      orientation: template.orientation,
      ...getLayoutStyles()
    },

    headerStyles: {
      textAlign: layoutConfig.layoutType === 'single-column' ? 'center' as const : 'left' as const,
      marginBottom: `${layoutConfig.sectionSpacing || 16}pt`,
      borderBottom: `2px solid ${layoutConfig.primaryColor || '#1f2937'}`,
      paddingBottom: '10pt',
      gridColumn: layoutConfig.layoutType === 'two-column' ? '1 / -1' : 'auto',
      backgroundColor: 'transparent',
      color: 'inherit'
    },

    nameStyles: {
      fontSize: `${layoutConfig.headingSize || 16}pt`,
      fontWeight: 'bold',
      color: 'inherit', // Use inherited color for proper contrast
      margin: '0 0 5pt 0'
    },

    titleStyles: {
      fontSize: `${layoutConfig.subheadingSize || 14}pt`,
      color: layoutConfig.layoutType === 'sidebar' ? 'rgba(255,255,255,0.8)' : (layoutConfig.secondaryColor || '#6b7280'),
      margin: '0'
    },

    sectionStyles: {
      marginBottom: `${layoutConfig.sectionSpacing || 16}pt`,
      breakInside: 'avoid' as const,
      backgroundColor: 'transparent'
    },

    sectionTitleStyles: {
      fontSize: `${layoutConfig.subheadingSize || 14}pt`,
      fontWeight: 'bold',
      color: 'inherit', // Use inherited color for proper contrast
      borderBottom: layoutConfig.layoutType === 'sidebar' ? '1px solid rgba(255,255,255,0.3)' : `1px solid ${layoutConfig.accentColor || '#3b82f6'}`,
      paddingBottom: '2pt',
      marginBottom: `${layoutConfig.itemSpacing || 8}pt`
    },

    itemStyles: {
      marginBottom: `${layoutConfig.itemSpacing || 8}pt`,
      backgroundColor: 'transparent'
    },

    itemTitleStyles: {
      fontWeight: 'bold',
      color: 'inherit' // Use inherited color for proper contrast
    },

    itemSubtitleStyles: {
      color: layoutConfig.layoutType === 'sidebar' ? 'rgba(255,255,255,0.7)' : (layoutConfig.secondaryColor || '#6b7280'),
      fontSize: '0.9em'
    },

    skillsContainerStyles: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '5pt'
    },

    skillStyles: {
      backgroundColor: layoutConfig.layoutType === 'sidebar' ? 'rgba(255,255,255,0.2)' : (layoutConfig.accentColor || '#3b82f6'),
      color: layoutConfig.layoutType === 'sidebar' ? 'white' : 'white',
      padding: '2pt 6pt',
      borderRadius: '3pt',
      fontSize: '0.8em',
      border: layoutConfig.layoutType === 'sidebar' ? '1px solid rgba(255,255,255,0.3)' : 'none'
    },

    // Add layout-specific container styles
    layoutContainerStyles: {
      ...getLayoutStyles()
    },

    // Add specific styles for sidebar and two-column sections
    sidebarSectionStyles: {
      color: 'white',
      '& h3': {
        color: 'white',
        borderBottomColor: 'rgba(255,255,255,0.3)'
      },
      '& .item-subtitle': {
        color: 'rgba(255,255,255,0.7)'
      }
    },

    secondaryColumnStyles: {
      backgroundColor: `${layoutConfig.accentColor || '#3b82f6'}15`,
      padding: '15px',
      borderRadius: '8px'
    }
  };
};
