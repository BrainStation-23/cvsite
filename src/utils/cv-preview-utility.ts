
import { dataFetcher } from './pdf-export/core/data-fetcher';
import { cvTemplateProcessor } from './pdf-export/core/template-processor';

export interface CVPreviewOptions {
  openInNewTab?: boolean;
}

export async function openCVPreview(
  profileId: string,
  templateId: string,
  options: CVPreviewOptions = {}
): Promise<void> {
  const { openInNewTab = true } = options;
  
  try {
    // Fetch employee and template data
    const { employeeData, templateData } = await dataFetcher.fetchAllData(profileId, templateId);
    
    // Process the template with employee data
    const processedHTML = cvTemplateProcessor.processTemplate(
      templateData.html_template,
      employeeData
    );
    
    if (openInNewTab) {
      // Open in new tab
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(processedHTML);
        newWindow.document.close();
        newWindow.document.title = `CV Preview - ${employeeData.firstName} ${employeeData.lastName}`;
      } else {
        throw new Error('Failed to open new window. Please check your browser settings.');
      }
    } else {
      // Return the HTML for other uses
      return processedHTML as any;
    }
    
  } catch (error) {
    console.error('CV preview failed:', error);
    throw new Error(`CV preview failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
