
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NewFieldConfig {
  field_name: string;
  section_type: string;
  display_label: string;
  default_enabled: boolean;
  default_masked: boolean;
  default_order: number;
  field_type: string;
  is_system_field: boolean;
  default_mask_value: string;
}

interface AddFieldConfigFormProps {
  onAdd: (config: NewFieldConfig) => void;
  onCancel: () => void;
  sectionTypes: string[];
  fieldTypes: string[];
}

const AddFieldConfigForm: React.FC<AddFieldConfigFormProps> = ({
  onAdd,
  onCancel,
  sectionTypes,
  fieldTypes
}) => {
  const [newConfig, setNewConfig] = useState<NewFieldConfig>({
    field_name: '',
    section_type: 'general',
    display_label: '',
    default_enabled: true,
    default_masked: false,
    default_order: 0,
    field_type: 'text',
    is_system_field: false,
    default_mask_value: ''
  });

  const handleSubmit = () => {
    onAdd(newConfig);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Add New Field Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Field Name</Label>
            <Input
              value={newConfig.field_name}
              onChange={(e) => setNewConfig({...newConfig, field_name: e.target.value})}
              placeholder="e.g., first_name"
            />
          </div>
          <div>
            <Label>Section Type</Label>
            <Select 
              value={newConfig.section_type} 
              onValueChange={(value) => setNewConfig({...newConfig, section_type: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sectionTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Display Label</Label>
            <Input
              value={newConfig.display_label}
              onChange={(e) => setNewConfig({...newConfig, display_label: e.target.value})}
              placeholder="e.g., First Name"
            />
          </div>
          <div>
            <Label>Field Type</Label>
            <Select 
              value={newConfig.field_type} 
              onValueChange={(value) => setNewConfig({...newConfig, field_type: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fieldTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Default Order</Label>
            <Input
              type="number"
              value={newConfig.default_order}
              onChange={(e) => setNewConfig({...newConfig, default_order: parseInt(e.target.value) || 0})}
            />
          </div>
          <div>
            <Label>Default Mask Value</Label>
            <Input
              value={newConfig.default_mask_value}
              onChange={(e) => setNewConfig({...newConfig, default_mask_value: e.target.value})}
              placeholder="e.g., ***"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={newConfig.default_enabled}
              onCheckedChange={(checked) => setNewConfig({...newConfig, default_enabled: checked})}
            />
            <Label>Default Enabled</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={newConfig.default_masked}
              onCheckedChange={(checked) => setNewConfig({...newConfig, default_masked: checked})}
            />
            <Label>Default Masked</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={newConfig.is_system_field}
              onCheckedChange={(checked) => setNewConfig({...newConfig, is_system_field: checked})}
            />
            <Label>System Field</Label>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSubmit}>Save</Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddFieldConfigForm;
