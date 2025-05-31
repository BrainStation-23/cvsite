import PptxGenJS from 'pptxgenjs';
import { FieldMaskingService } from '../docx/FieldMaskingService';
import { FieldVisibilityService } from '../docx/FieldVisibilityService';
import { PPTSlideRenderer } from './PPTSlideRenderer';

export class PPTDocumentBuilder {
  private pres: PptxGenJS;
  private maskingService: FieldMaskingService;
  private visibilityService: FieldVisibilityService;
  private slideRenderer: PPTSlideRenderer;

  constructor() {
    this.pres = new PptxGenJS();
    this.maskingService = new FieldMaskingService();
    this.visibilityService = new FieldVisibilityService();
    this.slideRenderer = new PPTSlideRenderer(this.pres);
  }

  async build(
    profile: any,
    sections: any[],
    fieldMappings: any[],
    styles: any,
    layoutConfig: any = {}
  ): Promise<Blob> {
    console.log('PPTDocumentBuilder - Starting build with profile:', profile);
    
    // Configure services
    this.maskingService.setFieldMappings(fieldMappings);
    this.maskingService.setSectionConfigs(sections);
    this.visibilityService.setFieldMappings(fieldMappings);
    this.visibilityService.setSectionConfigs(sections);
    
    // Set services for the slide renderer
    this.slideRenderer.setMaskingService(this.maskingService);
    this.slideRenderer.setVisibilityService(this.visibilityService);
    
    // Configure presentation properties
    this.pres.layout = 'LAYOUT_16x9';
    this.pres.theme = {
      headFontFace: 'Arial',
      bodyFontFace: 'Arial'
    };

    // Sort sections by display order
    const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);
    
    // Create title slide
    await this.createTitleSlide(profile, styles);
    
    // Create content slides based on sections
    for (const section of sortedSections) {
      const sectionData = this.getSectionData(profile, section.section_type);
      if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) {
        continue;
      }

      await this.slideRenderer.renderSection(section, sectionData, styles);
    }

    // Generate and return the blob using the correct API
    return new Promise((resolve, reject) => {
      this.pres.write('blob')
        .then((data: Blob) => {
          resolve(data);
        })
        .catch((error: any) => {
          console.error('Error generating PPT blob:', error);
          reject(error);
        });
    });
  }

  private async createTitleSlide(profile: any, styles: any): Promise<void> {
    const slide = this.pres.addSlide();
    
    // Background color
    const bgColor = styles?.baseStyles?.backgroundColor || '#ffffff';
    slide.background = { color: bgColor };

    // Name
    const showFirstName = this.visibilityService.isFieldVisible('first_name', 'general');
    const showLastName = this.visibilityService.isFieldVisible('last_name', 'general');
    
    if (showFirstName || showLastName) {
      const firstName = showFirstName ? this.maskingService.applyMasking(profile.first_name, 'first_name', 'general') : '';
      const lastName = showLastName ? this.maskingService.applyMasking(profile.last_name, 'last_name', 'general') : '';
      
      if (firstName || lastName) {
        slide.addText(`${firstName || ''} ${lastName || ''}`.trim(), {
          x: 1,
          y: 2,
          w: 8,
          h: 1,
          fontSize: 32,
          fontFace: 'Arial',
          color: styles?.baseStyles?.primaryColor || '#1f2937',
          bold: true,
          align: 'center'
        });
      }
    }

    // Job Title/Designation
    if (this.visibilityService.isFieldVisible('designation', 'general')) {
      const designation = this.maskingService.applyMasking(profile.designation?.name || profile.job_title, 'designation', 'general');
      if (designation) {
        slide.addText(designation, {
          x: 1,
          y: 3.2,
          w: 8,
          h: 0.8,
          fontSize: 18,
          fontFace: 'Arial',
          color: styles?.baseStyles?.secondaryColor || '#6b7280',
          align: 'center'
        });
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
      slide.addText(contactInfo.join(' | '), {
        x: 1,
        y: 4.2,
        w: 8,
        h: 0.6,
        fontSize: 14,
        fontFace: 'Arial',
        color: '#374151',
        align: 'center'
      });
    }

    // Biography/Summary
    if (this.visibilityService.isFieldVisible('biography', 'general')) {
      const biography = this.maskingService.applyMasking(profile.biography || profile.summary, 'biography', 'general');
      if (biography) {
        const cleanBiography = this.cleanHtmlContent(biography);
        slide.addText(cleanBiography, {
          x: 1,
          y: 5.2,
          w: 8,
          h: 1.5,
          fontSize: 12,
          fontFace: 'Arial',
          color: '#374151',
          align: 'left',
          valign: 'top'
        });
      }
    }
  }

  private getSectionData(profile: any, sectionType: string): any {
    switch (sectionType) {
      case 'general':
        return profile;
      case 'experience':
        return profile.experiences || [];
      case 'education':
        return profile.education || [];
      case 'projects':
        return profile.projects || [];
      case 'technical_skills':
        return profile.technical_skills || [];
      case 'specialized_skills':
        return profile.specialized_skills || [];
      case 'training':
        return profile.trainings || [];
      case 'achievements':
        return profile.achievements || [];
      default:
        return null;
    }
  }

  private cleanHtmlContent(content: string): string {
    if (!content) return '';
    
    return content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
}
