
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Download } from 'lucide-react';
import { useCVTemplates } from '@/hooks/use-cv-templates';
import { exportCVAsPDF, ProgressDialog } from '@/utils/pdf-export';
import { toast } from 'sonner';

interface PDFExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
}

const PDFExportModal: React.FC<PDFExportModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  employeeName
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [progressSteps, setProgressSteps] = useState([
    { id: 'fetch-employee', label: 'Fetching employee data', isComplete: false, isActive: false },
    { id: 'fetch-template', label: 'Loading CV template', isComplete: false, isActive: false },
    { id: 'process-template', label: 'Processing template', isComplete: false, isActive: false },
    { id: 'prepare-pdf', label: 'Preparing PDF', isComplete: false, isActive: false },
    { id: 'convert-canvas', label: 'Converting to canvas', isComplete: false, isActive: false },
    { id: 'generate-pdf', label: 'Generating PDF', isComplete: false, isActive: false },
    { id: 'finalize', label: 'Finalizing document', isComplete: false, isActive: false },
    { id: 'complete', label: 'Export complete', isComplete: false, isActive: false }
  ]);

  const { templates, isLoading: templatesLoading } = useCVTemplates();

  const handleClose = () => {
    if (!isExporting) {
      setSelectedTemplateId('');
      onClose();
    }
  };

  const handleExport = async () => {
    if (!selectedTemplateId) {
      toast.error('Please select a CV template');
      return;
    }

    setIsExporting(true);
    setShowProgressDialog(true);
    setExportProgress(0);
    
    // Reset progress steps
    setProgressSteps(steps => 
      steps.map(step => ({ ...step, isComplete: false, isActive: false }))
    );

    try {
      await exportCVAsPDF(employeeId, selectedTemplateId, {
        filename: `${employeeName.replace(/\s+/g, '_')}_CV`,
        onProgress: (step, progress) => {
          setExportProgress(progress);
          setProgressSteps(prevSteps => 
            prevSteps.map(s => ({
              ...s,
              isActive: s.id === step,
              isComplete: prevSteps.findIndex(ps => ps.id === step) < prevSteps.findIndex(ps => ps.id === s.id)
            }))
          );
        }
      });

      // Mark all steps as complete
      setProgressSteps(steps => 
        steps.map(step => ({ ...step, isComplete: true, isActive: false }))
      );
      setExportProgress(100);

      toast.success('CV exported successfully!');
      
      // Close progress dialog after a short delay
      setTimeout(() => {
        setShowProgressDialog(false);
        handleClose();
      }, 1500);

    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error(`Failed to export CV: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowProgressDialog(false);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export CV - {employeeName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-select">Select CV Template</Label>
              <Select
                value={selectedTemplateId}
                onValueChange={setSelectedTemplateId}
                disabled={isExporting || templatesLoading}
              >
                <SelectTrigger id="template-select">
                  <SelectValue placeholder={templatesLoading ? "Loading templates..." : "Choose a template"} />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={handleClose}
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleExport}
                disabled={isExporting || !selectedTemplateId || templatesLoading}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ProgressDialog
        isOpen={showProgressDialog}
        onClose={() => setShowProgressDialog(false)}
        title="Exporting CV"
        steps={progressSteps}
        progress={exportProgress}
        allowCancel={false}
      />
    </>
  );
};

export default PDFExportModal;
