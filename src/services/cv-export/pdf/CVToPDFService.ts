
import { HTMLToPDFService, PDFExportOptions } from './HTMLToPDFService';
import { HTMLTemplateGenerator } from './HTMLTemplateGenerator';
import { CVTemplate } from '@/types/cv-templates';

export interface CVPDFExportOptions extends PDFExportOptions {
  template: CVTemplate;
  profile: any;
  sections: any[];
  fieldMappings: any[];
  hidePreviewInfo?: boolean;
}

export class CVToPDFService {
  static async exportCV(options: CVPDFExportOptions): Promise<Blob> {
    const {
      template,
      profile,
      sections,
      fieldMappings,
      hidePreviewInfo = true,
      ...pdfOptions
    } = options;

    console.log('CVToPDFService - Starting CV export with:', {
      template: template.name,
      profile: profile?.first_name + ' ' + profile?.last_name,
      sectionsCount: sections.length,
      fieldMappingsCount: fieldMappings.length
    });

    if (!profile) {
      throw new Error('Profile data is required for PDF export');
    }

    if (!sections || sections.length === 0) {
      console.warn('CVToPDFService - No sections configured, creating basic CV');
    }

    // Create basic styles object for the template
    const styles = {
      baseStyles: {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12pt',
        lineHeight: '1.6',
        color: '#333',
        width: template.orientation === 'landscape' ? '297mm' : '210mm',
        height: template.orientation === 'landscape' ? '210mm' : '297mm'
      }
    };

    // Generate the CV HTML content using the template generator
    const htmlContent = HTMLTemplateGenerator.generateCVHTML({
      profile,
      sections,
      fieldMappings,
      styles
    });

    console.log('CVToPDFService - Generated HTML length:', htmlContent.length);
    console.log('CVToPDFService - HTML preview (first 500 chars):', htmlContent.substring(0, 500));

    if (!htmlContent.trim()) {
      throw new Error('Generated HTML content is empty');
    }

    // Convert HTML to PDF
    const filename = this.generateFileName(profile, template.name);
    return await HTMLToPDFService.exportHTMLStringToPDF(htmlContent, {
      filename,
      format: 'a4',
      orientation: template.orientation || 'portrait',
      margin: [15, 15, 15, 15],
      quality: 0.95,
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        letterRendering: true,
        logging: false
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: template.orientation || 'portrait',
        compress: true
      },
      ...pdfOptions
    });
  }

  private static generateFileName(profile: any, templateName: string): string {
    const firstName = profile?.first_name || 'CV';
    const lastName = profile?.last_name || '';
    const name = `${firstName}${lastName ? '_' + lastName : ''}`;
    const template = templateName.replace(/\s+/g, '_');
    return `${name}_${template}_CV.pdf`;
  }
}
