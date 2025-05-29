
import { CVTemplate } from '@/types/cv-templates';

export const createCVStyles = (template: CVTemplate) => {
  const layoutConfig = template.layout_config || {};
  
  const pageWidth = template.orientation === 'portrait' ? '210mm' : '297mm';
  const pageHeight = template.orientation === 'portrait' ? '297mm' : '210mm';
  
  // Layout type specific styles
  const getLayoutStyles = () => {
    switch (layoutConfig.layoutType) {
      case 'two-column':
        return {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: `${layoutConfig.columnGap || 10}mm`,
          alignItems: 'start'
        };
      case 'sidebar':
        return {
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: `${layoutConfig.columnGap || 10}mm`,
          alignItems: 'start'
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
      ...getLayoutStyles()
    },

    headerStyles: {
      textAlign: layoutConfig.layoutType === 'single-column' ? 'center' as const : 'left' as const,
      marginBottom: `${layoutConfig.sectionSpacing || 16}pt`,
      borderBottom: `2px solid ${layoutConfig.primaryColor || '#1f2937'}`,
      paddingBottom: '10pt',
      gridColumn: layoutConfig.layoutType === 'two-column' ? '1 / -1' : 'auto'
    },

    nameStyles: {
      fontSize: `${layoutConfig.headingSize || 16}pt`,
      fontWeight: 'bold',
      color: layoutConfig.primaryColor || '#1f2937',
      margin: '0 0 5pt 0'
    },

    titleStyles: {
      fontSize: `${layoutConfig.subheadingSize || 14}pt`,
      color: layoutConfig.secondaryColor || '#6b7280',
      margin: '0'
    },

    sectionStyles: {
      marginBottom: `${layoutConfig.sectionSpacing || 16}pt`,
      breakInside: 'avoid' as const
    },

    sectionTitleStyles: {
      fontSize: `${layoutConfig.subheadingSize || 14}pt`,
      fontWeight: 'bold',
      color: layoutConfig.primaryColor || '#1f2937',
      borderBottom: `1px solid ${layoutConfig.accentColor || '#3b82f6'}`,
      paddingBottom: '2pt',
      marginBottom: `${layoutConfig.itemSpacing || 8}pt`
    },

    itemStyles: {
      marginBottom: `${layoutConfig.itemSpacing || 8}pt`
    },

    itemTitleStyles: {
      fontWeight: 'bold',
      color: layoutConfig.primaryColor || '#1f2937'
    },

    itemSubtitleStyles: {
      color: layoutConfig.secondaryColor || '#6b7280',
      fontSize: '0.9em'
    },

    skillsContainerStyles: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '5pt'
    },

    skillStyles: {
      backgroundColor: layoutConfig.accentColor || '#3b82f6',
      color: 'white',
      padding: '2pt 6pt',
      borderRadius: '3pt',
      fontSize: '0.8em'
    },

    // Add layout-specific container styles
    layoutContainerStyles: {
      ...getLayoutStyles()
    }
  };
};
