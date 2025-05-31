import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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

const FieldDisplayConfigTab: React.FC = () => {
  const [configs, setConfigs] = useState<FieldDisplayConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newConfig, setNewConfig] = useState({
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
  const { toast } = useToast();

  const sectionTypes = [
    'general', 'technical_skills', 'specialized_skills', 
    'experience', 'education', 'training', 'achievements', 'projects'
  ];

  const fieldTypes = ['text', 'number', 'date', 'boolean', 'array', 'image'];

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('cv_field_display_config')
        .select('*')
        .order('section_type', { ascending: true })
        .order('default_order', { ascending: true });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error loading field display configs:', error);
      toast({
        title: "Error",
        description: "Failed to load field display configurations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (config: FieldDisplayConfig) => {
    try {
      const { error } = await supabase
        .from('cv_field_display_config')
        .update({
          field_name: config.field_name,
          section_type: config.section_type,
          display_label: config.display_label,
          default_enabled: config.default_enabled,
          default_masked: config.default_masked,
          default_mask_value: config.default_mask_value,
          default_order: config.default_order,
          field_type: config.field_type,
          is_system_field: config.is_system_field
        })
        .eq('id', config.id);

      if (error) throw error;

      setEditingId(null);
      toast({
        title: "Success",
        description: "Field configuration updated successfully"
      });
      loadConfigs();
    } catch (error) {
      console.error('Error updating config:', error);
      toast({
        title: "Error",
        description: "Failed to update field configuration",
        variant: "destructive"
      });
    }
  };

  const handleAdd = async () => {
    try {
      // Validate required fields
      if (!newConfig.field_name.trim() || !newConfig.display_label.trim()) {
        toast({
          title: "Error",
          description: "Field name and display label are required",
          variant: "destructive"
        });
        return;
      }

      const configToInsert = {
        field_name: newConfig.field_name,
        section_type: newConfig.section_type,
        display_label: newConfig.display_label,
        default_enabled: newConfig.default_enabled,
        default_masked: newConfig.default_masked,
        default_order: newConfig.default_order,
        field_type: newConfig.field_type,
        is_system_field: newConfig.is_system_field,
        default_mask_value: newConfig.default_mask_value || null
      };

      const { error } = await supabase
        .from('cv_field_display_config')
        .insert(configToInsert);

      if (error) throw error;

      setIsAdding(false);
      setNewConfig({
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
      toast({
        title: "Success",
        description: "Field configuration added successfully"
      });
      loadConfigs();
    } catch (error) {
      console.error('Error adding config:', error);
      toast({
        title: "Error",
        description: "Failed to add field configuration",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this field configuration?')) return;

    try {
      const { error } = await supabase
        .from('cv_field_display_config')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Field configuration deleted successfully"
      });
      loadConfigs();
    } catch (error) {
      console.error('Error deleting config:', error);
      toast({
        title: "Error",
        description: "Failed to delete field configuration",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading field display configurations...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Field Display Configuration</h3>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="h-4 w-4 mr-2" />
          Add Field Config
        </Button>
      </div>

      {isAdding && (
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
              <Button onClick={handleAdd}>Save</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {configs.map((config) => (
          <FieldConfigItem
            key={config.id}
            config={config}
            isEditing={editingId === config.id}
            onEdit={() => setEditingId(config.id)}
            onSave={handleSave}
            onCancel={() => setEditingId(null)}
            onDelete={() => handleDelete(config.id)}
            sectionTypes={sectionTypes}
            fieldTypes={fieldTypes}
          />
        ))}
      </div>
    </div>
  );
};

interface FieldConfigItemProps {
  config: FieldDisplayConfig;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (config: FieldDisplayConfig) => void;
  onCancel: () => void;
  onDelete: () => void;
  sectionTypes: string[];
  fieldTypes: string[];
}

const FieldConfigItem: React.FC<FieldConfigItemProps> = ({
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

export default FieldDisplayConfigTab;
