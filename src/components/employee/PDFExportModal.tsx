
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Download } from 'lucide-react';
import { useCVTemplates } from '@/hooks/use-cv-templates';
import { exportCVAsPDF, ProgressDialog, ProgressStep } from '@/utils/pdf-export';
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
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);

  const { templates, isLoading: templatesLoading } = useCVTemplates();

  // Filter for enabled templates only
  const enabledTemplates = templates.filter(template => template.enabled);

  // Auto-select default template when modal opens
  useEffect(() => {
    if (isOpen && enabledTemplates.length > 0 && !selectedTemplateId) {
      const defaultTemplate = enabledTemplates.find(template => template.is_default);
      if (defaultTemplate) {
        setSelectedTemplateId(defaultTemplate.id);
      }
    }
  }, [isOpen, enabledTemplates, selectedTemplateId]);

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
    setProgressSteps([]);

    try {
      await exportCVAsPDF(employeeId, selectedTemplateId, {
        onProgress: (steps: ProgressStep[], progress: number) => {
          setProgressSteps(steps);
          setExportProgress(progress);
        }
      });

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
                  {enabledTemplates.map((template) => (
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
