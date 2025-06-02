
import { Paragraph, Table } from 'docx';
import { BaseSectionRenderer } from './BaseSectionRenderer';

export class EducationSectionRenderer extends BaseSectionRenderer {
  render(education: any[], styles: any): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];
    const baseStyles = styles?.baseStyles || {};
    
    try {
      education.forEach((edu) => {
        // Check field visibility and apply masking
        const showDegree = this.isFieldVisible('degree', 'education');
        const showUniversity = this.isFieldVisible('university', 'education');
        const showGpa = this.isFieldVisible('gpa', 'education');
        const showDateRange = this.isFieldVisible('date_range', 'education');

        // Degree and Institution
        if (showDegree || showUniversity) {
          let titleText = '';
          let universityText = '';
          
          if (showDegree) {
            const degree = this.applyFieldMasking(edu.degree?.name || edu.degree_name, 'degree', 'education');
            titleText = degree || '';
          }
          
          if (showUniversity) {
            const university = this.applyFieldMasking(edu.university?.name, 'university', 'education');
            universityText = university ? ` - ${university}` : '';
          }
          
          if (titleText || universityText) {
            elements.push(this.styler.createItemTitle(`${titleText}${universityText}`, baseStyles));
          }
        }

        // Date Range
        if (showDateRange && (edu.start_date || edu.end_date)) {
          const dateRange = this.formatDateRange(edu.start_date, edu.end_date, false);
          const maskedDateRange = this.applyFieldMasking(dateRange, 'date_range', 'education');
          elements.push(this.styler.createItemSubtitle(maskedDateRange, baseStyles));
        }

        // GPA
        if (showGpa) {
          const gpa = this.applyFieldMasking(edu.gpa, 'gpa', 'education');
          if (gpa) {
            elements.push(this.styler.createRegularText(`GPA: ${gpa}`, baseStyles));
          }
        }
      });
    } catch (error) {
      console.error('Error rendering education section:', error);
    }

    return elements;
  }
}
