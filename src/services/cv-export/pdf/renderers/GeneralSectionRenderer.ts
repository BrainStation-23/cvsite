
import { BasePDFRenderer } from './BasePDFRenderer';
import { RichTextParser } from '../utils/RichTextParser';
import { RichTextRenderer } from '../utils/RichTextRenderer';
import { ImageProcessor } from '../utils/ImageProcessor';

export class GeneralSectionRenderer extends BasePDFRenderer {
  private richTextParser: RichTextParser;
  private richTextRenderer: RichTextRenderer;
  private imageProcessor: ImageProcessor;

  constructor(doc: any, styler: any, maskingService: any, visibilityService: any) {
    super(doc, styler, maskingService, visibilityService);
    this.richTextParser = new RichTextParser();
    this.richTextRenderer = new RichTextRenderer(this.styler);
    this.imageProcessor = new ImageProcessor(this.doc);
  }

  async render(profile: any, x: number, y: number, width: number, sectionType: string): Promise<number> {
    let currentY = y;
    
    // Profile Image with high resolution
    if (profile.profile_image && this.visibilityService.isFieldVisible('profile_image', 'general')) {
      try {
        const imageHeight = await this.imageProcessor.addProfileImageHighRes(profile.profile_image, x, currentY, width);
        currentY += imageHeight + 10;
      } catch (error) {
        console.warn('Failed to load profile image:', error);
      }
    }

    // Name
    const showFirstName = this.visibilityService.isFieldVisible('first_name', 'general');
    const showLastName = this.visibilityService.isFieldVisible('last_name', 'general');
    
    if (showFirstName || showLastName) {
      const firstName = showFirstName ? this.maskingService.applyMasking(profile.first_name, 'first_name', 'general') : '';
      const lastName = showLastName ? this.maskingService.applyMasking(profile.last_name, 'last_name', 'general') : '';
      
      if (firstName || lastName) {
        const nameHeight = this.styler.addText(
          `${firstName || ''} ${lastName || ''}`.trim(),
          x, currentY, width,
          { 
            fontSize: this.styler.getFontSize('title'),
            bold: true,
            align: 'center'
          }
        );
        currentY += nameHeight + 5;
      }
    }

    // Job Title/Designation
    if (this.visibilityService.isFieldVisible('designation', 'general')) {
      const designation = this.maskingService.applyMasking(profile.designation?.name || profile.job_title, 'designation', 'general');
      if (designation) {
        const designationHeight = this.styler.addText(
          designation,
          x, currentY, width,
          { 
            fontSize: this.styler.getFontSize('subheading'),
            align: 'center'
          }
        );
        currentY += designationHeight + 5;
      }
    }

    // Contact Information
    const contactInfo: string[] = [];
    
    if (this.visibilityService.isFieldVisible('email', 'general')) {
      const email = this.maskingService.applyMasking(profile.email, 'email', 'general');
      if (email) contactInfo.push(`Email: ${email}`);
    }
    
    if (this.visibilityService.isFieldVisible('phone', 'general')) {
      const phone = this.maskingService.applyMasking(profile.phone, 'phone', 'general');
      if (phone) contactInfo.push(`Phone: ${phone}`);
    }
    
    if (this.visibilityService.isFieldVisible('location', 'general')) {
      const location = this.maskingService.applyMasking(profile.location, 'location', 'general');
      if (location) contactInfo.push(`Location: ${location}`);
    }

    if (contactInfo.length > 0) {
      const contactHeight = this.styler.addText(
        contactInfo.join(' | '),
        x, currentY, width,
        { align: 'center' }
      );
      currentY += contactHeight + 10;
    }

    // Biography/Summary
    if (this.visibilityService.isFieldVisible('biography', 'general')) {
      const biography = this.maskingService.applyMasking(profile.biography || profile.summary, 'biography', 'general');
      if (biography) {
        const cleanBiography = this.richTextParser.parseRichText(biography);
        const bioHeight = this.richTextRenderer.renderRichTextContent(cleanBiography, x, currentY, width);
        currentY += bioHeight + 5;
      }
    }

    return currentY - y;
  }
}
