
import { Paragraph, Table, TextRun, AlignmentType, ImageRun } from 'docx';
import { BaseSectionRenderer } from './BaseSectionRenderer';
import { RichTextProcessor } from '../RichTextProcessor';

export class GeneralSectionRenderer extends BaseSectionRenderer {
  private richTextProcessor: RichTextProcessor;

  constructor() {
    super();
    this.richTextProcessor = new RichTextProcessor();
  }

  async render(profile: any, styles: any): Promise<(Paragraph | Table)[]> {
    const elements: (Paragraph | Table)[] = [];
    const baseStyles = styles?.baseStyles || {};
    
    try {
      // Profile Image (if available and not masked)
      const profileImageValue = this.maskingService.applyMasking(profile.profile_image, 'profile_image', 'general');
      if (profileImageValue && profileImageValue !== '***') {
        try {
          const response = await fetch(profileImageValue);
          const imageBuffer = await response.arrayBuffer();
          
          elements.push(new Paragraph({
            children: [
              new ImageRun({
                data: new Uint8Array(imageBuffer),
                transformation: {
                  width: 100,
                  height: 100,
                },
                type: 'jpg'
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
          }));
        } catch (imageError) {
          console.error('Error loading profile image:', imageError);
        }
      }

      // Name
      const firstName = this.maskingService.applyMasking(profile.first_name, 'first_name', 'general');
      const lastName = this.maskingService.applyMasking(profile.last_name, 'last_name', 'general');
      
      if (firstName || lastName) {
        elements.push(new Paragraph({
          children: [
            new TextRun({
              text: `${firstName || ''} ${lastName || ''}`.trim(),
              bold: true,
              size: this.styler.getFontSize(baseStyles, 'heading'),
              color: this.styler.parseColor(baseStyles.primaryColor || '#1f2937')
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 }
        }));
      }

      // Job Title/Designation
      const designation = this.maskingService.applyMasking(profile.designation?.name || profile.job_title, 'designation', 'general');
      if (designation) {
        elements.push(new Paragraph({
          children: [
            new TextRun({
              text: designation,
              size: this.styler.getFontSize(baseStyles, 'subheading'),
              color: this.styler.parseColor(baseStyles.secondaryColor || '#6b7280')
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 }
        }));
      }

      // Contact Information
      const contactInfo: string[] = [];
      const email = this.maskingService.applyMasking(profile.email, 'email', 'general');
      const phone = this.maskingService.applyMasking(profile.phone, 'phone', 'general');
      const location = this.maskingService.applyMasking(profile.location, 'location', 'general');
      
      if (email) contactInfo.push(`Email: ${email}`);
      if (phone) contactInfo.push(`Phone: ${phone}`);
      if (location) contactInfo.push(`Location: ${location}`);

      if (contactInfo.length > 0) {
        elements.push(new Paragraph({
          children: [
            new TextRun({
              text: contactInfo.join(' | '),
              size: this.styler.getFontSize(baseStyles, 'base')
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 }
        }));
      }

      // Biography/Summary with rich text parsing and masking
      const biography = this.maskingService.applyMasking(profile.biography || profile.summary, 'biography', 'general');
      if (biography) {
        const richTextParagraphs = this.richTextProcessor.parseRichTextToDocx(biography, baseStyles);
        elements.push(...richTextParagraphs);
      }
    } catch (error) {
      console.error('Error rendering general section:', error);
    }

    return elements;
  }
}
