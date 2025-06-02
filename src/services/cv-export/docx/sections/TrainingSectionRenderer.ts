
import { Paragraph, Table } from 'docx';
import { BaseSectionRenderer } from './BaseSectionRenderer';

export class TrainingSectionRenderer extends BaseSectionRenderer {
  render(trainings: any[], styles: any): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];
    const baseStyles = styles?.baseStyles || {};
    
    try {
      trainings.forEach((training) => {
        // Check field visibility and apply masking
        const showTitle = this.isFieldVisible('title', 'training');
        const showProvider = this.isFieldVisible('provider', 'training');
        const showDescription = this.isFieldVisible('description', 'training');
        const showCertificationDate = this.isFieldVisible('certification_date', 'training');

        // Training Title and Provider
        if (showTitle || showProvider) {
          let titleText = '';
          let providerText = '';
          
          if (showTitle) {
            const title = this.applyFieldMasking(training.title, 'title', 'training');
            titleText = title || '';
          }
          
          if (showProvider) {
            const provider = this.applyFieldMasking(training.provider, 'provider', 'training');
            providerText = provider ? ` - ${provider}` : '';
          }
          
          if (titleText || providerText) {
            elements.push(this.styler.createItemTitle(`${titleText}${providerText}`, baseStyles));
          }
        }

        // Certification Date
        if (showCertificationDate && training.certification_date) {
          const certDate = this.applyFieldMasking(
            new Date(training.certification_date).toLocaleDateString(), 
            'certification_date', 
            'training'
          );
          elements.push(this.styler.createItemSubtitle(certDate, baseStyles));
        }

        // Description
        if (showDescription) {
          const description = this.applyFieldMasking(training.description, 'description', 'training');
          if (description) {
            elements.push(this.styler.createRegularText(description, baseStyles));
          }
        }
      });
    } catch (error) {
      console.error('Error rendering training section:', error);
    }

    return elements;
  }
}
