
import { Document, Packer, Paragraph, Table } from 'docx';
import { ExportOptions } from '../CVExportService';
import { DocumentStyler } from './DocumentStyler';
import { SectionRenderer } from './SectionRenderer';
import { FieldMaskingService } from './FieldMaskingService';
import { FieldVisibilityService } from './FieldVisibilityService';
import { LayoutProcessor } from './LayoutProcessor';

export class DocumentBuilder {
  private styler: DocumentStyler;
  private sectionRenderer: SectionRenderer;
  private maskingService: FieldMaskingService;
  private visibilityService: FieldVisibilityService;
  private layoutProcessor: LayoutProcessor;

  constructor() {
    this.styler = new DocumentStyler();
    this.sectionRenderer = new SectionRenderer();
    this.maskingService = new FieldMaskingService();
    this.visibilityService = new FieldVisibilityService();
    this.layoutProcessor = new LayoutProcessor();
  }

  async createDocument(options: ExportOptions): Promise<Document> {
    const { template, profile, sections, fieldMappings, styles } = options;
    
    if (!profile || !sections || sections.length === 0) {
      throw new Error('Profile data and sections are required for export');
    }

    console.log('DOCX Export - Creating document with:', {
      templateName: template?.name,
      profileName: `${profile.first_name} ${profile.last_name}`,
      sectionsCount: sections.length,
      orientation: template?.orientation,
      layoutConfig: template?.layout_config,
      layoutType: template?.layout_config?.layoutType
    });

    // Configure layout for all services
    const layoutConfig = template?.layout_config || {};
    this.styler.setLayoutConfig(layoutConfig);
    this.layoutProcessor.setLayoutConfig(layoutConfig);
    this.layoutProcessor.setStyler(this.styler);

    // Configure other services
    this.maskingService.setFieldMappings(fieldMappings || []);
    this.visibilityService.setFieldMappings(fieldMappings || []);
    this.visibilityService.setSectionConfigs(sections);
    
    // Configure section renderer with all services
    this.sectionRenderer.setMaskingService(this.maskingService);
    this.sectionRenderer.setVisibilityService(this.visibilityService);
    this.sectionRenderer.setStyler(this.styler);
    
    // Sort sections by display order
    const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);
    console.log('Processing sections:', sortedSections.map(s => ({
      type: s.section_type,
      placement: s.styling_config?.layout_placement || 'main'
    })));
    
    // Separate sections based on layout using the improved layout processor
    const mainSections: (Paragraph | Table)[] = [];
    const sidebarSections: (Paragraph | Table)[] = [];
    
    // Render each section
    for (const section of sortedSections) {
      try {
        const sectionElements = await this.sectionRenderer.renderSection(
          section, 
          profile, 
          fieldMappings || [], 
          styles
        );
        
        if (sectionElements.length > 0) {
          // Use the updated getSectionPlacement method that reads from section configuration
          const placement = this.layoutProcessor.getSectionPlacement(section);
          if (placement === 'sidebar') {
            sidebarSections.push(...sectionElements);
          } else {
            mainSections.push(...sectionElements);
          }
          console.log(`Added ${sectionElements.length} elements for section: ${section.section_type} (${placement})`);
        }
      } catch (sectionError) {
        console.error(`Error rendering section ${section.section_type}:`, sectionError);
        // Continue with other sections even if one fails
      }
    }
    
    console.log('DOCX Export - Section distribution:', {
      mainSections: mainSections.length,
      sidebarSections: sidebarSections.length,
      layoutType: template?.layout_config?.layoutType
    });
    
    // Apply layout structure using the improved layout processor
    const documentChildren = this.layoutProcessor.createLayoutStructure(mainSections, sidebarSections);
    
    console.log('Total document elements:', documentChildren.length);
    
    // Add fallback content if no sections rendered
    if (documentChildren.length === 0) {
      documentChildren.push(this.styler.createFallbackContent());
    }
    
    return this.styler.createDocumentStructure(
      documentChildren, 
      template?.orientation || 'portrait', 
      styles?.baseStyles || {}
    );
  }

  async exportToBlob(options: ExportOptions): Promise<Blob> {
    const doc = await this.createDocument(options);
    const blob = await Packer.toBlob(doc);
    
    if (blob.size === 0) {
      throw new Error('Generated document is empty');
    }
    
    return blob;
  }
}
