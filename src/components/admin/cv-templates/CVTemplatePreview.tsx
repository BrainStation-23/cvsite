import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTemplateEngine } from '@/hooks/use-template-engine';
import { useCVTemplates } from '@/hooks/use-cv-templates';
import { Button } from '@/components/ui/button';
import { Download, Maximize, FileDown, Printer } from 'lucide-react';
import { CVRenderer } from './CVRenderer';
import { generateFullCVHTML } from '@/utils/cv-html-generator';
import { exportCVAsPDF, ProgressDialog, ProgressStep } from '@/utils/pdf-export';
import { openCVPreview } from '@/utils/cv-preview-utility';
import { dataFetcher } from '@/utils/pdf-export/core/data-fetcher';
import { cvTemplateProcessor } from '@/utils/pdf-export/core/template-processor';
import { toast } from 'sonner';

interface CVTemplatePreviewProps {
  htmlTemplate: string;
  selectedEmployeeId: string | null;
}

export const CVTemplatePreview: React.FC<CVTemplatePreviewProps> = ({
  htmlTemplate,
  selectedEmployeeId,
}) => {
  const { id: templateId } = useParams<{ id: string }>();
  const { templates, isLoading: templatesLoading } = useCVTemplates();
  
  const [employeeData, setEmployeeData] = useState(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  
  const { processedHTML, error, isProcessing } = useTemplateEngine(htmlTemplate, employeeData);
  
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [progress, setProgress] = useState(0);

  // Get current template
  const currentTemplate = templates.find(t => t.id === templateId);

  // Fetch employee data using fetchAllData to apply template limits
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!selectedEmployeeId || !templateId) {
        setEmployeeData(null);
        return;
      }

      setIsLoadingEmployee(true);
      setEmployeeError(null);

      try {
        // Use fetchAllData to automatically apply template limits
        const { employeeData: fetchedEmployeeData } = await dataFetcher.fetchAllData(
          selectedEmployeeId, 
          templateId
        );
        setEmployeeData(fetchedEmployeeData);
      } catch (error) {
        console.error('Failed to fetch employee data:', error);
        setEmployeeError(error instanceof Error ? error.message : 'Failed to fetch employee data');
        setEmployeeData(null);
      } finally {
        setIsLoadingEmployee(false);
      }
    };

    fetchEmployeeData();
  }, [selectedEmployeeId, templateId]);

  const handleFullscreen = async () => {
    if (!selectedEmployeeId || !templateId) {
      toast.error('Please select an employee to preview CV');
      return;
    }
    
    try {
      await openCVPreview(selectedEmployeeId, templateId);
    } catch (error) {
      console.error('Fullscreen preview failed:', error);
      toast.error('Failed to open fullscreen preview. Please try again.');
    }
  };

  const handlePrint = () => {
    if (!selectedEmployeeId) {
      toast.error('Please select an employee to print CV');
      return;
    }
    
    try {
      window.print();
    } catch (error) {
      console.error('Print failed:', error);
      toast.error('Failed to open print dialog. Please try again.');
    }
  };

  const handleDownload = async () => {
    if (!selectedEmployeeId || !templateId) {
      toast.error('Please select an employee to download HTML');
      return;
    }
    
    try {
      // Use dynamic data source from template
      const { employeeData, templateData } = await dataFetcher.fetchAllData(selectedEmployeeId, templateId);
      const processedHTML = cvTemplateProcessor.processTemplate(
        templateData.html_template,
        employeeData,
        templateData
      );
      
      const fullHTML = generateFullCVHTML(processedHTML, 'download');
      const blob = new Blob([fullHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${employeeData.employee_id || 'employee'}_cv.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('HTML downloaded successfully');
    } catch (error) {
      console.error('HTML download failed:', error);
      toast.error('Failed to download HTML. Please try again.');
    }
  };

  const handlePDFDownload = async () => {
    if (!selectedEmployeeId || !templateId) {
      toast.error('Please select an employee to generate PDF');
      return;
    }
    
    try {
      setShowProgressDialog(true);
      
      await exportCVAsPDF(selectedEmployeeId, templateId, {
        onProgress: (steps, progressValue) => {
          setProgressSteps(steps);
          setProgress(progressValue);
        }
      });
      
      // Keep dialog open for a moment to show completion
      setTimeout(() => {
        setShowProgressDialog(false);
        toast.success('PDF downloaded successfully');
      }, 1000);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      setShowProgressDialog(false);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-3 border-b bg-muted/50 flex items-center justify-between">
          <div>
            <h3 className="font-medium text-sm">CV Preview</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedEmployeeId ? `Live preview with employee data (${currentTemplate?.data_source_function || 'default'})` : 'Template preview (no data)'}
            </p>
          </div>
          <div className="flex gap-2">
            {processedHTML && (
              <>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleFullscreen}
                  disabled={!selectedEmployeeId}
                >
                  <Maximize className="h-3 w-3 mr-1" />
                  Fullscreen
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handlePrint}
                  disabled={!selectedEmployeeId}
                >
                  <Printer className="h-3 w-3 mr-1" />
                  Print
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleDownload}
                  disabled={!selectedEmployeeId}
                >
                  <Download className="h-3 w-3 mr-1" />
                  HTML
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handlePDFDownload}
                  disabled={!selectedEmployeeId}
                >
                  <FileDown className="h-3 w-3 mr-1" />
                  PDF
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto bg-gray-100">
          {(isLoadingEmployee || templatesLoading) && selectedEmployeeId && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">
                  {templatesLoading ? 'Loading template...' : 'Loading employee data...'}
                </p>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Processing template...</p>
              </div>
            </div>
          )}

          {(error || employeeError) && (
            <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-md">
              <h4 className="text-sm font-medium text-red-800 mb-2">
                {employeeError ? 'Data Fetch Error' : 'Template Error'}
              </h4>
              <p className="text-sm text-red-600">{employeeError || error}</p>
            </div>
          )}

          {!isLoadingEmployee && !templatesLoading && !isProcessing && !error && !employeeError && (
            <>
              {!selectedEmployeeId && !htmlTemplate.trim() && (
                <div className="flex items-center justify-center h-full text-center p-8">
                  <div>
                    <div className="text-4xl mb-4">📄</div>
                    <h3 className="text-lg font-medium mb-2">Start Building Your CV Template</h3>
                    <p className="text-muted-foreground">
                      Write HTML code in the editor and select an employee to see the preview
                    </p>
                  </div>
                </div>
              )}

              {(htmlTemplate.trim() || processedHTML) && processedHTML && (
                <div className="flex items-center justify-center p-8">
                  <CVRenderer 
                    processedHTML={processedHTML} 
                    mode="preview" 
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Progress Dialog */}
      <ProgressDialog
        isOpen={showProgressDialog}
        onClose={() => setShowProgressDialog(false)}
        title="Generating PDF"
        steps={progressSteps}
        progress={progress}
        allowCancel={false}
      />
    </>
  );
};
