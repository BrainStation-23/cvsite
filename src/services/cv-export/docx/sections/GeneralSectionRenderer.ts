
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
      console.log('GeneralSectionRenderer - Starting render with profile:', profile);
      
      // Profile Image (if visible and not masked)
      if (this.isFieldVisible('profile_image', 'general')) {
        const profileImageValue = this.applyFieldMasking(profile.profile_image, 'profile_image', 'general');
        console.log('Profile image after masking:', profileImageValue);
        
        if (profileImageValue && profileImageValue !== '***' && typeof profileImageValue === 'string' && profileImageValue.startsWith('http')) {
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
      }

      // Name
      const showFirstName = this.isFieldVisible('first_name', 'general');
      const showLastName = this.isFieldVisible('last_name', 'general');
      
      console.log('Name visibility - first:', showFirstName, 'last:', showLastName);
      
      if (showFirstName || showLastName) {
        const firstName = showFirstName ? this.applyFieldMasking(profile.first_name, 'first_name', 'general') : '';
        const lastName = showLastName ? this.applyFieldMasking(profile.last_name, 'last_name', 'general') : '';
        
        console.log('Name after masking - first:', firstName, 'last:', lastName);
        
        if (firstName || lastName) {
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: `${firstName || ''} ${lastName || ''}`.trim(),
                bold: true,
                size: this.styler.getFontSize('heading'),
                color: this.styler.parseColor(baseStyles.primaryColor || '#1f2937')
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
          }));
        }
      }

      // Job Title/Designation
      if (this.isFieldVisible('designation', 'general')) {
        const designation = this.applyFieldMasking(profile.designation?.name || profile.job_title, 'designation', 'general');
        if (designation) {
          elements.push(new Paragraph({
            children: [
              new TextRun({
                text: designation,
                size: this.styler.getFontSize('subheading'),
                color: this.styler.parseColor(baseStyles.secondaryColor || '#6b7280')
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
          }));
        }
      }

      // Contact Information
      const contactInfo: string[] = [];
      
      if (this.isFieldVisible('email', 'general')) {
        const email = this.applyFieldMasking(profile.email, 'email', 'general');
        if (email) contactInfo.push(`Email: ${email}`);
      }
      
      if (this.isFieldVisible('phone', 'general')) {
        const phone = this.applyFieldMasking(profile.phone, 'phone', 'general');
        if (phone) contactInfo.push(`Phone: ${phone}`);
      }
      
      if (this.isFieldVisible('location', 'general')) {
        const location = this.applyFieldMasking(profile.location, 'location', 'general');
        if (location) contactInfo.push(`Location: ${location}`);
      }

      if (contactInfo.length > 0) {
        elements.push(new Paragraph({
          children: [
            new TextRun({
              text: contactInfo.join(' | '),
              size: this.styler.getFontSize('base')
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 }
        }));
      }

      // Biography/Summary with rich text parsing and masking
      if (this.isFieldVisible('biography', 'general')) {
        const biography = this.applyFieldMasking(profile.biography || profile.summary, 'biography', 'general');
        console.log('Biography after masking:', biography);
        
        if (biography) {
          const richTextParagraphs = this.richTextProcessor.parseRichTextToDocx(biography, baseStyles);
          elements.push(...richTextParagraphs);
        }
      }
    } catch (error) {
      console.error('Error rendering general section:', error);
    }

    return elements;
  }
}
