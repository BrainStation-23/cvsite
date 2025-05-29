
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import TemplateBuilder from './TemplateBuilder';
import SectionManager from './SectionManager';
import { CVTemplate } from '@/types/cv-templates';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface TemplateInspectorProps {
  template: CVTemplate;
  onTemplateUpdate: (updates: Partial<CVTemplate>) => void;
  onConfigurationChange: () => void;
}

const TemplateInspector: React.FC<TemplateInspectorProps> = ({
  template,
  onTemplateUpdate,
  onConfigurationChange
}) => {
  const [activeTab, setActiveTab] = useState('basic');

  const handleBasicInfoChange = (field: string, value: any) => {
    onTemplateUpdate({ [field]: value });
  };

  const handleLayoutUpdate = (layoutConfig: Record<string, any>) => {
    onTemplateUpdate({ layout_config: layoutConfig });
    onConfigurationChange();
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-shrink-0 p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Template Inspector</h3>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="flex-shrink-0 px-4 pt-4">
            <TabsList className="grid w-full grid-cols-3 text-xs">
              <TabsTrigger value="basic" className="text-xs">Basic</TabsTrigger>
              <TabsTrigger value="layout" className="text-xs">Layout</TabsTrigger>
              <TabsTrigger value="sections" className="text-xs">Sections</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto">
            <TabsContent value="basic" className="p-4 m-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      value={template.description || ''}
                      onChange={(e) => handleBasicInfoChange('description', e.target.value)}
                      placeholder="Describe this template"
                      rows={2}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Orientation</Label>
                    <Select 
                      value={template.orientation} 
                      onValueChange={(value) => handleBasicInfoChange('orientation', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={template.is_active}
                      onCheckedChange={(checked) => handleBasicInfoChange('is_active', checked)}
                    />
                    <Label className="text-xs">Active Template</Label>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="text-xs font-medium mb-3">Template Info</h4>
                    <div className="space-y-2">
                      <div className="text-xs">
                        <span className="font-medium">Orientation:</span> {template.orientation}
                      </div>
                      <div className="text-xs">
                        <span className="font-medium">Status:</span> 
                        <span className={`ml-1 ${template.is_active ? 'text-green-600' : 'text-red-600'}`}>
                          {template.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className="font-medium">Note:</span> 
                        <span className="ml-1 text-gray-600">Pages are calculated automatically based on content</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="layout" className="p-4 m-0">
              <TemplateBuilder 
                template={template} 
                onLayoutUpdate={handleLayoutUpdate}
              />
            </TabsContent>

            <TabsContent value="sections" className="p-4 m-0">
              <SectionManager 
                templateId={template.id} 
                onSectionsChange={onConfigurationChange}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default TemplateInspector;
