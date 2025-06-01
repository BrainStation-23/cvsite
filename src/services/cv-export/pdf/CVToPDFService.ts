
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HTMLToPDFService, PDFExportOptions } from './HTMLToPDFService';
import { IntelligentPageDistributor } from '@/components/admin/cv-templates/IntelligentPageDistributor';
import { createCVStyles } from '@/components/admin/cv-templates/cv-preview-styles';
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

    // Create styles for the CV
    const styles = createCVStyles(template);

    // Generate the CV HTML content by rendering React components
    const htmlContent = await this.generateCVHTML({
      template,
      profile,
      sections,
      fieldMappings,
      styles,
      hidePreviewInfo
    });

    console.log('CVToPDFService - Generated HTML length:', htmlContent.length);

    // Convert HTML to PDF
    const filename = this.generateFileName(profile, template.name);
    return await HTMLToPDFService.exportHTMLStringToPDF(htmlContent, {
      filename,
      format: 'a4',
      orientation: template.orientation || 'portrait',
      margin: [10, 10, 10, 10],
      ...pdfOptions
    });
  }

  private static async generateCVHTML(options: {
    template: CVTemplate;
    profile: any;
    sections: any[];
    fieldMappings: any[];
    styles: any;
    hidePreviewInfo: boolean;
  }): Promise<string> {
    const { template, profile, sections, fieldMappings, styles, hidePreviewInfo } = options;

    console.log('CVToPDFService - Generating HTML for profile:', profile?.first_name, profile?.last_name);

    return new Promise((resolve, reject) => {
      try {
        // Create a temporary container
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '-9999px';
        tempContainer.style.width = template.orientation === 'portrait' ? '210mm' : '297mm';
        tempContainer.style.height = template.orientation === 'portrait' ? '297mm' : '210mm';
        document.body.appendChild(tempContainer);

        // Create React root
        const root = createRoot(tempContainer);

        // Render the CV components
        const cvElement = React.createElement(IntelligentPageDistributor, {
          sections,
          fieldMappings,
          profile,
          styles,
          layoutConfig: template.layout_config || {}
        });

        // Render and wait for completion
        root.render(cvElement);

        // Give React time to render
        setTimeout(() => {
          try {
            const htmlContent = this.wrapHTMLForPDF(tempContainer.innerHTML, styles, hidePreviewInfo);
            
            // Cleanup
            root.unmount();
            document.body.removeChild(tempContainer);
            
            console.log('CVToPDFService - HTML generated successfully');
            resolve(htmlContent);
          } catch (error) {
            console.error('CVToPDFService - Error extracting HTML:', error);
            root.unmount();
            document.body.removeChild(tempContainer);
            reject(error);
          }
        }, 1000); // Give enough time for React to render

      } catch (error) {
        console.error('CVToPDFService - Error in generateCVHTML:', error);
        reject(error);
      }
    });
  }

  private static wrapHTMLForPDF(content: string, styles: any, hidePreviewInfo: boolean): string {
    const baseStyles = styles?.baseStyles || {};
    
    // Generate CSS from styles object
    const cssStyles = `
      <style>
        @page {
          size: ${baseStyles.width || '210mm'} ${baseStyles.height || '297mm'};
          margin: 0;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: ${baseStyles.fontFamily || 'Arial, sans-serif'};
          font-size: ${baseStyles.fontSize || '12pt'};
          line-height: ${baseStyles.lineHeight || '1.4'};
          color: ${baseStyles.color || '#333'};
          background: white;
          margin: 0;
          padding: 0;
        }
        
        .cv-container {
          width: 100%;
          background: white;
          margin: 0;
          padding: 0;
        }
        
        .cv-page {
          width: ${baseStyles.width || '210mm'};
          min-height: ${baseStyles.height || '297mm'};
          padding: ${baseStyles.padding || '20mm'};
          background: white;
          page-break-after: always;
          margin: 0 auto;
        }
        
        .cv-page:last-child {
          page-break-after: avoid;
        }
        
        ${hidePreviewInfo ? '.preview-info { display: none !important; }' : ''}
        
        /* Ensure proper text rendering */
        h1, h2, h3, h4, h5, h6 {
          page-break-after: avoid;
          margin-bottom: 8pt;
        }
        
        p {
          margin-bottom: 6pt;
        }
        
        /* Prevent content from being cut off */
        .section {
          page-break-inside: avoid;
          margin-bottom: 12pt;
        }
        
        /* Skills styling */
        .skills-container {
          display: flex;
          flex-wrap: wrap;
          gap: 4pt;
        }
        
        .skill-tag {
          background: #3b82f6;
          color: white;
          padding: 2pt 6pt;
          border-radius: 3pt;
          font-size: 10pt;
          display: inline-block;
          margin-right: 4pt;
          margin-bottom: 4pt;
        }
        
        /* Grid layout support */
        .grid {
          display: grid;
        }
        
        /* Typography */
        .font-bold {
          font-weight: bold;
        }
        
        .text-center {
          text-align: center;
        }
        
        .text-sm {
          font-size: 10pt;
        }
        
        .text-gray-600 {
          color: #6b7280;
        }
        
        .text-blue-600 {
          color: #2563eb;
        }
        
        /* Margins and padding */
        .mb-2 { margin-bottom: 6pt; }
        .mb-4 { margin-bottom: 12pt; }
        .mb-6 { margin-bottom: 18pt; }
        .mt-2 { margin-top: 6pt; }
        .mt-4 { margin-top: 12pt; }
        .p-2 { padding: 6pt; }
        .p-4 { padding: 12pt; }
        
        /* Borders */
        .border-b {
          border-bottom: 1px solid #e5e7eb;
        }
        
        .border-b-2 {
          border-bottom: 2px solid #1f2937;
        }
        
        /* Flexbox */
        .flex {
          display: flex;
        }
        
        .justify-between {
          justify-content: space-between;
        }
        
        .items-center {
          align-items: center;
        }
        
        .items-start {
          align-items: flex-start;
        }
        
        .flex-wrap {
          flex-wrap: wrap;
        }
        
        .gap-2 {
          gap: 6pt;
        }
      </style>
    `;

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>CV Export</title>
          ${cssStyles}
        </head>
        <body>
          <div class="cv-container">
            ${content}
          </div>
        </body>
      </html>
    `;
  }

  private static generateFileName(profile: any, templateName: string): string {
    const firstName = profile?.first_name || 'CV';
    const lastName = profile?.last_name || '';
    const name = `${firstName}${lastName ? '_' + lastName : ''}`;
    const template = templateName.replace(/\s+/g, '_');
    return `${name}_${template}_CV.pdf`;
  }
}
