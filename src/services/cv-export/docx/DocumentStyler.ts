import { Document, Paragraph, TextRun, AlignmentType, BorderStyle, WidthType } from 'docx';

export class DocumentStyler {
  createDocumentStructure(
    children: any[], 
    orientation: string, 
    baseStyles: any
  ): Document {
    const pageWidth = orientation === 'portrait' ? 11906 : 16838; // A4 width in twips
    const pageHeight = orientation === 'portrait' ? 16838 : 11906; // A4 height in twips
    const margin = Math.max((baseStyles.margin || 20) * 56.7, 1134); // Convert mm to twips, minimum 1 inch
    
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

  createFallbackContent(): Paragraph {
    return new Paragraph({
      children: [new TextRun("No content available")]
    });
  }

  createSectionTitle(title: string, baseStyles: any): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: (baseStyles?.subheadingSize || 14) * 2,
          color: this.parseColor(baseStyles?.primaryColor || '#1f2937')
        })
      ],
      spacing: { before: 240, after: 120 },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 1,
          color: this.parseColor(baseStyles?.accentColor || '#3b82f6')
        }
      }
    });
  }

  createItemTitle(text: string, baseStyles: any): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text,
          bold: true,
          size: (baseStyles?.baseFontSize || 12) * 2,
          color: this.parseColor(baseStyles?.primaryColor || '#1f2937')
        })
      ],
      spacing: { before: 120, after: 60 }
    });
  }

  createItemSubtitle(text: string, baseStyles: any): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text,
          size: (baseStyles?.baseFontSize || 12) * 2,
          color: this.parseColor(baseStyles?.secondaryColor || '#6b7280'),
          italics: true
        })
      ],
      spacing: { after: 60 }
    });
  }

  createRegularText(text: string, baseStyles: any): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text,
          size: (baseStyles?.baseFontSize || 12) * 2
        })
      ],
      spacing: { after: 120 },
      alignment: AlignmentType.JUSTIFIED
    });
  }

  createPageBreak(): Paragraph {
    return new Paragraph({
      children: [],
      pageBreakBefore: true,
    });
  }

  parseColor(color: string): string {
    if (!color) return '000000';
    return color.replace('#', '');
  }

  getFontSize(baseStyles: any, type: 'heading' | 'subheading' | 'base' = 'base'): number {
    const sizeMap = {
      heading: baseStyles?.headingSize || 16,
      subheading: baseStyles?.subheadingSize || 14,
      base: baseStyles?.baseFontSize || 12
    };
    return sizeMap[type] * 2; // Convert to half-points for DOCX
  }
}
