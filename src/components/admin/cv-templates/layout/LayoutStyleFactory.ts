
import { LayoutConfiguration, LayoutStyleResult, ZoneStyleConfig } from './LayoutTypes';
import { getLayoutConfiguration } from './LayoutConfigurations';

export class LayoutStyleFactory {
  private static getContrastColor(backgroundColor: string): string {
    if (!backgroundColor || backgroundColor === 'transparent') return 'inherit';
    
    // Handle CSS custom properties
    if (backgroundColor.startsWith('var(')) return '#ffffff';
    
    const hex = backgroundColor.replace('#', '');
    if (hex.length !== 6) return '#000000';
    
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  }

  private static createCSSVariables(layoutConfig: Record<string, any>): Record<string, string> {
    return {
      '--primary-color': layoutConfig.primaryColor || '#1f2937',
      '--secondary-color': layoutConfig.secondaryColor || '#6b7280',
      '--accent-color': layoutConfig.accentColor || '#3b82f6',
      '--accent-bg': `${layoutConfig.accentColor || '#3b82f6'}15`,
      '--sidebar-bg': layoutConfig.sidebarBg || layoutConfig.primaryColor || '#1f2937',
      '--secondary-column-bg': layoutConfig.secondaryColumnBg || '#f8fafc',
      '--main-column-bg': layoutConfig.mainColumnBg || 'transparent'
    };
  }

  private static generateZoneStyles(
    layout: LayoutConfiguration,
    layoutConfig: Record<string, any>
  ): Record<string, ZoneStyleConfig> {
    const zoneStyles: Record<string, ZoneStyleConfig> = {};
    const cssVars = this.createCSSVariables(layoutConfig);

    layout.zones.forEach(zone => {
      const defaultStyle = layout.defaultZoneStyles[zone.id] || {};
      
      // Get background color, replace CSS variables with actual values
      let backgroundColor = defaultStyle.backgroundColor || 'transparent';
      if (backgroundColor.startsWith('var(')) {
        const varName = backgroundColor.match(/var\(([^)]+)\)/)?.[1];
        if (varName && cssVars[varName]) {
          backgroundColor = cssVars[varName];
        }
      }

      // Apply layout-specific overrides
      if (zone.id === 'sidebar' && layoutConfig.sidebarBg) {
        backgroundColor = layoutConfig.sidebarBg;
      } else if (zone.id === 'secondary' && layoutConfig.secondaryColumnBg) {
        backgroundColor = layoutConfig.secondaryColumnBg;
      } else if (zone.id === 'main' && layoutConfig.mainColumnBg && layoutConfig.mainColumnBg !== 'transparent') {
        backgroundColor = layoutConfig.mainColumnBg;
      }

      const textColor = zone.contrast ? this.getContrastColor(backgroundColor) : 'inherit';

      zoneStyles[zone.id] = {
        backgroundColor,
        textColor,
        borderRadius: defaultStyle.borderRadius,
        padding: defaultStyle.padding,
        contrast: zone.contrast
      };
    });

    return zoneStyles;
  }

  private static generateColumnStyles(
    layout: LayoutConfiguration,
    zoneStyles: Record<string, ZoneStyleConfig>
  ): Record<string, Record<string, any>> {
    const columnStyles: Record<string, Record<string, any>> = {};

    layout.columns.forEach((column, index) => {
      const zoneStyle = zoneStyles[column.zone];
      
      columnStyles[column.id] = {
        gridColumn: `${index + 1}`,
        backgroundColor: zoneStyle.backgroundColor,
        color: zoneStyle.textColor,
        padding: zoneStyle.padding || '0',
        borderRadius: zoneStyle.borderRadius || '0',
        minHeight: '100%'
      };
    });

    return columnStyles;
  }

  static generateStyles(
    layoutType: string,
    layoutConfig: Record<string, any> = {}
  ): LayoutStyleResult {
    const layout = getLayoutConfiguration(layoutType);
    const cssVars = this.createCSSVariables(layoutConfig);

    // Generate container styles
    const containerStyles = {
      display: 'grid',
      gridTemplateColumns: layout.gridTemplate,
      gap: `${layout.gap}mm`,
      alignItems: 'start',
      ...cssVars
    };

    // Generate zone styles
    const zoneStyles = this.generateZoneStyles(layout, layoutConfig);

    // Generate column styles
    const columnStyles = this.generateColumnStyles(layout, zoneStyles);

    return {
      containerStyles,
      zoneStyles,
      columnStyles
    };
  }

  static getSectionStyles(
    zoneId: string,
    zoneStyles: Record<string, ZoneStyleConfig>,
    baseStyles: any
  ): any {
    const zoneStyle = zoneStyles[zoneId];
    if (!zoneStyle || !zoneStyle.contrast) return baseStyles;

    return {
      ...baseStyles,
      sectionTitleStyles: {
        ...baseStyles.sectionTitleStyles,
        color: zoneStyle.textColor,
        borderBottomColor: `${zoneStyle.textColor}30`
      },
      itemTitleStyles: {
        ...baseStyles.itemTitleStyles,
        color: zoneStyle.textColor
      },
      itemSubtitleStyles: {
        ...baseStyles.itemSubtitleStyles,
        color: zoneStyle.contrast ? `${zoneStyle.textColor}CC` : baseStyles.itemSubtitleStyles.color
      }
    };
  }
}
