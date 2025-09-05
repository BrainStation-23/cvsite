
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Eye } from 'lucide-react';
import { useCVTemplates } from '@/hooks/use-cv-templates';
import { openCVPreview } from '@/utils/cv-preview-utility';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';

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
  const [popoverOpen, SetPopoverOpen] = useState(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Preview CV - {employeeName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-select">Select CV Template</Label>
            <Popover open={popoverOpen} onOpenChange={SetPopoverOpen}>
              <PopoverTrigger asChild>
              <Button
              variant='outline'
              role='combobox'
              aria-expanded={popoverOpen}
              className='w-full justify-between'
              disabled={isPreviewing || templatesLoading}
            >
              {selectedTemplateId 
              ? enabledTemplates.find(t => t.id === selectedTemplateId)?.name
            : (templatesLoading ? "Loading templates..." : "Choose a template")}
              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
              </Button>  
              </PopoverTrigger>
              <PopoverContent className='w-full p-0'>
                <Command shouldFilter={false}>
                  <CommandInput 
                    placeholder='Search templates...' 
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
                        !templateSearch || t.name.toLowerCase().includes(templateSearch.toLowerCase())
                      )
                      .map((template)=>(
                        <CommandItem
                        key={template.id}
                        value='{template.id}'
                        onSelect={() =>{
                          setSelectedTemplateId(template.id);
                          SetPopoverOpen(false);
                        }}>
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
              disabled={isPreviewing}
            >
              Cancel
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
                  Open Preview
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
