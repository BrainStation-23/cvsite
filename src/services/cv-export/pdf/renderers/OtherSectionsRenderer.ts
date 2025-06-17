import { BasePDFRenderer } from './BasePDFRenderer';
import { RichTextParser } from '../utils/RichTextParser';
import { RichTextRenderer } from '../utils/RichTextRenderer';

export class OtherSectionsRenderer extends BasePDFRenderer {
  private richTextParser: RichTextParser;
  private richTextRenderer: RichTextRenderer;

  constructor(doc: any, styler: any, maskingService: any, visibilityService: any) {
    super(doc, styler, maskingService, visibilityService);
    this.richTextParser = new RichTextParser();
    this.richTextRenderer = new RichTextRenderer(this.styler);
  }

  async renderProjects(projects: any[], x: number, y: number, width: number, sectionType: string): Promise<number> {
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

      // Description with proper rich text parsing
      if (this.visibilityService.isFieldVisible('description', sectionType)) {
        const description = this.maskingService.applyMasking(project.description, 'description', sectionType);
        if (description) {
          const parsedContent = this.richTextParser.parseRichText(description);
          const descHeight = this.richTextRenderer.renderRichTextContent(parsedContent, x, currentY, width);
          currentY += descHeight + 3;
        }
      }

      // Responsibility with proper rich text parsing (same logic as description)
      if (this.visibilityService.isFieldVisible('responsibility', sectionType)) {
        const responsibility = this.maskingService.applyMasking(project.responsibility, 'responsibility', sectionType);
        if (responsibility) {
          const parsedContent = this.richTextParser.parseRichText(responsibility);
          const respHeight = this.richTextRenderer.renderRichTextContent(parsedContent, x, currentY, width);
          currentY += respHeight + 3;
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

  async renderEducation(education: any[], x: number, y: number, width: number, sectionType: string): Promise<number> {
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

  async renderSkills(skills: any[], x: number, y: number, width: number, sectionType: string): Promise<number> {
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

  async renderTraining(trainings: any[], x: number, y: number, width: number, sectionType: string): Promise<number> {
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

  async renderAchievements(achievements: any[], x: number, y: number, width: number, sectionType: string): Promise<number> {
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

  async render(data: any, x: number, y: number, width: number, sectionType: string): Promise<number> {
    // This is implemented by specific methods above
    return 0;
  }
}
