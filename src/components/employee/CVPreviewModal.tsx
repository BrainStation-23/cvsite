
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, Printer } from 'lucide-react';
import { useCVTemplates } from '@/hooks/use-cv-templates';
import { openCVPreview } from '@/utils/cv-preview-utility';
import { toast } from 'sonner';

interface CVPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
}

const CVPreviewModal: React.FC<CVPreviewModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  employeeName
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isPreviewing, setIsPreviewing] = useState(false);

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
    if (!isPreviewing) {
      setSelectedTemplateId('');
      onClose();
    }
  };

  const handlePreview = async () => {
    if (!selectedTemplateId) {
      toast.error('Please select a CV template');
      return;
    }

    setIsPreviewing(true);

    try {
      await openCVPreview(employeeId, selectedTemplateId);
      toast.success('CV preview opened in new tab!');
      handleClose();
    } catch (error) {
      console.error('Preview failed:', error);
      toast.error('Failed to open preview. Please try again.');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handlePrintPreview = async () => {
    if (!selectedTemplateId) {
      toast.error('Please select a CV template');
      return;
    }

    setIsPreviewing(true);

    try {
      await openCVPreview(employeeId, selectedTemplateId);
      // Small delay to ensure the new tab loads, then trigger print
      setTimeout(() => {
        toast.success('CV preview opened - use Ctrl+P or the print button to print!');
      }, 1000);
      handleClose();
    } catch (error) {
      console.error('Print preview failed:', error);
      toast.error('Failed to open print preview. Please try again.');
    } finally {
      setIsPreviewing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Preview CV - {employeeName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-select">Select CV Template</Label>
            <Select
              value={selectedTemplateId}
              onValueChange={setSelectedTemplateId}
              disabled={isPreviewing || templatesLoading}
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
              disabled={isPreviewing}
            >
              Cancel
            </Button>
            <Button 
              variant="outline"
              onClick={handlePrintPreview}
              disabled={isPreviewing || !selectedTemplateId || templatesLoading}
            >
              {isPreviewing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </>
              )}
            </Button>
            <Button 
              onClick={handlePreview}
              disabled={isPreviewing || !selectedTemplateId || templatesLoading}
            >
              {isPreviewing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Opening Preview...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CVPreviewModal;
