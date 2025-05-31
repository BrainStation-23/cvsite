
import { Paragraph, Table } from 'docx';
import { BaseSectionRenderer } from './BaseSectionRenderer';

export class TrainingSectionRenderer extends BaseSectionRenderer {
  render(trainings: any[], styles: any): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];
    const baseStyles = styles?.baseStyles || {};
    
    try {
      trainings.forEach((training) => {
        // Apply masking to each field
        const title = this.maskingService.applyMasking(training.title, 'title', 'training');
        const provider = this.maskingService.applyMasking(training.provider, 'provider', 'training');
        const description = this.maskingService.applyMasking(training.description, 'description', 'training');

        // Training Title and Provider
        if (title || provider) {
          const titleText = title || '';
          const providerText = provider ? ` - ${provider}` : '';
          elements.push(this.styler.createItemTitle(`${titleText}${providerText}`, baseStyles));
        }

        // Certification Date
        if (training.certification_date) {
          const certDate = this.maskingService.applyMasking(
            new Date(training.certification_date).toLocaleDateString(), 
            'certification_date', 
            'training'
          );
          elements.push(this.styler.createItemSubtitle(certDate, baseStyles));
        }

        // Description
        if (description) {
          elements.push(this.styler.createRegularText(description, baseStyles));
        }
      });
    } catch (error) {
      console.error('Error rendering training section:', error);
    }

    return elements;
  }
}
