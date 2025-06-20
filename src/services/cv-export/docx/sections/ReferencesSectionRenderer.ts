
import { Paragraph, Table, TextRun } from 'docx';
import { DocumentStyler } from '../DocumentStyler';
import { FieldMaskingService } from '../FieldMaskingService';
import { FieldVisibilityService } from '../FieldVisibilityService';

interface Reference {
  id: string;
  name: string;
  designation: string;
  company: string;
  email?: string;
  phone?: string;
}

export class ReferencesSectionRenderer {
  private styler!: DocumentStyler;
  private maskingService!: FieldMaskingService;
  private visibilityService!: FieldVisibilityService;

  setStyler(styler: DocumentStyler): void {
    this.styler = styler;
  }

  setMaskingService(maskingService: FieldMaskingService): void {
    this.maskingService = maskingService;
  }

  setVisibilityService(visibilityService: FieldVisibilityService): void {
    this.visibilityService = visibilityService;
  }

  render(references: Reference[], styles: any): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];
    
    if (!references || references.length === 0) {
      return elements;
    }

    // Add references content
    references.forEach((reference, index) => {
      if (index > 0) {
        // Add spacing between references using a regular paragraph
        elements.push(new Paragraph({
          children: [],
          spacing: { after: styles?.spacing?.itemMargin * 56.7 || 450 }
        }));
      }

      // Reference name
      elements.push(new Paragraph({
        children: [
          new TextRun({
            text: reference.name,
            bold: true,
            size: this.styler.getFontSize('base'),
            color: this.styler.parseColor(styles?.colors?.primary || '#000000')
          }),
        ],
        spacing: { after: 100 },
      }));

      // Designation
      elements.push(new Paragraph({
        children: [
          new TextRun({
            text: reference.designation,
            size: this.styler.getFontSize('base'),
            color: this.styler.parseColor(styles?.colors?.text || '#000000')
          }),
        ],
        spacing: { after: 50 },
      }));

      // Company
      elements.push(new Paragraph({
        children: [
          new TextRun({
            text: reference.company,
            size: this.styler.getFontSize('base'),
            color: this.styler.parseColor(styles?.colors?.text || '#000000')
          }),
        ],
        spacing: { after: 50 },
      }));

      // Contact information
      if (reference.email || reference.phone) {
        const contactInfo = [];
        if (reference.email) {
          contactInfo.push(`Email: ${reference.email}`);
        }
        if (reference.phone) {
          contactInfo.push(`Phone: ${reference.phone}`);
        }

        elements.push(new Paragraph({
          children: [
            new TextRun({
              text: contactInfo.join(' | '),
              size: this.styler.getFontSize('base') * 0.9,
              italics: true,
              color: this.styler.parseColor(styles?.colors?.secondary || '#666666')
            }),
          ],
          spacing: { after: 100 },
        }));
      }
    });

    return elements;
  }
}
