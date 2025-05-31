
import jsPDF from 'jspdf';
import { PDFStyler } from './PDFStyler';
import { FieldMaskingService } from '../docx/FieldMaskingService';
import { FieldVisibilityService } from '../docx/FieldVisibilityService';
import { GeneralSectionRenderer } from './renderers/GeneralSectionRenderer';
import { ExperienceSectionRenderer } from './renderers/ExperienceSectionRenderer';
import { OtherSectionsRenderer } from './renderers/OtherSectionsRenderer';

export class PDFSectionRenderer {
  private doc: jsPDF;
  private styler: PDFStyler;
  private maskingService!: FieldMaskingService;
  private visibilityService!: FieldVisibilityService;
  private generalRenderer!: GeneralSectionRenderer;
  private experienceRenderer!: ExperienceSectionRenderer;
  private otherSectionsRenderer!: OtherSectionsRenderer;

  constructor(doc: jsPDF, styler: PDFStyler) {
    this.doc = doc;
    this.styler = styler;
  }

  setMaskingService(service: FieldMaskingService): void {
    this.maskingService = service;
    this.initializeRenderers();
  }

  setVisibilityService(service: FieldVisibilityService): void {
    this.visibilityService = service;
    this.initializeRenderers();
  }

  private initializeRenderers(): void {
    if (this.maskingService && this.visibilityService) {
      this.generalRenderer = new GeneralSectionRenderer(
        this.doc, 
        this.styler, 
        this.maskingService, 
        this.visibilityService
      );
      this.experienceRenderer = new ExperienceSectionRenderer(
        this.doc, 
        this.styler, 
        this.maskingService, 
        this.visibilityService
      );
      this.otherSectionsRenderer = new OtherSectionsRenderer(
        this.doc, 
        this.styler, 
        this.maskingService, 
        this.visibilityService
      );
    }
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
    
    // Get section title - handle continuation sections
    let sectionTitle = this.maskingService.getSectionTitle(section);
    if (section.splitData?.isContinuation) {
      sectionTitle += ' (continued)';
    }
    
    // Add section title with better spacing
    const titleHeight = this.styler.addSectionTitle(sectionTitle, x, currentY, width);
    currentY += titleHeight + 8; // Increased spacing after title

    // Render based on section type with improved spacing
    const contentStartY = currentY;
    switch (section.section_type) {
      case 'general':
        currentY += await this.generalRenderer.render(sectionData, x, currentY, width, section.section_type);
        break;
      case 'experience':
        currentY += await this.experienceRenderer.render(sectionData, x, currentY, width, section.section_type);
        break;
      case 'education':
        currentY += await this.otherSectionsRenderer.renderEducation(sectionData, x, currentY, width, section.section_type);
        break;
      case 'projects':
        currentY += await this.otherSectionsRenderer.renderProjects(sectionData, x, currentY, width, section.section_type);
        break;
      case 'technical_skills':
      case 'specialized_skills':
        currentY += await this.otherSectionsRenderer.renderSkills(sectionData, x, currentY, width, section.section_type);
        break;
      case 'training':
        currentY += await this.otherSectionsRenderer.renderTraining(sectionData, x, currentY, width, section.section_type);
        break;
      case 'achievements':
        currentY += await this.otherSectionsRenderer.renderAchievements(sectionData, x, currentY, width, section.section_type);
        break;
      default:
        console.warn(`Unknown section type: ${section.section_type}`);
    }

    // Ensure minimum spacing after content
    const contentHeight = currentY - contentStartY;
    if (contentHeight < 20) {
      currentY += (20 - contentHeight);
    }

    return currentY - y;
  }
}
