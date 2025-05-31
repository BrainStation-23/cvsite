
import { Paragraph, Table } from 'docx';
import { BaseSectionRenderer } from './BaseSectionRenderer';
import { RichTextProcessor } from '../RichTextProcessor';

export class ExperienceSectionRenderer extends BaseSectionRenderer {
  private richTextProcessor: RichTextProcessor;

  constructor() {
    super();
    this.richTextProcessor = new RichTextProcessor();
  }

  render(experiences: any[], styles: any): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];
    const baseStyles = styles?.baseStyles || {};
    
    try {
      experiences.forEach((exp) => {
        // Apply masking to each field
        const designation = this.maskingService.applyMasking(exp.designation || exp.job_title, 'designation', 'experience');
        const companyName = this.maskingService.applyMasking(exp.company_name, 'company_name', 'experience');
        const description = this.maskingService.applyMasking(exp.description, 'description', 'experience');

        // Job Title and Company
        if (designation || companyName) {
          const titleText = designation || '';
          const companyText = companyName ? ` at ${companyName}` : '';
          elements.push(this.styler.createItemTitle(`${titleText}${companyText}`, baseStyles));
        }

        // Date Range
        if (exp.start_date || exp.end_date) {
          const dateRange = this.formatDateRange(exp.start_date, exp.end_date, exp.is_current);
          const maskedDateRange = this.maskingService.applyMasking(dateRange, 'date_range', 'experience');
          elements.push(this.styler.createItemSubtitle(maskedDateRange, baseStyles));
        }

        // Description with rich text parsing and masking
        if (description) {
          const richTextParagraphs = this.richTextProcessor.parseRichTextToDocx(description, baseStyles);
          elements.push(...richTextParagraphs);
        }
      });
    } catch (error) {
      console.error('Error rendering experience section:', error);
    }

    return elements;
  }
}
