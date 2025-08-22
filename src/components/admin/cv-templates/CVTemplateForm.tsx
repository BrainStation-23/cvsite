
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CVTemplate } from '@/hooks/use-cv-templates';

interface CVTemplateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { 
    name: string; 
    html_template: string; 
    enabled?: boolean; 
    is_default?: boolean;
    data_source_function?: string;
    orientation?: 'portrait' | 'landscape';
  }) => void;
  template?: CVTemplate;
  isLoading?: boolean;
}

// Available RPC functions for CV data
const AVAILABLE_DATA_SOURCES = [
  { value: 'get_employee_data_masked', label: 'Employee Data (Masked)' },
  { value: 'get_employee_data', label: 'Employee Data (Full)' },
];

export const CVTemplateForm: React.FC<CVTemplateFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  template,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [htmlTemplate, setHtmlTemplate] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [dataSourceFunction, setDataSourceFunction] = useState('get_employee_data_masked');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    if (template) {
      setName(template.name);
      setHtmlTemplate(template.html_template);
      setEnabled(template.enabled);
      setIsDefault(template.is_default);
      setDataSourceFunction(template.data_source_function);
      setOrientation(template.orientation);
    } else {
      setName('');
      setHtmlTemplate('');
      setEnabled(true);
      setIsDefault(false);
      setDataSourceFunction('get_employee_data_masked');
      setOrientation('portrait');
    }
  }, [template, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && htmlTemplate.trim()) {
      onSubmit({
        name: name.trim(),
        html_template: htmlTemplate.trim(),
        enabled,
        is_default: isDefault,
        data_source_function: dataSourceFunction,
        orientation,
      });
    }
  };

  const handleClose = () => {
    setName('');
    setHtmlTemplate('');
    setEnabled(true);
    setIsDefault(false);
    setDataSourceFunction('get_employee_data_masked');
    setOrientation('portrait');
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_source">Data Source</Label>
              <Select value={dataSourceFunction} onValueChange={setDataSourceFunction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select data source..." />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_DATA_SOURCES.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Orientation</Label>
              <RadioGroup value={orientation} onValueChange={(value: 'portrait' | 'landscape') => setOrientation(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="portrait" id="portrait" />
                  <Label htmlFor="portrait">Portrait</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="landscape" id="landscape" />
                  <Label htmlFor="landscape">Landscape</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
              <Label htmlFor="enabled">Enabled</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_default"
                checked={isDefault}
                onCheckedChange={setIsDefault}
              />
              <Label htmlFor="is_default">Default Template</Label>
            </div>
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
