
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { useFieldDisplayConfig } from '@/hooks/use-field-display-config';
import FieldConfigEditor from './FieldConfigEditor';
import AddFieldConfigDialog from './AddFieldConfigDialog';

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

const FieldDisplayConfigPanel: React.FC = () => {
  const { configs, isLoading, searchQuery, setSearchQuery } = useFieldDisplayConfig();
  const [selectedField, setSelectedField] = useState<FieldDisplayConfig | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Group configs by section type
  const groupedConfigs = configs.reduce((acc, config) => {
    if (!acc[config.section_type]) {
      acc[config.section_type] = [];
    }
    acc[config.section_type].push(config);
    return acc;
  }, {} as Record<string, FieldDisplayConfig[]>);

  const sectionTypes = [
    'general', 'technical_skills', 'specialized_skills', 
    'experience', 'education', 'training', 'achievements', 'projects'
  ];

  if (isLoading) {
    return <div className="p-4">Loading field display configurations...</div>;
  }

  return (
    <div className="flex h-[70vh] gap-4">
      {/* Left Panel - Field Selection */}
      <div className="w-1/2 border-r pr-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Field Configuration</h3>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </div>

        <ScrollArea className="h-full">
          <div className="space-y-4">
            {sectionTypes.map((sectionType) => {
              const sectionConfigs = groupedConfigs[sectionType] || [];
              if (sectionConfigs.length === 0) return null;

              return (
                <Card key={sectionType}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium capitalize">
                      {sectionType.replace('_', ' ')}
                      <Badge variant="secondary" className="ml-2">
                        {sectionConfigs.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {sectionConfigs
                        .sort((a, b) => a.default_order - b.default_order)
                        .map((config) => (
                          <div
                            key={config.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedField?.id === config.id 
                                ? 'bg-blue-50 border-blue-200' 
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedField(config)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-sm">
                                  {config.display_label}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {config.field_name}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {config.is_system_field && (
                                  <Badge variant="outline" className="text-xs">
                                    System
                                  </Badge>
                                )}
                                {config.default_masked && (
                                  <Badge variant="outline" className="text-xs text-orange-600">
                                    Masked
                                  </Badge>
                                )}
                                {!config.default_enabled && (
                                  <Badge variant="outline" className="text-xs text-red-600">
                                    Disabled
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Field Editor */}
      <div className="w-1/2">
        {selectedField ? (
          <FieldConfigEditor 
            config={selectedField} 
            onConfigChange={(updatedConfig) => setSelectedField(updatedConfig)}
          />
        ) : (
          <Card className="h-full">
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">No Field Selected</p>
                <p className="text-sm">Select a field from the left panel to configure it</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AddFieldConfigDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onFieldAdded={() => {
          setIsAddDialogOpen(false);
        }}
      />
    </div>
  );
};

export default FieldDisplayConfigPanel;
