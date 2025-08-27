
import { dataFetcher } from './core/data-fetcher';
import { cvTemplateProcessor } from './core/template-processor';
import { pdfEngine } from './core/pdf-engine';
import { ProgressTracker, ProgressCallback } from './core/progress-tracker';

export interface PDFExportOptions {
  filename?: string;
  onProgress?: ProgressCallback;
}

export async function exportCVAsPDF(
  profileId: string,
  templateId: string,
  options: PDFExportOptions = {}
): Promise<void> {
  const { onProgress } = options;
  const progressTracker = new ProgressTracker(onProgress);

  try {
    // Step 1: Fetch template and employee data with limits
    progressTracker.startStep('fetch-template');
    progressTracker.startStep('fetch-employee');
    const { employeeData, templateData } = await dataFetcher.fetchAllData(profileId, templateId);
    progressTracker.completeStep('fetch-template');
    progressTracker.completeStep('fetch-employee');

    // Step 2: Process template with dynamic configuration
    progressTracker.startStep('process-template');
    const processedHTML = cvTemplateProcessor.processTemplate(
      templateData.html_template, 
      employeeData,
      templateData // Pass template config for orientation and other settings
    );
    progressTracker.completeStep('process-template');

    // Step 3: Prepare PDF
    progressTracker.startStep('prepare-pdf');
    // Small delay to show the step
    await new Promise(resolve => setTimeout(resolve, 200));
    progressTracker.completeStep('prepare-pdf');

    // Step 4: Generate PDF with Puppeteer (with fallback handling)
    progressTracker.startStep('puppeteer-service');
    
    try {
      await pdfEngine.generatePDF(processedHTML, {
        filename: `${employeeData.employee_id}_CV`,
        includeStandardCSS: true,
        validateTemplate: true,
        pageSize: 'a4'
      });
      
      progressTracker.completeStep('puppeteer-service');
    } catch (error) {
      // Check if error indicates fallback was used
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Falling back') || errorMessage.includes('fallback')) {
        progressTracker.enableFallbackMode();
        progressTracker.startStep('fallback-pdf');
        // PDF generation already completed in the fallback, just mark as complete
        progressTracker.completeStep('fallback-pdf');
      } else {
        throw error;
      }
    }

    // Step 5: Finalize
    progressTracker.startStep('finalize');
    await new Promise(resolve => setTimeout(resolve, 300));
    progressTracker.completeStep('finalize');

    // Step 6: Complete
    progressTracker.startStep('complete');
    progressTracker.completeStep('complete');

  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Re-export components for external use
export { ProgressDialog } from './ui/ProgressDialog';
export type { ProgressStep } from './ui/ProgressDialog';
export { ProgressTracker } from './core/progress-tracker';
