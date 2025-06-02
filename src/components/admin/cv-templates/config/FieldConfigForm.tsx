
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FieldDisplayConfig {
  id: string;
  field_name: string;
  section_type: string;
  display_label: string;
  default_enabled: boolean;
  default_masked: boolean;
  default_mask_value?: string;
  default_order: number;
  field_type: string;
  is_system_field: boolean;
}

interface FieldConfigFormProps {
  config: FieldDisplayConfig;
  onFieldChange: (field: string, value: any) => void;
}

const FieldConfigForm: React.FC<FieldConfigFormProps> = ({
  config,
  onFieldChange
}) => {
  const sectionTypes = [
    'general', 'technical_skills', 'specialized_skills', 
    'experience', 'education', 'training', 'achievements', 'projects'
  ];

  const fieldTypes = ['text', 'number', 'date', 'boolean', 'array', 'image', 'richtext'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="field_name">Field Name</Label>
          <Input
            id="field_name"
            value={config.field_name}
            onChange={(e) => onFieldChange('field_name', e.target.value)}
            placeholder="Enter field name"
          />
        </div>
        <div>
          <Label htmlFor="display_label">Display Label</Label>
          <Input
            id="display_label"
            value={config.display_label}
            onChange={(e) => onFieldChange('display_label', e.target.value)}
            placeholder="Enter display label"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="section_type">Section Type</Label>
          <Select 
            value={config.section_type} 
            onValueChange={(value) => onFieldChange('section_type', value)}
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
            value={config.field_type} 
            onValueChange={(value) => onFieldChange('field_type', value)}
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
            value={config.default_order}
            onChange={(e) => onFieldChange('default_order', parseInt(e.target.value))}
            min={1}
          />
        </div>
        <div>
          <Label htmlFor="default_mask_value">Default Mask Value</Label>
          <Input
            id="default_mask_value"
            value={config.default_mask_value || ''}
            onChange={(e) => onFieldChange('default_mask_value', e.target.value)}
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
            checked={config.default_enabled}
            onCheckedChange={(checked) => onFieldChange('default_enabled', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="default_masked">Default Masked</Label>
            <p className="text-sm text-gray-500">Mask this field by default in new templates</p>
          </div>
          <Switch
            id="default_masked"
            checked={config.default_masked}
            onCheckedChange={(checked) => onFieldChange('default_masked', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="is_system_field">System Field</Label>
            <p className="text-sm text-gray-500">Mark as a core system field</p>
          </div>
          <Switch
            id="is_system_field"
            checked={config.is_system_field}
            onCheckedChange={(checked) => onFieldChange('is_system_field', checked)}
          />
        </div>
      </div>
    </div>
  );
};

export default FieldConfigForm;
