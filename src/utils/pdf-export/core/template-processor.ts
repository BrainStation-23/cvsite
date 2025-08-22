
import { mapEmployeeData } from '@/utils/template-data-mapper';
import { TemplateProcessor as BaseTemplateProcessor } from '@/utils/template-processor';
import { generateFullCVHTML } from '@/utils/cv-html-generator';
import { EmployeeProfile } from '@/hooks/types/employee-profiles';
import { CVTemplate } from '@/hooks/use-cv-templates';

export class CVTemplateProcessor {
  private processor: BaseTemplateProcessor;

  constructor() {
    this.processor = new BaseTemplateProcessor({ debugMode: false });
  }

  processTemplate(htmlTemplate: string, employeeData: EmployeeProfile, templateConfig?: CVTemplate): string {
    const mappedData = mapEmployeeData(employeeData);
    let processedHTML = this.processor.process(htmlTemplate, mappedData);
    
    // Apply orientation-specific styling if template config is provided
    if (templateConfig?.orientation) {
      processedHTML = this.applyOrientationStyles(processedHTML, templateConfig.orientation);
    }
    
    return generateFullCVHTML(processedHTML, 'download');
  }

  private applyOrientationStyles(html: string, orientation: 'portrait' | 'landscape'): string {
    // Add orientation-specific CSS classes or styles
    const orientationClass = `cv-${orientation}`;
    
    // If there's a body tag, add the orientation class
    if (html.includes('<body')) {
      html = html.replace(
        /<body([^>]*)>/,
        `<body$1 class="${orientationClass}">`
      );
    } else {
      // If no body tag, wrap content in a div with orientation class
      html = `<div class="${orientationClass}">${html}</div>`;
    }
    
    // Add orientation-specific CSS
    const orientationCSS = orientation === 'landscape' 
      ? `
        <style>
          .cv-landscape {
            width: 100%;
            max-width: 297mm;
            min-height: 210mm;
          }
          @media print {
            .cv-landscape {
              page-orientation: landscape;
            }
          }
        </style>
      `
      : `
        <style>
          .cv-portrait {
            width: 100%;
            max-width: 210mm;
            min-height: 297mm;
          }
          @media print {
            .cv-portrait {
              page-orientation: portrait;
            }
          }
        </style>
      `;
    
    // Insert CSS before closing head tag or at the beginning
    if (html.includes('</head>')) {
      html = html.replace('</head>', `${orientationCSS}</head>`);
    } else {
      html = orientationCSS + html;
    }
    
    return html;
  }
}

export const cvTemplateProcessor = new CVTemplateProcessor();
