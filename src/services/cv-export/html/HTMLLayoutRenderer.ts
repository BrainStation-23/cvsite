
import { LayoutStyleFactory } from '@/components/admin/cv-templates/layout/LayoutStyleFactory';
import { getLayoutConfiguration } from '@/components/admin/cv-templates/layout/LayoutConfigurations';
import { HTMLSectionsGenerator } from './HTMLSectionsGenerator';

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

export class HTMLLayoutRenderer {
  private sectionsGenerator = new HTMLSectionsGenerator();

  generateLayoutHTML(
    sections: TemplateSection[], 
    fieldMappings: FieldMapping[], 
    profile: any, 
    layoutType: string,
    partialSections: any = {}
  ): string {
    if (!sections || sections.length === 0) {
      return '';
    }

    console.log('HTML Layout Renderer - Processing sections:', {
      layoutType,
      sectionsCount: sections.length,
      sectionsWithPlacement: sections.map(s => ({
        id: s.id,
        type: s.section_type,
        placement: s.styling_config?.layout_placement || 'main'
      }))
    });

    // Get layout configuration
    const layoutConfig = getLayoutConfiguration(layoutType);

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

    console.log('HTML Section distribution by zone:', sectionsByZone);

    // Generate HTML columns based on layout configuration
    const columnsHTML = layoutConfig.columns.map((column) => {
      const columnSections = sectionsByZone[column.zone] || [];
      const sectionsHTML = this.sectionsGenerator.generateSectionsHTML(
        columnSections, 
        profile, 
        fieldMappings,
        partialSections
      );

      return `<div class="layout-column layout-column-${column.id}" data-zone="${column.zone}">
        ${sectionsHTML}
      </div>`;
    }).join('\n');

    return `<div class="layout-container layout-${layoutType}">
      ${columnsHTML}
    </div>`;
  }

  generateLayoutCSS(layoutType: string, layoutConfig: Record<string, any>): string {
    const layoutStyles = LayoutStyleFactory.generateStyles(layoutType, layoutConfig);
    
    // Convert React style objects to CSS
    let css = '';
    
    // Container styles
    css += `.layout-container {
      ${this.styleObjectToCSS(layoutStyles.containerStyles)}
    }\n`;

    // Column styles
    Object.entries(layoutStyles.columnStyles).forEach(([columnId, styles]) => {
      css += `.layout-column-${columnId} {
        ${this.styleObjectToCSS(styles)}
      }\n`;
    });

    // Zone-specific styles
    Object.entries(layoutStyles.zoneStyles).forEach(([zoneId, zoneStyle]) => {
      css += `[data-zone="${zoneId}"] {
        background-color: ${zoneStyle.backgroundColor};
        color: ${zoneStyle.textColor};
        padding: ${zoneStyle.padding || '0'};
        border-radius: ${zoneStyle.borderRadius || '0'};
      }\n`;

      // Override section title colors for contrast zones
      if (zoneStyle.contrast) {
        css += `[data-zone="${zoneId}"] .section-title {
          color: ${zoneStyle.textColor};
          border-bottom-color: ${zoneStyle.textColor}30;
        }\n`;
        
        css += `[data-zone="${zoneId}"] .item-title {
          color: ${zoneStyle.textColor};
        }\n`;
        
        css += `[data-zone="${zoneId}"] .item-subtitle {
          color: ${zoneStyle.textColor}CC;
        }\n`;
      }
    });

    return css;
  }

  private styleObjectToCSS(styleObj: Record<string, any>): string {
    return Object.entries(styleObj)
      .map(([key, value]) => {
        // Convert camelCase to kebab-case
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${value};`;
      })
      .join('\n  ');
  }
}
