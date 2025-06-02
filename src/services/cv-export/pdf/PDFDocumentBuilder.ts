
import jsPDF from 'jspdf';
import { FieldMaskingService } from '../docx/FieldMaskingService';
import { FieldVisibilityService } from '../docx/FieldVisibilityService';
import { PDFSectionRenderer } from './PDFSectionRenderer';
import { PDFStyler } from './PDFStyler';
import { PDFPageManager, ContentBlock } from './utils/PDFPageManager';
import { ContentSplitter } from './utils/ContentSplitter';

export class PDFDocumentBuilder {
  private doc: jsPDF;
  private styler: PDFStyler;
  private sectionRenderer: PDFSectionRenderer;
  private maskingService: FieldMaskingService;
  private visibilityService: FieldVisibilityService;
  private pageManager: PDFPageManager;
  private margins = { top: 20, bottom: 20, left: 20, right: 20 };

  constructor() {
    this.doc = new jsPDF();
    this.styler = new PDFStyler(this.doc);
    this.sectionRenderer = new PDFSectionRenderer(this.doc, this.styler);
    this.maskingService = new FieldMaskingService();
    this.visibilityService = new FieldVisibilityService();
    this.pageManager = new PDFPageManager(this.doc, this.margins);
  }

  async build(
    profile: any,
    sections: any[],
    fieldMappings: any[],
    styles: any,
    layoutConfig: any = {}
  ): Promise<Uint8Array> {
    console.log('PDFDocumentBuilder - Starting build with intelligent page breaking');
    
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
      this.styler = new PDFStyler(this.doc);
      this.sectionRenderer = new PDFSectionRenderer(this.doc, this.styler);
      this.pageManager = new PDFPageManager(this.doc, this.margins);
    }

    // Configure styling
    this.styler.setBaseStyles(styles?.baseStyles || {});
    
    // Sort sections by display order
    const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);
    
    // Handle layout with intelligent page breaking
    const layoutType = layoutConfig.layoutType || 'single-column';
    
    if (layoutType === 'two-column') {
      await this.renderTwoColumnLayoutSmart(profile, sortedSections, styles);
    } else if (layoutType === 'sidebar') {
      await this.renderSidebarLayoutSmart(profile, sortedSections, styles);
    } else {
      await this.renderSingleColumnLayoutSmart(profile, sortedSections, styles);
    }

    // Convert ArrayBuffer to Uint8Array
    const arrayBuffer = this.doc.output('arraybuffer');
    return new Uint8Array(arrayBuffer);
  }

  private async renderSingleColumnLayoutSmart(profile: any, sections: any[], styles: any): Promise<void> {
    // Create content blocks
    const contentBlocks = ContentSplitter.createContentBlocks(sections, profile);
    
    // Split content across pages intelligently
    const pageBlocks = this.pageManager.splitContentAcrossPages(contentBlocks);
    
    // Render each page
    for (let pageIndex = 0; pageIndex < pageBlocks.length; pageIndex++) {
      const blocks = pageBlocks[pageIndex];
      
      // Add new page if not the first page
      if (pageIndex > 0) {
        this.pageManager.addNewPage();
      }
      
      // Render blocks on current page
      for (const block of blocks) {
        await this.renderContentBlock(block, styles);
      }
    }
  }

  private async renderTwoColumnLayoutSmart(profile: any, sections: any[], styles: any): Promise<void> {
    const columnWidth = (this.pageManager.getContentWidth() - 10) / 2;
    const leftColumnX = this.pageManager.getContentX();
    const rightColumnX = this.pageManager.getContentX() + columnWidth + 10;
    
    const midPoint = Math.ceil(sections.length / 2);
    const leftSections = sections.slice(0, midPoint);
    const rightSections = sections.slice(midPoint);
    
    // Create content blocks for each column
    const leftBlocks = ContentSplitter.createContentBlocks(leftSections, profile);
    const rightBlocks = ContentSplitter.createContentBlocks(rightSections, profile);
    
    // For simplicity, render columns sequentially with page breaks
    // Left column first
    if (leftBlocks.length > 0) {
      const leftPageBlocks = this.pageManager.splitContentAcrossPages(leftBlocks);
      for (let pageIndex = 0; pageIndex < leftPageBlocks.length; pageIndex++) {
        const blocks = leftPageBlocks[pageIndex];
        if (pageIndex > 0) this.pageManager.addNewPage();
        
        for (const block of blocks) {
          await this.renderContentBlock(block, styles, leftColumnX, columnWidth);
        }
      }
    }
    
    // Right column
    if (rightBlocks.length > 0) {
      const rightPageBlocks = this.pageManager.splitContentAcrossPages(rightBlocks);
      for (let pageIndex = 0; pageIndex < rightPageBlocks.length; pageIndex++) {
        const blocks = rightPageBlocks[pageIndex];
        if (pageIndex > 0 || leftBlocks.length > 0) this.pageManager.addNewPage();
        
        for (const block of blocks) {
          await this.renderContentBlock(block, styles, rightColumnX, columnWidth);
        }
      }
    }
  }

  private async renderSidebarLayoutSmart(profile: any, sections: any[], styles: any): Promise<void> {
    const sidebarWidth = this.pageManager.getContentWidth() * 0.3;
    const mainWidth = this.pageManager.getContentWidth() * 0.7 - 10;
    const sidebarX = this.pageManager.getContentX();
    const mainX = this.pageManager.getContentX() + sidebarWidth + 10;
    
    const sidebarSections = sections.filter(s => 
      ['technical_skills', 'specialized_skills'].includes(s.section_type)
    );
    const mainSections = sections.filter(s => 
      !['technical_skills', 'specialized_skills'].includes(s.section_type)
    );
    
    // Create content blocks
    const sidebarBlocks = ContentSplitter.createContentBlocks(sidebarSections, profile);
    const mainBlocks = ContentSplitter.createContentBlocks(mainSections, profile);
    
    // Render sidebar first
    if (sidebarBlocks.length > 0) {
      const sidebarPageBlocks = this.pageManager.splitContentAcrossPages(sidebarBlocks);
      for (let pageIndex = 0; pageIndex < sidebarPageBlocks.length; pageIndex++) {
        const blocks = sidebarPageBlocks[pageIndex];
        if (pageIndex > 0) this.pageManager.addNewPage();
        
        for (const block of blocks) {
          await this.renderContentBlock(block, styles, sidebarX, sidebarWidth);
        }
      }
    }
    
    // Render main content
    if (mainBlocks.length > 0) {
      const mainPageBlocks = this.pageManager.splitContentAcrossPages(mainBlocks);
      for (let pageIndex = 0; pageIndex < mainPageBlocks.length; pageIndex++) {
        const blocks = mainPageBlocks[pageIndex];
        if (pageIndex > 0 || sidebarBlocks.length > 0) this.pageManager.addNewPage();
        
        for (const block of blocks) {
          await this.renderContentBlock(block, styles, mainX, mainWidth);
        }
      }
    }
  }

  private async renderContentBlock(
    block: ContentBlock, 
    styles: any, 
    customX?: number, 
    customWidth?: number
  ): Promise<void> {
    const x = customX !== undefined ? customX : this.pageManager.getContentX();
    const width = customWidth !== undefined ? customWidth : this.pageManager.getContentWidth();
    const y = this.pageManager.getCurrentY();
    
    // Find the section configuration
    const sectionConfig = block.splitData?.sectionConfig;
    if (!sectionConfig) {
      console.warn('No section config found for block');
      return;
    }
    
    // Handle page break sections
    if (sectionConfig.section_type === 'page_break') {
      this.pageManager.addNewPage();
      return;
    }
    
    // Ensure we have enough space
    this.pageManager.ensureSpace(block.estimatedHeight, block.minHeight);
    
    // Render the section
    const actualHeight = await this.sectionRenderer.render(
      sectionConfig,
      block.content,
      styles,
      x,
      this.pageManager.getCurrentY(),
      width
    );
    
    // Advance the page manager
    this.pageManager.advanceY(actualHeight + 10); // Add spacing between sections
  }
}
