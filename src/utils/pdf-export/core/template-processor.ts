
import { mapEmployeeData } from '@/utils/template-data-mapper';
import { TemplateProcessor as BaseTemplateProcessor } from '@/utils/template-processor';
import { generateFullCVHTML } from '@/utils/cv-html-generator';
import { EmployeeProfile } from '@/hooks/types/employee-profiles';

export class CVTemplateProcessor {
  private processor: BaseTemplateProcessor;

  constructor() {
    this.processor = new BaseTemplateProcessor({ debugMode: false });
  }

  processTemplate(htmlTemplate: string, employeeData: EmployeeProfile): string {
    const mappedData = mapEmployeeData(employeeData);
    const processedHTML = this.processor.process(htmlTemplate, mappedData);
    return generateFullCVHTML(processedHTML, 'download');
  }
}

export const cvTemplateProcessor = new CVTemplateProcessor();
