
import PptxGenJS from 'pptxgenjs';
import { FieldMaskingService } from '../docx/FieldMaskingService';
import { FieldVisibilityService } from '../docx/FieldVisibilityService';

export class PPTSlideRenderer {
  private pres: PptxGenJS;
  private maskingService!: FieldMaskingService;
  private visibilityService!: FieldVisibilityService;

  constructor(pres: PptxGenJS) {
    this.pres = pres;
  }

  setMaskingService(service: FieldMaskingService): void {
    this.maskingService = service;
  }

  setVisibilityService(service: FieldVisibilityService): void {
    this.visibilityService = service;
  }

  async renderSection(
    section: any,
    sectionData: any,
    styles: any
  ): Promise<void> {
    const sectionTitle = this.maskingService.getSectionTitle(section);
    
    // Skip general section as it's already in title slide
    if (section.section_type === 'general') {
      return;
    }

    // Render based on section type
    switch (section.section_type) {
      case 'experience':
        await this.renderExperienceSlides(sectionTitle, sectionData, section.section_type, styles);
        break;
      case 'education':
        await this.renderEducationSlide(sectionTitle, sectionData, section.section_type, styles);
        break;
      case 'projects':
        await this.renderProjectsSlides(sectionTitle, sectionData, section.section_type, styles);
        break;
      case 'technical_skills':
      case 'specialized_skills':
        await this.renderSkillsSlide(sectionTitle, sectionData, section.section_type, styles);
        break;
      case 'training':
        await this.renderTrainingSlide(sectionTitle, sectionData, section.section_type, styles);
        break;
      case 'achievements':
        await this.renderAchievementsSlide(sectionTitle, sectionData, section.section_type, styles);
        break;
      default:
        console.warn(`Unknown section type: ${section.section_type}`);
    }
  }

  private async renderExperienceSlides(title: string, experiences: any[], sectionType: string, styles: any): Promise<void> {
    // Create overview slide for experiences
    const slide = this.pres.addSlide();
    slide.background = { color: styles?.baseStyles?.backgroundColor || '#ffffff' };
    
    // Add section title
    this.addSectionTitle(slide, title, styles);
    
    let yPos = 1.5;
    const maxItemsPerSlide = 3;
    let currentSlide = slide;
    let itemCount = 0;

    for (const experience of experiences) {
      if (itemCount >= maxItemsPerSlide) {
        // Create new slide
        currentSlide = this.pres.addSlide();
        currentSlide.background = { color: styles?.baseStyles?.backgroundColor || '#ffffff' };
        this.addSectionTitle(currentSlide, `${title} (Continued)`, styles);
        yPos = 1.5;
        itemCount = 0;
      }

      // Company Name
      if (this.visibilityService.isFieldVisible('company_name', sectionType)) {
        const companyName = this.maskingService.applyMasking(experience.company_name, 'company_name', sectionType);
        if (companyName) {
          currentSlide.addText(companyName, {
            x: 0.5,
            y: yPos,
            w: 9,
            h: 0.4,
            fontSize: 16,
            fontFace: 'Arial',
            bold: true,
            color: styles?.baseStyles?.primaryColor || '#1f2937'
          });
          yPos += 0.5;
        }
      }

      // Position
      if (this.visibilityService.isFieldVisible('position', sectionType)) {
        const position = this.maskingService.applyMasking(experience.position, 'position', sectionType);
        if (position) {
          currentSlide.addText(position, {
            x: 0.5,
            y: yPos,
            w: 9,
            h: 0.3,
            fontSize: 14,
            fontFace: 'Arial',
            italic: true,
            color: '#374151'
          });
          yPos += 0.4;
        }
      }

      // Date Range
      if (this.visibilityService.isFieldVisible('start_date', sectionType) || this.visibilityService.isFieldVisible('end_date', sectionType)) {
        const dateRange = this.formatDateRange(experience.start_date, experience.end_date, experience.is_current);
        if (dateRange) {
          currentSlide.addText(dateRange, {
            x: 0.5,
            y: yPos,
            w: 9,
            h: 0.3,
            fontSize: 12,
            fontFace: 'Arial',
            color: '#6b7280'
          });
          yPos += 0.4;
        }
      }

      // Job Responsibilities
      if (this.visibilityService.isFieldVisible('job_responsibilities', sectionType)) {
        const responsibilities = this.maskingService.applyMasking(experience.job_responsibilities, 'job_responsibilities', sectionType);
        if (responsibilities) {
          const bulletPoints = this.extractBulletPoints(responsibilities);
          const maxBullets = Math.min(bulletPoints.length, 4); // Limit bullets per experience
          
          for (let i = 0; i < maxBullets; i++) {
            currentSlide.addText(`• ${bulletPoints[i]}`, {
              x: 0.8,
              y: yPos,
              w: 8.7,
              h: 0.3,
              fontSize: 11,
              fontFace: 'Arial',
              color: '#374151'
            });
            yPos += 0.3;
          }
        }
      }

      yPos += 0.3; // Space between experiences
      itemCount++;
    }
  }

  private async renderEducationSlide(title: string, education: any[], sectionType: string, styles: any): Promise<void> {
    const slide = this.pres.addSlide();
    slide.background = { color: styles?.baseStyles?.backgroundColor || '#ffffff' };
    
    this.addSectionTitle(slide, title, styles);
    
    let yPos = 1.5;
    
    for (const edu of education) {
      // Degree
      if (this.visibilityService.isFieldVisible('degree', sectionType)) {
        const degree = this.maskingService.applyMasking(edu.degree?.name || edu.degree, 'degree', sectionType);
        if (degree) {
          slide.addText(degree, {
            x: 0.5,
            y: yPos,
            w: 9,
            h: 0.4,
            fontSize: 16,
            fontFace: 'Arial',
            bold: true,
            color: styles?.baseStyles?.primaryColor || '#1f2937'
          });
          yPos += 0.5;
        }
      }

      // University
      if (this.visibilityService.isFieldVisible('university', sectionType)) {
        const university = this.maskingService.applyMasking(edu.university?.name || edu.university, 'university', sectionType);
        if (university) {
          slide.addText(university, {
            x: 0.5,
            y: yPos,
            w: 9,
            h: 0.3,
            fontSize: 14,
            fontFace: 'Arial',
            color: '#374151'
          });
          yPos += 0.4;
        }
      }

      // Date Range
      if (this.visibilityService.isFieldVisible('start_date', sectionType) || this.visibilityService.isFieldVisible('graduation_date', sectionType)) {
        const dateRange = this.formatDateRange(edu.start_date, edu.graduation_date, false);
        if (dateRange) {
          slide.addText(dateRange, {
            x: 0.5,
            y: yPos,
            w: 9,
            h: 0.3,
            fontSize: 12,
            fontFace: 'Arial',
            color: '#6b7280'
          });
          yPos += 0.4;
        }
      }

      yPos += 0.3; // Space between education entries
    }
  }

  private async renderProjectsSlides(title: string, projects: any[], sectionType: string, styles: any): Promise<void> {
    const slide = this.pres.addSlide();
    slide.background = { color: styles?.baseStyles?.backgroundColor || '#ffffff' };
    
    this.addSectionTitle(slide, title, styles);
    
    let yPos = 1.5;
    const maxItemsPerSlide = 3;
    let currentSlide = slide;
    let itemCount = 0;

    for (const project of projects) {
      if (itemCount >= maxItemsPerSlide) {
        currentSlide = this.pres.addSlide();
        currentSlide.background = { color: styles?.baseStyles?.backgroundColor || '#ffffff' };
        this.addSectionTitle(currentSlide, `${title} (Continued)`, styles);
        yPos = 1.5;
        itemCount = 0;
      }

      // Project Name
      if (this.visibilityService.isFieldVisible('name', sectionType)) {
        const name = this.maskingService.applyMasking(project.name, 'name', sectionType);
        if (name) {
          currentSlide.addText(name, {
            x: 0.5,
            y: yPos,
            w: 9,
            h: 0.4,
            fontSize: 16,
            fontFace: 'Arial',
            bold: true,
            color: styles?.baseStyles?.primaryColor || '#1f2937'
          });
          yPos += 0.5;
        }
      }

      // Role
      if (this.visibilityService.isFieldVisible('role', sectionType)) {
        const role = this.maskingService.applyMasking(project.role, 'role', sectionType);
        if (role) {
          currentSlide.addText(role, {
            x: 0.5,
            y: yPos,
            w: 9,
            h: 0.3,
            fontSize: 14,
            fontFace: 'Arial',
            italic: true,
            color: '#374151'
          });
          yPos += 0.4;
        }
      }

      // Description
      if (this.visibilityService.isFieldVisible('description', sectionType)) {
        const description = this.maskingService.applyMasking(project.description, 'description', sectionType);
        if (description) {
          const cleanDescription = this.cleanHtmlContent(description);
          const maxLength = 200; // Limit description length
          const truncatedDesc = cleanDescription.length > maxLength 
            ? cleanDescription.substring(0, maxLength) + '...'
            : cleanDescription;
          
          currentSlide.addText(truncatedDesc, {
            x: 0.5,
            y: yPos,
            w: 9,
            h: 0.8,
            fontSize: 12,
            fontFace: 'Arial',
            color: '#374151'
          });
          yPos += 0.9;
        }
      }

      yPos += 0.3; // Space between projects
      itemCount++;
    }
  }

  private async renderSkillsSlide(title: string, skills: any[], sectionType: string, styles: any): Promise<void> {
    const slide = this.pres.addSlide();
    slide.background = { color: styles?.baseStyles?.backgroundColor || '#ffffff' };
    
    this.addSectionTitle(slide, title, styles);
    
    const skillNames = skills
      .filter(skill => this.visibilityService.isFieldVisible('name', sectionType))
      .map(skill => this.maskingService.applyMasking(skill.name, 'name', sectionType))
      .filter(name => name);

    if (skillNames.length > 0) {
      // Group skills into columns
      const itemsPerColumn = Math.ceil(skillNames.length / 2);
      const leftColumn = skillNames.slice(0, itemsPerColumn);
      const rightColumn = skillNames.slice(itemsPerColumn);

      // Left column
      leftColumn.forEach((skill, index) => {
        slide.addText(`• ${skill}`, {
          x: 0.5,
          y: 1.5 + (index * 0.4),
          w: 4,
          h: 0.3,
          fontSize: 12,
          fontFace: 'Arial',
          color: '#374151'
        });
      });

      // Right column
      rightColumn.forEach((skill, index) => {
        slide.addText(`• ${skill}`, {
          x: 5,
          y: 1.5 + (index * 0.4),
          w: 4,
          h: 0.3,
          fontSize: 12,
          fontFace: 'Arial',
          color: '#374151'
        });
      });
    }
  }

  private async renderTrainingSlide(title: string, trainings: any[], sectionType: string, styles: any): Promise<void> {
    const slide = this.pres.addSlide();
    slide.background = { color: styles?.baseStyles?.backgroundColor || '#ffffff' };
    
    this.addSectionTitle(slide, title, styles);
    
    let yPos = 1.5;
    
    for (const training of trainings) {
      // Training Name
      if (this.visibilityService.isFieldVisible('name', sectionType)) {
        const name = this.maskingService.applyMasking(training.name, 'name', sectionType);
        if (name) {
          slide.addText(name, {
            x: 0.5,
            y: yPos,
            w: 9,
            h: 0.4,
            fontSize: 14,
            fontFace: 'Arial',
            bold: true,
            color: styles?.baseStyles?.primaryColor || '#1f2937'
          });
          yPos += 0.5;
        }
      }

      // Institution
      if (this.visibilityService.isFieldVisible('institution', sectionType)) {
        const institution = this.maskingService.applyMasking(training.institution, 'institution', sectionType);
        if (institution) {
          slide.addText(institution, {
            x: 0.5,
            y: yPos,
            w: 9,
            h: 0.3,
            fontSize: 12,
            fontFace: 'Arial',
            color: '#374151'
          });
          yPos += 0.4;
        }
      }

      yPos += 0.3; // Space between trainings
    }
  }

  private async renderAchievementsSlide(title: string, achievements: any[], sectionType: string, styles: any): Promise<void> {
    const slide = this.pres.addSlide();
    slide.background = { color: styles?.baseStyles?.backgroundColor || '#ffffff' };
    
    this.addSectionTitle(slide, title, styles);
    
    let yPos = 1.5;
    
    for (const achievement of achievements) {
      // Title
      if (this.visibilityService.isFieldVisible('title', sectionType)) {
        const title = this.maskingService.applyMasking(achievement.title, 'title', sectionType);
        if (title) {
          slide.addText(`• ${title}`, {
            x: 0.5,
            y: yPos,
            w: 9,
            h: 0.4,
            fontSize: 14,
            fontFace: 'Arial',
            bold: true,
            color: styles?.baseStyles?.primaryColor || '#1f2937'
          });
          yPos += 0.5;
        }
      }

      // Description
      if (this.visibilityService.isFieldVisible('description', sectionType)) {
        const description = this.maskingService.applyMasking(achievement.description, 'description', sectionType);
        if (description) {
          slide.addText(description, {
            x: 0.8,
            y: yPos,
            w: 8.7,
            h: 0.4,
            fontSize: 12,
            fontFace: 'Arial',
            color: '#374151'
          });
          yPos += 0.5;
        }
      }

      yPos += 0.2; // Space between achievements
    }
  }

  private addSectionTitle(slide: any, title: string, styles: any): void {
    slide.addText(title, {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.8,
      fontSize: 24,
      fontFace: 'Arial',
      bold: true,
      color: styles?.baseStyles?.primaryColor || '#1f2937'
    });
    
    // Add underline
    slide.addShape('rect', {
      x: 0.5,
      y: 1.1,
      w: 9,
      h: 0.02,
      fill: { color: styles?.baseStyles?.primaryColor || '#1f2937' }
    });
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

  private extractBulletPoints(content: string): string[] {
    if (!content) return [];
    
    // Clean HTML first
    const cleaned = this.cleanHtmlContent(content);
    
    // Split by common bullet point indicators
    const points = cleaned
      .split(/[•\-\*]\s*/)
      .map(point => point.trim())
      .filter(point => point.length > 0);
    
    // If no bullet points found, split by sentences or newlines
    if (points.length <= 1) {
      return cleaned
        .split(/[.\n]/)
        .map(point => point.trim())
        .filter(point => point.length > 10); // Filter out very short fragments
    }
    
    return points;
  }
}
