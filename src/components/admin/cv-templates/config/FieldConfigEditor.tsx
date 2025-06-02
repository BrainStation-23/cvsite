
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Save, RotateCcw } from 'lucide-react';
import { useFieldDisplayConfig } from '@/hooks/use-field-display-config';
import { useToast } from '@/hooks/use-toast';

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

interface FieldConfigEditorProps {
  config: FieldDisplayConfig;
  onConfigChange: (config: FieldDisplayConfig) => void;
}

const FieldConfigEditor: React.FC<FieldConfigEditorProps> = ({
  config,
  onConfigChange
}) => {
  const { saveConfig, deleteConfig } = useFieldDisplayConfig();
  const { toast } = useToast();
  const [editedConfig, setEditedConfig] = useState(config);
  const [originalConfig, setOriginalConfig] = useState(config);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    console.log('Config changed, updating editor state');
    setEditedConfig(config);
    setOriginalConfig(config);
  }, [config]);

  // Check if there are changes by comparing with original config
  const hasChanges = JSON.stringify(editedConfig) !== JSON.stringify(originalConfig);

  console.log('Has changes:', hasChanges);
  console.log('Edited config:', editedConfig);
  console.log('Original config:', originalConfig);

  const handleFieldChange = (field: string, value: any) => {
    console.log(`Field ${field} changed to:`, value);
    const newConfig = { ...editedConfig, [field]: value };
    setEditedConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const success = await saveConfig(editedConfig);
    if (success) {
      setOriginalConfig(editedConfig);
      toast({
        title: "Success",
        description: "Field configuration saved successfully"
      });
    }
    setIsSaving(false);
  };

  const handleReset = () => {
    setEditedConfig(originalConfig);
    onConfigChange(originalConfig);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this field configuration?')) {
      const success = await deleteConfig(config.id);
      if (success) {
        toast({
          title: "Success",
          description: "Field configuration deleted successfully"
        });
      }
    }
  };

  const sectionTypes = [
    'general', 'technical_skills', 'specialized_skills', 
    'experience', 'education', 'training', 'achievements', 'projects'
  ];

  const fieldTypes = ['text', 'number', 'date', 'boolean', 'array', 'image', 'richtext'];

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Configure Field</CardTitle>
          <div className="flex gap-2">
            {hasChanges && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="field_name">Field Name</Label>
            <Input
              id="field_name"
              value={editedConfig.field_name}
              onChange={(e) => handleFieldChange('field_name', e.target.value)}
              placeholder="Enter field name"
            />
          </div>
          <div>
            <Label htmlFor="display_label">Display Label</Label>
            <Input
              id="display_label"
              value={editedConfig.display_label}
              onChange={(e) => handleFieldChange('display_label', e.target.value)}
              placeholder="Enter display label"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="section_type">Section Type</Label>
            <Select 
              value={editedConfig.section_type} 
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
              value={editedConfig.field_type} 
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
              value={editedConfig.default_order}
              onChange={(e) => handleFieldChange('default_order', parseInt(e.target.value))}
              min={1}
            />
          </div>
          <div>
            <Label htmlFor="default_mask_value">Default Mask Value</Label>
            <Input
              id="default_mask_value"
              value={editedConfig.default_mask_value || ''}
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
              checked={editedConfig.default_enabled}
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
              checked={editedConfig.default_masked}
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
              checked={editedConfig.is_system_field}
              onCheckedChange={(checked) => handleFieldChange('is_system_field', checked)}
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || isSaving}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FieldConfigEditor;
