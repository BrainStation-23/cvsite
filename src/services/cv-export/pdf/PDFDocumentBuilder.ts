import jsPDF from 'jspdf';
import { FieldMaskingService } from '../docx/FieldMaskingService';
import { FieldVisibilityService } from '../docx/FieldVisibilityService';
import { PDFSectionRenderer } from './PDFSectionRenderer';
import { PDFStyler } from './PDFStyler';

export class PDFDocumentBuilder {
  private doc: jsPDF;
  private styler: PDFStyler;
  private sectionRenderer: PDFSectionRenderer;
  private maskingService: FieldMaskingService;
  private visibilityService: FieldVisibilityService;
  private currentY: number = 20;
  private pageHeight: number;
  private pageWidth: number;
  private margins = { top: 20, bottom: 20, left: 20, right: 20 };

  constructor() {
    this.doc = new jsPDF();
    this.pageHeight = this.doc.internal.pageSize.height;
    this.pageWidth = this.doc.internal.pageSize.width;
    this.styler = new PDFStyler(this.doc);
    this.sectionRenderer = new PDFSectionRenderer(this.doc, this.styler);
    this.maskingService = new FieldMaskingService();
    this.visibilityService = new FieldVisibilityService();
  }

  async build(
    profile: any,
    sections: any[],
    fieldMappings: any[],
    styles: any,
    layoutConfig: any = {}
  ): Promise<Uint8Array> {
    console.log('PDFDocumentBuilder - Starting build with profile:', profile);
    
    // Configure services
    this.maskingService.setFieldMappings(fieldMappings);
    this.maskingService.setSectionConfigs(sections);
    this.visibilityService.setFieldMappings(fieldMappings);
    this.visibilityService.setSectionConfigs(sections);
    
    // Set services for the section renderer
    this.sectionRenderer.setMaskingService(this.maskingService);
    this.sectionRenderer.setVisibilityService(this.visibilityService);
    
    // Apply orientation from styles
    const orientation = styles?.baseStyles?.orientation || 'portrait';
    if (orientation === 'landscape') {
      this.doc = new jsPDF('landscape');
      this.pageHeight = this.doc.internal.pageSize.height;
      this.pageWidth = this.doc.internal.pageSize.width;
      this.styler = new PDFStyler(this.doc);
      this.sectionRenderer = new PDFSectionRenderer(this.doc, this.styler);
    }

    // Configure styling
    this.styler.setBaseStyles(styles?.baseStyles || {});
    
    // Sort sections by display order
    const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);
    
    // Handle layout
    const layoutType = layoutConfig.layoutType || 'single-column';
    
    if (layoutType === 'two-column') {
      await this.renderTwoColumnLayout(profile, sortedSections, styles);
    } else if (layoutType === 'sidebar') {
      await this.renderSidebarLayout(profile, sortedSections, styles);
    } else {
      await this.renderSingleColumnLayout(profile, sortedSections, styles);
    }

    // Convert ArrayBuffer to Uint8Array
    const arrayBuffer = this.doc.output('arraybuffer');
    return new Uint8Array(arrayBuffer);
  }

  private async renderSingleColumnLayout(profile: any, sections: any[], styles: any): Promise<void> {
    for (const section of sections) {
      const sectionData = this.getSectionData(profile, section.section_type);
      if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) {
        continue;
      }

      // Check if we need a new page
      if (this.currentY > this.pageHeight - 50) {
        this.addNewPage();
      }

      const sectionHeight = await this.sectionRenderer.render(
        section,
        sectionData,
        styles,
        this.margins.left,
        this.currentY,
        this.pageWidth - this.margins.left - this.margins.right
      );

      this.currentY += sectionHeight + 10; // Add spacing between sections
    }
  }

  private async renderTwoColumnLayout(profile: any, sections: any[], styles: any): Promise<void> {
    const columnWidth = (this.pageWidth - this.margins.left - this.margins.right - 10) / 2;
    const leftColumnX = this.margins.left;
    const rightColumnX = this.margins.left + columnWidth + 10;
    
    const midPoint = Math.ceil(sections.length / 2);
    const leftSections = sections.slice(0, midPoint);
    const rightSections = sections.slice(midPoint);
    
    let leftY = this.margins.top;
    let rightY = this.margins.top;

    // Render left column
    for (const section of leftSections) {
      const sectionData = this.getSectionData(profile, section.section_type);
      if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) {
        continue;
      }

      const sectionHeight = await this.sectionRenderer.render(
        section,
        sectionData,
        styles,
        leftColumnX,
        leftY,
        columnWidth
      );

      leftY += sectionHeight + 10;
    }

    // Render right column
    for (const section of rightSections) {
      const sectionData = this.getSectionData(profile, section.section_type);
      if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) {
        continue;
      }

      const sectionHeight = await this.sectionRenderer.render(
        section,
        sectionData,
        styles,
        rightColumnX,
        rightY,
        columnWidth
      );

      rightY += sectionHeight + 10;
    }

    this.currentY = Math.max(leftY, rightY);
  }

  private async renderSidebarLayout(profile: any, sections: any[], styles: any): Promise<void> {
    const sidebarWidth = (this.pageWidth - this.margins.left - this.margins.right) * 0.3;
    const mainWidth = (this.pageWidth - this.margins.left - this.margins.right) * 0.7 - 10;
    const sidebarX = this.margins.left;
    const mainX = this.margins.left + sidebarWidth + 10;
    
    const sidebarSections = sections.filter(s => 
      ['technical_skills', 'specialized_skills'].includes(s.section_type)
    );
    const mainSections = sections.filter(s => 
      !['technical_skills', 'specialized_skills'].includes(s.section_type)
    );
    
    let sidebarY = this.margins.top;
    let mainY = this.margins.top;

    // Render sidebar
    for (const section of sidebarSections) {
      const sectionData = this.getSectionData(profile, section.section_type);
      if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) {
        continue;
      }

      const sectionHeight = await this.sectionRenderer.render(
        section,
        sectionData,
        styles,
        sidebarX,
        sidebarY,
        sidebarWidth
      );

      sidebarY += sectionHeight + 10;
    }

    // Render main content
    for (const section of mainSections) {
      const sectionData = this.getSectionData(profile, section.section_type);
      if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) {
        continue;
      }

      const sectionHeight = await this.sectionRenderer.render(
        section,
        sectionData,
        styles,
        mainX,
        mainY,
        mainWidth
      );

      mainY += sectionHeight + 10;
    }

    this.currentY = Math.max(sidebarY, mainY);
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

  private addNewPage(): void {
    this.doc.addPage();
    this.currentY = this.margins.top;
  }
}
