
import { Paragraph, Table } from 'docx';
import { BaseSectionRenderer } from './BaseSectionRenderer';

export class EducationSectionRenderer extends BaseSectionRenderer {
  render(education: any[], styles: any): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];
    const baseStyles = styles?.baseStyles || {};
    
    try {
      education.forEach((edu) => {
        // Apply masking to each field
        const degree = this.maskingService.applyMasking(edu.degree?.name || edu.degree_name, 'degree', 'education');
        const university = this.maskingService.applyMasking(edu.university?.name, 'university', 'education');
        const gpa = this.maskingService.applyMasking(edu.gpa, 'gpa', 'education');

        // Degree and Institution
        if (degree || university) {
          const titleText = degree || '';
          const universityText = university ? ` - ${university}` : '';
          elements.push(this.styler.createItemTitle(`${titleText}${universityText}`, baseStyles));
        }

        // Date Range
        if (edu.start_date || edu.end_date) {
          const dateRange = this.formatDateRange(edu.start_date, edu.end_date, false);
          const maskedDateRange = this.maskingService.applyMasking(dateRange, 'date_range', 'education');
          elements.push(this.styler.createItemSubtitle(maskedDateRange, baseStyles));
        }

        // GPA
        if (gpa) {
          elements.push(this.styler.createRegularText(`GPA: ${gpa}`, baseStyles));
        }
      });
    } catch (error) {
      console.error('Error rendering education section:', error);
    }

    return elements;
  }
}
