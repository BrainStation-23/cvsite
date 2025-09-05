
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Download, Eye } from 'lucide-react';
import { useCVTemplates } from '@/hooks/use-cv-templates';
import { exportCVAsPDF, ProgressDialog, ProgressStep } from '@/utils/pdf-export';
import { openCVPreview } from '@/utils/cv-preview-utility';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';

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
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');

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

  const handlePreview = async () => {
    if (!selectedTemplateId) {
      toast.error('Please select a CV template');
      return;
    }

    try {
      await openCVPreview(employeeId, selectedTemplateId);
    } catch (error) {
      console.error('Preview failed:', error);
      toast.error('Failed to open preview. Please try again.');
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
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={popoverOpen}
                    className="w-full justify-between"
                    disabled={isExporting || templatesLoading}
                    id="template-select"
                  >
                    {selectedTemplateId
                      ? enabledTemplates.find(t => t.id === selectedTemplateId)?.name
                      : (templatesLoading ? "Loading templates..." : "Choose a template")}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search templates..."
                      value={templateSearch}
                      onValueChange={setTemplateSearch}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {templatesLoading ? "Loading..." : "No template found."}
                      </CommandEmpty>
                      <CommandGroup>
                        {enabledTemplates
                          .filter(t =>
                            !templateSearch ||
                            t.name.toLowerCase().includes(templateSearch.toLowerCase())
                          )
                          .map((template) => (
                            <CommandItem
                              key={template.id}
                              value={template.id}
                              onSelect={() => {
                                setSelectedTemplateId(template.id);
                                setPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={
                                  selectedTemplateId === template.id
                                    ? "mr-2 h-4 w-4 opacity-100"
                                    : "mr-2 h-4 w-4 opacity-0"
                                }
                              />
                              <span>
                                {template.name}
                              </span>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
                variant="outline"
                onClick={handlePreview}
                disabled={isExporting || !selectedTemplateId || templatesLoading}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
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
