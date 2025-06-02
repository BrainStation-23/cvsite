
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFieldDisplayConfig } from '@/hooks/use-field-display-config';
import { useToast } from '@/hooks/use-toast';
import FieldConfigForm from './FieldConfigForm';
import FieldConfigActions from './FieldConfigActions';

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

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Configure Field</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FieldConfigForm 
          config={editedConfig}
          onFieldChange={handleFieldChange}
        />
        
        <FieldConfigActions
          hasChanges={hasChanges}
          isSaving={isSaving}
          onSave={handleSave}
          onReset={handleReset}
          onDelete={handleDelete}
        />
      </CardContent>
    </Card>
  );
};

export default FieldConfigEditor;
