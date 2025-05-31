
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Save } from 'lucide-react';

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

interface FieldDisplayConfigItemProps {
  config: FieldDisplayConfig;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (config: FieldDisplayConfig) => void;
  onCancel: () => void;
  onDelete: () => void;
  sectionTypes: string[];
  fieldTypes: string[];
}

const FieldDisplayConfigItem: React.FC<FieldDisplayConfigItemProps> = ({
  config,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  sectionTypes,
  fieldTypes
}) => {
  const [editedConfig, setEditedConfig] = useState(config);

  useEffect(() => {
    setEditedConfig(config);
  }, [config]);

  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Field Name</Label>
              <Input
                value={editedConfig.field_name}
                onChange={(e) => setEditedConfig({...editedConfig, field_name: e.target.value})}
              />
            </div>
            <div>
              <Label>Section Type</Label>
              <Select 
                value={editedConfig.section_type} 
                onValueChange={(value) => setEditedConfig({...editedConfig, section_type: value})}
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
                value={editedConfig.display_label}
                onChange={(e) => setEditedConfig({...editedConfig, display_label: e.target.value})}
              />
            </div>
            <div>
              <Label>Field Type</Label>
              <Select 
                value={editedConfig.field_type} 
                onValueChange={(value) => setEditedConfig({...editedConfig, field_type: value})}
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
                value={editedConfig.default_order}
                onChange={(e) => setEditedConfig({...editedConfig, default_order: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label>Default Mask Value</Label>
              <Input
                value={editedConfig.default_mask_value || ''}
                onChange={(e) => setEditedConfig({...editedConfig, default_mask_value: e.target.value})}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={editedConfig.default_enabled}
                onCheckedChange={(checked) => setEditedConfig({...editedConfig, default_enabled: checked})}
              />
              <Label>Default Enabled</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={editedConfig.default_masked}
                onCheckedChange={(checked) => setEditedConfig({...editedConfig, default_masked: checked})}
              />
              <Label>Default Masked</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={editedConfig.is_system_field}
                onCheckedChange={(checked) => setEditedConfig({...editedConfig, is_system_field: checked})}
              />
              <Label>System Field</Label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="sm" onClick={() => onSave(editedConfig)}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-4 gap-4 flex-1">
            <div>
              <span className="font-medium">{config.field_name}</span>
              <p className="text-sm text-gray-500">{config.section_type}</p>
            </div>
            <div>
              <span className="text-sm">{config.display_label}</span>
              <p className="text-xs text-gray-500">{config.field_type}</p>
            </div>
            <div className="text-sm">
              Order: {config.default_order}
              {config.default_masked && <span className="ml-2 text-orange-600">Masked</span>}
            </div>
            <div className="text-sm">
              {config.default_enabled ? '✓ Enabled' : '✗ Disabled'}
              {config.is_system_field && <span className="ml-2 text-blue-600">System</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={onDelete} className="text-red-600">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FieldDisplayConfigItem;
