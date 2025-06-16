
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
      // Assume fieldMappings is available via styles or passed as an argument (update signature if needed)
      const fieldMappings = styles?.fieldMappings || [];
      const getOrderedFields = () => {
        return fieldMappings
          .filter((f: any) => f.section_type === 'experience')
          .sort((a: any, b: any) => a.field_order - b.field_order);
      };

      experiences.forEach((exp) => {
        const orderedFields = getOrderedFields();
        orderedFields.forEach((field: any) => {
          const fieldName = field.original_field_name;
          let value = '';
          switch (fieldName) {
            case 'designation':
              value = this.applyFieldMasking(exp.designation || exp.job_title, 'designation', 'experience');
              if (value) elements.push(this.styler.createItemTitle(value, baseStyles));
              break;
            case 'company_name':
              value = this.applyFieldMasking(exp.company_name, 'company_name', 'experience');
              if (value) elements.push(this.styler.createItemSubtitle(value, baseStyles));
              break;
            case 'date_range':
              if (exp.start_date || exp.end_date) {
                const dateRange = this.formatDateRange(exp.start_date, exp.end_date, exp.is_current);
                value = this.applyFieldMasking(dateRange, 'date_range', 'experience');
                if (value) elements.push(this.styler.createItemSubtitle(value, baseStyles));
              }
              break;
            case 'description':
              value = this.applyFieldMasking(exp.description, 'description', 'experience');
              if (value) {
                const richTextParagraphs = this.richTextProcessor.parseRichTextToDocx(value, baseStyles);
                elements.push(...richTextParagraphs);
              }
              break;
            default:
              value = this.applyFieldMasking(exp[fieldName], fieldName, 'experience');
              if (value) elements.push(this.styler.createItemSubtitle(value, baseStyles));
          }
        });
        // Optionally add a blank paragraph for spacing between experiences
        elements.push(new Paragraph({ text: '', spacing: { after: 200 } }));
      });
    } catch (error) {
      console.error('Error rendering experience section:', error);
    }

    return elements;
  }
}
