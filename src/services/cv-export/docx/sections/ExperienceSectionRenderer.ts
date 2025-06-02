
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
        // Check field visibility and apply masking
        const showDesignation = this.isFieldVisible('designation', 'experience');
        const showCompanyName = this.isFieldVisible('company_name', 'experience');
        const showDescription = this.isFieldVisible('description', 'experience');
        const showDateRange = this.isFieldVisible('date_range', 'experience');

        // Job Title and Company
        if (showDesignation || showCompanyName) {
          let titleText = '';
          let companyText = '';
          
          if (showDesignation) {
            const designation = this.applyFieldMasking(exp.designation || exp.job_title, 'designation', 'experience');
            titleText = designation || '';
          }
          
          if (showCompanyName) {
            const companyName = this.applyFieldMasking(exp.company_name, 'company_name', 'experience');
            companyText = companyName ? ` at ${companyName}` : '';
          }
          
          if (titleText || companyText) {
            elements.push(this.styler.createItemTitle(`${titleText}${companyText}`, baseStyles));
          }
        }

        // Date Range
        if (showDateRange && (exp.start_date || exp.end_date)) {
          const dateRange = this.formatDateRange(exp.start_date, exp.end_date, exp.is_current);
          const maskedDateRange = this.applyFieldMasking(dateRange, 'date_range', 'experience');
          elements.push(this.styler.createItemSubtitle(maskedDateRange, baseStyles));
        }

        // Description with rich text parsing and masking
        if (showDescription) {
          const description = this.applyFieldMasking(exp.description, 'description', 'experience');
          if (description) {
            const richTextParagraphs = this.richTextProcessor.parseRichTextToDocx(description, baseStyles);
            elements.push(...richTextParagraphs);
          }
        }
      });
    } catch (error) {
      console.error('Error rendering experience section:', error);
    }

    return elements;
  }
}
