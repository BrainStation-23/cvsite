import React from 'react';
import { useTemplateEngine } from '@/hooks/use-template-engine';
import { useEmployeeData } from '@/hooks/use-employee-data';
import { useShadowDOM } from '@/hooks/use-shadow-dom';
import { extractCSSFromHTML } from '@/utils/css-extractor';
import { Button } from '@/components/ui/button';
import { Download, Maximize, RefreshCw } from 'lucide-react';

interface CVTemplatePreviewProps {
  htmlTemplate: string;
  selectedEmployeeId: string | null;
}

export const CVTemplatePreview: React.FC<CVTemplatePreviewProps> = ({
  htmlTemplate,
  selectedEmployeeId,
}) => {
  const { data: employeeData, isLoading: isLoadingEmployee } = useEmployeeData(selectedEmployeeId || '');
  const { processedHTML, error, isProcessing } = useTemplateEngine(htmlTemplate, employeeData);

  // Extract CSS and HTML for Shadow DOM isolation
  const { css: extractedCSS, html: cleanHTML } = React.useMemo(() => {
    if (!processedHTML) return { css: '', html: '' };
    return extractCSSFromHTML(processedHTML);
  }, [processedHTML]);

  // Use Shadow DOM for CSS isolation
  const { ref: shadowRef, refresh: refreshShadowDOM } = useShadowDOM({
    html: cleanHTML,
    styles: extractedCSS
  });

  const handleFullscreen = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>CV Preview</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
              .container { max-width: 800px; margin: 0 auto; }
              ${extractedCSS}
            </style>
          </head>
          <body>
            <div class="container">${cleanHTML}</div>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const handleDownload = () => {
    const fullHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>CV Preview</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .container { max-width: 800px; margin: 0 auto; }
            ${extractedCSS}
          </style>
        </head>
        <body>
          <div class="container">${cleanHTML}</div>
        </body>
      </html>
    `;
    
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cv-preview.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    refreshShadowDOM();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b bg-muted/50 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm">CV Preview</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {selectedEmployeeId ? 'Live preview with employee data' : 'Template preview (no data)'}
          </p>
        </div>
        <div className="flex gap-2">
          {processedHTML && (
            <>
              <Button size="sm" variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
              <Button size="sm" variant="outline" onClick={handleFullscreen}>
                <Maximize className="h-3 w-3 mr-1" />
                Fullscreen
              </Button>
              <Button size="sm" variant="outline" onClick={handleDownload}>
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto">
        {isLoadingEmployee && selectedEmployeeId && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading employee data...</p>
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

        {error && (
          <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-md">
            <h4 className="text-sm font-medium text-red-800 mb-2">Template Error</h4>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!isLoadingEmployee && !isProcessing && !error && (
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

            {(htmlTemplate.trim() || processedHTML) && (
              <div className="p-4">
                <div 
                  ref={shadowRef}
                  className="bg-white shadow-lg border rounded-lg p-6 max-w-4xl mx-auto"
                  style={{ minHeight: '297mm' }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
