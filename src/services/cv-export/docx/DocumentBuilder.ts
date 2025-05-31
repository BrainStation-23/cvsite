
import { Document, Packer, Paragraph, Table } from 'docx';
import { ExportOptions } from '../CVExportService';
import { DocumentStyler } from './DocumentStyler';
import { SectionRenderer } from './SectionRenderer';
import { FieldMaskingService } from './FieldMaskingService';

export class DocumentBuilder {
  private styler: DocumentStyler;
  private sectionRenderer: SectionRenderer;
  private maskingService: FieldMaskingService;

  constructor() {
    this.styler = new DocumentStyler();
    this.sectionRenderer = new SectionRenderer();
    this.maskingService = new FieldMaskingService();
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
      orientation: template?.orientation
    });

    const documentChildren: (Paragraph | Table)[] = [];
    
    // Sort sections by display order
    const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);
    console.log('Processing sections:', sortedSections.map(s => s.section_type));
    
    // Configure masking service
    this.maskingService.setFieldMappings(fieldMappings || []);
    
    // Configure section renderer
    this.sectionRenderer.setMaskingService(this.maskingService);
    this.sectionRenderer.setStyler(this.styler);
    
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
          documentChildren.push(...sectionElements);
          console.log(`Added ${sectionElements.length} elements for section: ${section.section_type}`);
        }
      } catch (sectionError) {
        console.error(`Error rendering section ${section.section_type}:`, sectionError);
        // Continue with other sections even if one fails
      }
    }
    
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
