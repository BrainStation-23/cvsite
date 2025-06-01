
import { BasePDFRenderer } from './BasePDFRenderer';
import { RichTextParser } from '../utils/RichTextParser';
import { RichTextRenderer } from '../utils/RichTextRenderer';

export class ExperienceSectionRenderer extends BasePDFRenderer {
  private richTextParser: RichTextParser;
  private richTextRenderer: RichTextRenderer;

  constructor(doc: any, styler: any, maskingService: any, visibilityService: any) {
    super(doc, styler, maskingService, visibilityService);
    this.richTextParser = new RichTextParser();
    this.richTextRenderer = new RichTextRenderer(this.styler);
  }

  async render(experiences: any[], x: number, y: number, width: number, sectionType: string): Promise<number> {
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

      // Date Range - Fixed to show properly
      if (this.visibilityService.isFieldVisible('start_date', sectionType) || 
          this.visibilityService.isFieldVisible('end_date', sectionType) ||
          this.visibilityService.isFieldVisible('date_range', sectionType)) {
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

      // Description with proper rich text parsing
      if (this.visibilityService.isFieldVisible('description', sectionType)) {
        const description = this.maskingService.applyMasking(experience.description, 'description', sectionType);
        if (description) {
          const parsedContent = this.richTextParser.parseRichText(description);
          const descHeight = this.richTextRenderer.renderRichTextContent(parsedContent, x, currentY, width);
          currentY += descHeight + 5;
        }
      }

      currentY += 10; // Space between experiences
    }

    return currentY - y;
  }
}
