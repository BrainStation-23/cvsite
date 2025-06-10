
import { Document, Paragraph, TextRun, AlignmentType, BorderStyle, WidthType, Table, TableRow, TableCell } from 'docx';
import { LayoutStyleFactory } from '@/components/admin/cv-templates/layout/LayoutStyleFactory';
import { getLayoutConfiguration } from '@/components/admin/cv-templates/layout/LayoutConfigurations';

export class DocumentStyler {
  private layoutConfig: Record<string, any> = {};
  private zoneStyles: Record<string, any> = {};

  setLayoutConfig(layoutConfig: Record<string, any>): void {
    this.layoutConfig = layoutConfig;
    
    // Generate zone styles using the same system as HTML export
    const layoutType = layoutConfig.layoutType || 'single-column';
    const styleResult = LayoutStyleFactory.generateStyles(layoutType, layoutConfig);
    this.zoneStyles = styleResult.zoneStyles;
    
    console.log('DOCX Styler - Layout config set:', {
      layoutType,
      primaryColor: layoutConfig.primaryColor,
      sidebarBg: layoutConfig.sidebarBg,
      zoneStyles: this.zoneStyles
    });
  }

  createDocumentStructure(
    children: any[], 
    orientation: string, 
    baseStyles: any
  ): Document {
    const pageWidth = orientation === 'portrait' ? 11906 : 16838; // A4 width in twips
    const pageHeight = orientation === 'portrait' ? 16838 : 11906; // A4 height in twips
    const margin = Math.max((this.layoutConfig.margin || baseStyles?.margin || 20) * 56.7, 1134); // Use layout margin
    
    console.log('DOCX Styler - Document structure:', {
      orientation,
      margin: this.layoutConfig.margin || baseStyles?.margin || 20,
      marginTwips: margin
    });
    
    return new Document({
      sections: [{
        properties: {
          page: {
            size: {
              orientation: orientation === 'landscape' ? 'landscape' : 'portrait',
              width: pageWidth,
              height: pageHeight
            },
            margin: {
              top: margin,
              right: margin,
              bottom: margin,
              left: margin
            }
          }
        },
        children
      }]
    });
  }

  createLayoutTable(
    leftElements: (Paragraph | Table)[],
    rightElements: (Paragraph | Table)[],
    layoutType: string,
    leftZone: string = 'main',
    rightZone: string = 'secondary'
  ): Table {
    const maxLength = Math.max(leftElements.length, rightElements.length);
    const rows: TableRow[] = [];

    // Get zone styles
    const leftZoneStyle = this.zoneStyles[leftZone] || {};
    const rightZoneStyle = this.zoneStyles[rightZone] || {};

    // Calculate widths based on layout type
    let leftWidth = 50;
    let rightWidth = 50;
    
    if (layoutType === 'sidebar') {
      leftWidth = 33;  // Sidebar
      rightWidth = 67; // Main content
    }

    console.log('DOCX Styler - Creating layout table:', {
      layoutType,
      leftZone,
      rightZone,
      leftZoneStyle,
      rightZoneStyle,
      leftWidth,
      rightWidth
    });

    for (let i = 0; i < maxLength; i++) {
      const leftCell = new TableCell({
        children: leftElements[i] ? [leftElements[i] as Paragraph] : [new Paragraph({ children: [] })],
        width: { size: leftWidth, type: WidthType.PERCENTAGE },
        margins: { 
          top: this.getTwips(this.layoutConfig.sectionSpacing || 8),
          bottom: this.getTwips(this.layoutConfig.sectionSpacing || 8),
          left: this.getTwips(this.layoutConfig.margin || 20, 0.5),
          right: this.getTwips(this.layoutConfig.columnGap || 10, 0.5)
        },
        shading: leftZoneStyle.backgroundColor && leftZoneStyle.backgroundColor !== 'transparent' ? {
          fill: this.parseColor(leftZoneStyle.backgroundColor)
        } : undefined,
        borders: {
          top: { style: BorderStyle.NONE, size: 0 },
          bottom: { style: BorderStyle.NONE, size: 0 },
          left: { style: BorderStyle.NONE, size: 0 },
          right: { style: BorderStyle.NONE, size: 0 }
        }
      });

      const rightCell = new TableCell({
        children: rightElements[i] ? [rightElements[i] as Paragraph] : [new Paragraph({ children: [] })],
        width: { size: rightWidth, type: WidthType.PERCENTAGE },
        margins: { 
          top: this.getTwips(this.layoutConfig.sectionSpacing || 8),
          bottom: this.getTwips(this.layoutConfig.sectionSpacing || 8),
          left: this.getTwips(this.layoutConfig.columnGap || 10, 0.5),
          right: this.getTwips(this.layoutConfig.margin || 20, 0.5)
        },
        shading: rightZoneStyle.backgroundColor && rightZoneStyle.backgroundColor !== 'transparent' ? {
          fill: this.parseColor(rightZoneStyle.backgroundColor)
        } : undefined,
        borders: {
          top: { style: BorderStyle.NONE, size: 0 },
          bottom: { style: BorderStyle.NONE, size: 0 },
          left: { style: BorderStyle.NONE, size: 0 },
          right: { style: BorderStyle.NONE, size: 0 }
        }
      });

      rows.push(new TableRow({ children: [leftCell, rightCell] }));
    }

    return new Table({
      rows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0 },
        bottom: { style: BorderStyle.NONE, size: 0 },
        left: { style: BorderStyle.NONE, size: 0 },
        right: { style: BorderStyle.NONE, size: 0 },
        insideHorizontal: { style: BorderStyle.NONE, size: 0 },
        insideVertical: { style: BorderStyle.NONE, size: 0 }
      }
    });
  }

  createFallbackContent(): Paragraph {
    return new Paragraph({
      children: [new TextRun("No content available")]
    });
  }

  createSectionTitle(title: string, baseStyles: any, zone: string = 'main'): Paragraph {
    const zoneStyle = this.zoneStyles[zone] || {};
    const isContrast = zoneStyle.contrast;
    
    // Use zone-specific colors or fallback to layout config colors
    const titleColor = isContrast 
      ? zoneStyle.textColor || '#ffffff'
      : this.layoutConfig.primaryColor || baseStyles?.primaryColor || '#1f2937';
    
    const borderColor = isContrast
      ? zoneStyle.textColor || '#ffffff'
      : this.layoutConfig.accentColor || baseStyles?.accentColor || '#3b82f6';

    console.log('DOCX Styler - Section title styling:', {
      title,
      zone,
      isContrast,
      titleColor,
      borderColor
    });

    return new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: this.getFontSize('subheading'),
          color: this.parseColor(titleColor),
          font: this.layoutConfig.primaryFont || 'Arial'
        })
      ],
      spacing: { 
        before: this.getTwips(this.layoutConfig.sectionSpacing || 16),
        after: this.getTwips(this.layoutConfig.itemSpacing || 8)
      },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 1,
          color: this.parseColor(borderColor)
        }
      }
    });
  }

  createItemTitle(text: string, baseStyles: any, zone: string = 'main'): Paragraph {
    const zoneStyle = this.zoneStyles[zone] || {};
    const isContrast = zoneStyle.contrast;
    
    const titleColor = isContrast 
      ? zoneStyle.textColor || '#ffffff'
      : this.layoutConfig.primaryColor || baseStyles?.primaryColor || '#1f2937';

    return new Paragraph({
      children: [
        new TextRun({
          text,
          bold: true,
          size: this.getFontSize('base'),
          color: this.parseColor(titleColor),
          font: this.layoutConfig.primaryFont || 'Arial'
        })
      ],
      spacing: { 
        before: this.getTwips(this.layoutConfig.itemSpacing || 8),
        after: this.getTwips(this.layoutConfig.itemSpacing || 4)
      }
    });
  }

  createItemSubtitle(text: string, baseStyles: any, zone: string = 'main'): Paragraph {
    const zoneStyle = this.zoneStyles[zone] || {};
    const isContrast = zoneStyle.contrast;
    
    const subtitleColor = isContrast 
      ? this.adjustColorOpacity(zoneStyle.textColor || '#ffffff', 0.8)
      : this.layoutConfig.secondaryColor || baseStyles?.secondaryColor || '#6b7280';

    return new Paragraph({
      children: [
        new TextRun({
          text,
          size: this.getFontSize('base'),
          color: this.parseColor(subtitleColor),
          italics: true,
          font: this.layoutConfig.primaryFont || 'Arial'
        })
      ],
      spacing: { after: this.getTwips(this.layoutConfig.itemSpacing || 4) }
    });
  }

  createRegularText(text: string, baseStyles: any, zone: string = 'main'): Paragraph {
    const zoneStyle = this.zoneStyles[zone] || {};
    const isContrast = zoneStyle.contrast;
    
    const textColor = isContrast 
      ? zoneStyle.textColor || '#ffffff'
      : '#000000';

    return new Paragraph({
      children: [
        new TextRun({
          text,
          size: this.getFontSize('base'),
          color: this.parseColor(textColor),
          font: this.layoutConfig.primaryFont || 'Arial'
        })
      ],
      spacing: { after: this.getTwips(this.layoutConfig.itemSpacing || 8) },
      alignment: AlignmentType.JUSTIFIED
    });
  }

  createPageBreak(): Paragraph {
    return new Paragraph({
      children: [],
      pageBreakBefore: true,
    });
  }

  private getTwips(value: number, multiplier: number = 1): number {
    return Math.round(value * multiplier * 56.7); // Convert mm to twips
  }

  private parseColor(color: string): string {
    if (!color) return '000000';
    
    // Handle CSS custom properties by using fallback colors
    if (color.startsWith('var(')) {
      const varName = color.match(/var\(([^)]+)\)/)?.[1];
      if (varName === '--primary-color') return this.parseColor(this.layoutConfig.primaryColor || '#1f2937');
      if (varName === '--secondary-color') return this.parseColor(this.layoutConfig.secondaryColor || '#6b7280');
      if (varName === '--accent-color') return this.parseColor(this.layoutConfig.accentColor || '#3b82f6');
      return '000000';
    }
    
    return color.replace('#', '');
  }

  private adjustColorOpacity(color: string, opacity: number): string {
    // Simple opacity adjustment - in a real implementation, you'd convert to rgba
    // For DOCX, we'll just return a slightly lighter version
    if (color === '#ffffff') {
      const grayValue = Math.round(255 * opacity).toString(16).padStart(2, '0');
      return `${grayValue}${grayValue}${grayValue}`;
    }
    return color;
  }

  private getFontSize(type: 'heading' | 'subheading' | 'base' = 'base'): number {
    const sizeMap = {
      heading: this.layoutConfig.headingSize || 16,
      subheading: this.layoutConfig.subheadingSize || 14,
      base: this.layoutConfig.baseFontSize || 12
    };
    return sizeMap[type] * 2; // Convert to half-points for DOCX
  }

  getZoneForSection(section: any): string {
    const placement = section.styling_config?.layout_placement || 'main';
    const layoutType = this.layoutConfig.layoutType || 'single-column';
    
    if (placement === 'sidebar') {
      if (layoutType === 'sidebar') return 'sidebar';
      if (layoutType === 'two-column') return 'secondary';
    }
    
    return 'main';
  }
}
