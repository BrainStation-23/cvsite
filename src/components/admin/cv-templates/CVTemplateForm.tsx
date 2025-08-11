
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CVTemplate } from '@/hooks/use-cv-templates';

interface CVTemplateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; html_template: string }) => void;
  template?: CVTemplate;
  isLoading?: boolean;
}

export const CVTemplateForm: React.FC<CVTemplateFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  template,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [htmlTemplate, setHtmlTemplate] = useState('');

  useEffect(() => {
    if (template) {
      setName(template.name);
      setHtmlTemplate(template.html_template);
    } else {
      setName('');
      setHtmlTemplate('');
    }
  }, [template, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && htmlTemplate.trim()) {
      onSubmit({
        name: name.trim(),
        html_template: htmlTemplate.trim(),
      });
    }
  };

  const handleClose = () => {
    setName('');
    setHtmlTemplate('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit CV Template' : 'Create New CV Template'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter template name..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="html_template">HTML Template</Label>
            <textarea
              id="html_template"
              value={htmlTemplate}
              onChange={(e) => setHtmlTemplate(e.target.value)}
              placeholder="Enter HTML template content..."
              required
              className="w-full h-96 p-3 border border-gray-300 rounded-md resize-none font-mono text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim() || !htmlTemplate.trim()}>
              {isLoading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
