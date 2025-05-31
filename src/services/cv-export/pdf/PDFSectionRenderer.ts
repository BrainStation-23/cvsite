import jsPDF from 'jspdf';
import { PDFStyler } from './PDFStyler';
import { FieldMaskingService } from '../docx/FieldMaskingService';
import { FieldVisibilityService } from '../docx/FieldVisibilityService';

export class PDFSectionRenderer {
  private doc: jsPDF;
  private styler: PDFStyler;
  private maskingService!: FieldMaskingService;
  private visibilityService!: FieldVisibilityService;

  constructor(doc: jsPDF, styler: PDFStyler) {
    this.doc = doc;
    this.styler = styler;
  }

  setMaskingService(service: FieldMaskingService): void {
    this.maskingService = service;
  }

  setVisibilityService(service: FieldVisibilityService): void {
    this.visibilityService = service;
  }

  async render(
    section: any,
    sectionData: any,
    styles: any,
    x: number,
    y: number,
    width: number
  ): Promise<number> {
    let currentY = y;
    
    // Get section title
    const sectionTitle = this.maskingService.getSectionTitle(section);
    
    // Add section title
    const titleHeight = this.styler.addSectionTitle(sectionTitle, x, currentY, width);
    currentY += titleHeight + 5;

    // Render based on section type
    switch (section.section_type) {
      case 'general':
        currentY += await this.renderGeneralSection(sectionData, x, currentY, width, styles);
        break;
      case 'experience':
        currentY += await this.renderExperienceSection(sectionData, x, currentY, width, section.section_type);
        break;
      case 'education':
        currentY += await this.renderEducationSection(sectionData, x, currentY, width, section.section_type);
        break;
      case 'projects':
        currentY += await this.renderProjectsSection(sectionData, x, currentY, width, section.section_type);
        break;
      case 'technical_skills':
      case 'specialized_skills':
        currentY += await this.renderSkillsSection(sectionData, x, currentY, width, section.section_type);
        break;
      case 'training':
        currentY += await this.renderTrainingSection(sectionData, x, currentY, width, section.section_type);
        break;
      case 'achievements':
        currentY += await this.renderAchievementsSection(sectionData, x, currentY, width, section.section_type);
        break;
      default:
        console.warn(`Unknown section type: ${section.section_type}`);
    }

    return currentY - y;
  }

  private async renderGeneralSection(profile: any, x: number, y: number, width: number, styles: any): Promise<number> {
    let currentY = y;
    
    // Profile Image
    if (profile.profile_image && this.visibilityService.isFieldVisible('profile_image', 'general')) {
      try {
        const imageHeight = await this.addProfileImage(profile.profile_image, x, currentY, width);
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
        const cleanBiography = this.cleanHtmlContent(biography);
        const bioHeight = this.styler.addText(cleanBiography, x, currentY, width);
        currentY += bioHeight + 5;
      }
    }

    return currentY - y;
  }

  private async renderExperienceSection(experiences: any[], x: number, y: number, width: number, sectionType: string): Promise<number> {
    let currentY = y;
    
    for (const experience of experiences) {
      // Company Name and Designation on same line
      const showCompanyName = this.visibilityService.isFieldVisible('company_name', sectionType);
      const showDesignation = this.visibilityService.isFieldVisible('designation', sectionType);
      
      if (showCompanyName || showDesignation) {
        let titleLine = '';
        
        if (showDesignation) {
          const designation = this.maskingService.applyMasking(experience.designation, 'designation', sectionType);
          titleLine = designation || '';
        }
        
        if (showCompanyName) {
          const companyName = this.maskingService.applyMasking(experience.company_name, 'company_name', sectionType);
          if (companyName) {
            titleLine += (titleLine ? ' at ' : '') + companyName;
          }
        }
        
        if (titleLine) {
          const titleHeight = this.styler.addText(titleLine, x, currentY, width, { bold: true });
          currentY += titleHeight + 2;
        }
      }

      // Date Range
      if (this.visibilityService.isFieldVisible('start_date', sectionType) || this.visibilityService.isFieldVisible('end_date', sectionType)) {
        const dateRange = this.formatDateRange(experience.start_date, experience.end_date, experience.is_current);
        if (dateRange) {
          const maskedDateRange = this.maskingService.applyMasking(dateRange, 'date_range', sectionType);
          const dateHeight = this.styler.addText(maskedDateRange, x, currentY, width, { 
            fontSize: this.styler.getFontSize('small'),
            italic: true 
          });
          currentY += dateHeight + 3;
        }
      }

      // Description
      if (this.visibilityService.isFieldVisible('description', sectionType)) {
        const description = this.maskingService.applyMasking(experience.description, 'description', sectionType);
        if (description) {
          const cleanDescription = this.cleanHtmlContent(description);
          const descHeight = this.renderBulletPoints(cleanDescription, x, currentY, width);
          currentY += descHeight + 5;
        }
      }

      currentY += 10; // Space between experiences
    }

    return currentY - y;
  }

  private async renderProjectsSection(projects: any[], x: number, y: number, width: number, sectionType: string): Promise<number> {
    let currentY = y;
    
    for (const project of projects) {
      // Project Name
      if (this.visibilityService.isFieldVisible('name', sectionType)) {
        const name = this.maskingService.applyMasking(project.name, 'name', sectionType);
        if (name) {
          const nameHeight = this.styler.addText(name, x, currentY, width, { bold: true });
          currentY += nameHeight + 2;
        }
      }

      // Role and Date Range on same line
      const showRole = this.visibilityService.isFieldVisible('role', sectionType);
      const showDateRange = this.visibilityService.isFieldVisible('date_range', sectionType);
      
      if (showRole || showDateRange) {
        let subtitleLine = '';
        
        if (showRole) {
          const role = this.maskingService.applyMasking(project.role, 'role', sectionType);
          subtitleLine = role || '';
        }
        
        if (showDateRange && (project.start_date || project.end_date)) {
          const dateRange = this.formatDateRange(project.start_date, project.end_date, project.is_current);
          if (dateRange) {
            const maskedDateRange = this.maskingService.applyMasking(dateRange, 'date_range', sectionType);
            subtitleLine += (subtitleLine ? ' • ' : '') + maskedDateRange;
          }
        }
        
        if (subtitleLine) {
          const subtitleHeight = this.styler.addText(subtitleLine, x, currentY, width, { 
            fontSize: this.styler.getFontSize('small'),
            italic: true 
          });
          currentY += subtitleHeight + 3;
        }
      }

      // Description (convert rich text to plain text)
      if (this.visibilityService.isFieldVisible('description', sectionType)) {
        const description = this.maskingService.applyMasking(project.description, 'description', sectionType);
        if (description) {
          const cleanDescription = this.cleanHtmlContent(description);
          const descHeight = this.styler.addText(cleanDescription, x, currentY, width);
          currentY += descHeight + 3;
        }
      }

      // Technologies Used
      if (this.visibilityService.isFieldVisible('technologies_used', sectionType)) {
        const technologies = this.maskingService.applyMasking(project.technologies_used, 'technologies_used', sectionType);
        if (technologies && Array.isArray(technologies) && technologies.length > 0) {
          const techText = `Technologies: ${technologies.join(', ')}`;
          const techHeight = this.styler.addText(techText, x, currentY, width, { 
            fontSize: this.styler.getFontSize('small') 
          });
          currentY += techHeight + 3;
        }
      }

      currentY += 10; // Space between projects
    }

    return currentY - y;
  }

  private async addProfileImage(imageUrl: string, x: number, y: number, width: number): Promise<number> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          // Create canvas to convert image to base64
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set canvas size (maintain aspect ratio)
          const maxWidth = 40;
          const maxHeight = 50;
          let { width: imgWidth, height: imgHeight } = img;
          
          // Calculate scaled dimensions
          const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
          imgWidth = imgWidth * ratio;
          imgHeight = imgHeight * ratio;
          
          canvas.width = imgWidth;
          canvas.height = imgHeight;
          
          // Draw image to canvas
          ctx?.drawImage(img, 0, 0, imgWidth, imgHeight);
          
          // Get base64 data
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          // Add image to PDF (centered)
          const imageX = x + (width - imgWidth) / 2;
          this.doc.addImage(dataUrl, 'JPEG', imageX, y, imgWidth, imgHeight);
          
          resolve(imgHeight);
        } catch (error) {
          console.warn('Error processing profile image:', error);
          resolve(0);
        }
      };
      
      img.onerror = () => {
        console.warn('Failed to load profile image');
        resolve(0);
      };
      
      img.src = imageUrl;
    });
  }

  private async renderEducationSection(education: any[], x: number, y: number, width: number, sectionType: string): Promise<number> {
    let currentY = y;
    
    for (const edu of education) {
      // Degree
      if (this.visibilityService.isFieldVisible('degree', sectionType)) {
        const degree = this.maskingService.applyMasking(edu.degree?.name || edu.degree, 'degree', sectionType);
        if (degree) {
          const degreeHeight = this.styler.addText(degree, x, currentY, width, { bold: true });
          currentY += degreeHeight;
        }
      }

      // University
      if (this.visibilityService.isFieldVisible('university', sectionType)) {
        const university = this.maskingService.applyMasking(edu.university?.name || edu.university, 'university', sectionType);
        if (university) {
          const uniHeight = this.styler.addText(university, x, currentY, width);
          currentY += uniHeight;
        }
      }

      // Date Range
      if (this.visibilityService.isFieldVisible('start_date', sectionType) || this.visibilityService.isFieldVisible('graduation_date', sectionType)) {
        const dateRange = this.formatDateRange(edu.start_date, edu.graduation_date, false);
        if (dateRange) {
          const dateHeight = this.styler.addText(dateRange, x, currentY, width, { fontSize: this.styler.getFontSize('small') });
          currentY += dateHeight;
        }
      }

      currentY += 10; // Space between education entries
    }

    return currentY - y;
  }

  private async renderSkillsSection(skills: any[], x: number, y: number, width: number, sectionType: string): Promise<number> {
    let currentY = y;
    
    for (const skill of skills) {
      // Skill Name
      if (this.visibilityService.isFieldVisible('name', sectionType)) {
        const name = this.maskingService.applyMasking(skill.name, 'name', sectionType);
        if (name) {
          const nameHeight = this.styler.addText(`• ${name}`, x, currentY, width);
          currentY += nameHeight;
        }
      }
    }

    return currentY - y;
  }

  private async renderTrainingSection(trainings: any[], x: number, y: number, width: number, sectionType: string): Promise<number> {
    let currentY = y;
    
    for (const training of trainings) {
      // Training Name
      if (this.visibilityService.isFieldVisible('name', sectionType)) {
        const name = this.maskingService.applyMasking(training.name, 'name', sectionType);
        if (name) {
          const nameHeight = this.styler.addText(name, x, currentY, width, { bold: true });
          currentY += nameHeight;
        }
      }

      // Institution
      if (this.visibilityService.isFieldVisible('institution', sectionType)) {
        const institution = this.maskingService.applyMasking(training.institution, 'institution', sectionType);
        if (institution) {
          const instHeight = this.styler.addText(institution, x, currentY, width);
          currentY += instHeight;
        }
      }

      currentY += 10; // Space between trainings
    }

    return currentY - y;
  }

  private async renderAchievementsSection(achievements: any[], x: number, y: number, width: number, sectionType: string): Promise<number> {
    let currentY = y;
    
    for (const achievement of achievements) {
      // Title
      if (this.visibilityService.isFieldVisible('title', sectionType)) {
        const title = this.maskingService.applyMasking(achievement.title, 'title', sectionType);
        if (title) {
          const titleHeight = this.styler.addText(title, x, currentY, width, { bold: true });
          currentY += titleHeight;
        }
      }

      // Description
      if (this.visibilityService.isFieldVisible('description', sectionType)) {
        const description = this.maskingService.applyMasking(achievement.description, 'description', sectionType);
        if (description) {
          const descHeight = this.styler.addText(description, x, currentY, width);
          currentY += descHeight;
        }
      }

      currentY += 10; // Space between achievements
    }

    return currentY - y;
  }

  private formatDateRange(startDate: string, endDate: string, isCurrent: boolean): string {
    const start = startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
    const end = isCurrent ? 'Present' : (endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '');
    
    if (start && end) {
      return `${start} - ${end}`;
    } else if (start) {
      return start;
    } else if (end) {
      return end;
    }
    return '';
  }

  private cleanHtmlContent(content: string): string {
    if (!content) return '';
    
    // Remove HTML tags and decode entities
    const cleaned = content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return cleaned;
  }

  private renderBulletPoints(content: string, x: number, y: number, width: number): number {
    if (!content) return 0;
    
    let currentY = y;
    
    // Check if content contains HTML list tags
    if (content.includes('<ul>') || content.includes('<ol>')) {
      // Extract list items
      const listItemRegex = /<li>(.*?)<\/li>/gi;
      const matches = content.matchAll(listItemRegex);
      
      for (const match of matches) {
        const itemText = this.cleanHtmlContent(match[1]);
        if (itemText.trim()) {
          const itemHeight = this.styler.addBulletPoint(itemText, x, currentY, width);
          currentY += itemHeight;
        }
      }
    } else {
      // Treat as regular text with manual bullet points
      const lines = content.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        const cleanLine = line.trim();
        if (cleanLine) {
          if (cleanLine.startsWith('•') || cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
            // Already has bullet point
            const text = cleanLine.substring(1).trim();
            const itemHeight = this.styler.addBulletPoint(text, x, currentY, width);
            currentY += itemHeight;
          } else {
            // Add bullet point
            const itemHeight = this.styler.addBulletPoint(cleanLine, x, currentY, width);
            currentY += itemHeight;
          }
        }
      }
    }
    
    return currentY - y;
  }
}
