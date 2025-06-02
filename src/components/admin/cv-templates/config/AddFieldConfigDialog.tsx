
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFieldDisplayConfig } from '@/hooks/use-field-display-config';

interface AddFieldConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFieldAdded: () => void;
}

const AddFieldConfigDialog: React.FC<AddFieldConfigDialogProps> = ({
  open,
  onOpenChange,
  onFieldAdded
}) => {
  const { addConfig } = useFieldDisplayConfig();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    field_name: '',
    section_type: 'general',
    display_label: '',
    default_enabled: true,
    default_masked: false,
    default_order: 1,
    field_type: 'text',
    is_system_field: false,
    default_mask_value: ''
  });

  const sectionTypes = [
    'general', 'technical_skills', 'specialized_skills', 
    'experience', 'education', 'training', 'achievements', 'projects'
  ];

  const fieldTypes = ['text', 'number', 'date', 'boolean', 'array', 'image', 'richtext'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    
    const success = await addConfig(formData);
    if (success) {
      setFormData({
        field_name: '',
        section_type: 'general',
        display_label: '',
        default_enabled: true,
        default_masked: false,
        default_order: 1,
        field_type: 'text',
        is_system_field: false,
        default_mask_value: ''
      });
      onFieldAdded();
    }
    setIsAdding(false);
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Field Configuration</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="field_name">Field Name *</Label>
              <Input
                id="field_name"
                value={formData.field_name}
                onChange={(e) => handleFieldChange('field_name', e.target.value)}
                placeholder="Enter field name"
                required
              />
            </div>
            <div>
              <Label htmlFor="display_label">Display Label *</Label>
              <Input
                id="display_label"
                value={formData.display_label}
                onChange={(e) => handleFieldChange('display_label', e.target.value)}
                placeholder="Enter display label"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="section_type">Section Type</Label>
              <Select 
                value={formData.section_type} 
                onValueChange={(value) => handleFieldChange('section_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sectionTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="field_type">Field Type</Label>
              <Select 
                value={formData.field_type} 
                onValueChange={(value) => handleFieldChange('field_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="default_order">Display Order</Label>
              <Input
                id="default_order"
                type="number"
                value={formData.default_order}
                onChange={(e) => handleFieldChange('default_order', parseInt(e.target.value))}
                min={1}
              />
            </div>
            <div>
              <Label htmlFor="default_mask_value">Default Mask Value</Label>
              <Input
                id="default_mask_value"
                value={formData.default_mask_value}
                onChange={(e) => handleFieldChange('default_mask_value', e.target.value)}
                placeholder="e.g., ***-****"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="default_enabled">Default Enabled</Label>
                <p className="text-sm text-gray-500">Show this field by default in new templates</p>
              </div>
              <Switch
                id="default_enabled"
                checked={formData.default_enabled}
                onCheckedChange={(checked) => handleFieldChange('default_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="default_masked">Default Masked</Label>
                <p className="text-sm text-gray-500">Mask this field by default in new templates</p>
              </div>
              <Switch
                id="default_masked"
                checked={formData.default_masked}
                onCheckedChange={(checked) => handleFieldChange('default_masked', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_system_field">System Field</Label>
                <p className="text-sm text-gray-500">Mark as a core system field</p>
              </div>
              <Switch
                id="is_system_field"
                checked={formData.is_system_field}
                onCheckedChange={(checked) => handleFieldChange('is_system_field', checked)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button type="submit" disabled={isAdding} className="flex-1">
              {isAdding ? 'Adding...' : 'Add Field Configuration'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isAdding}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFieldConfigDialog;
