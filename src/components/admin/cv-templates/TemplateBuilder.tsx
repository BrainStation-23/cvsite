
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CVTemplate } from '@/types/cv-templates';
import { TemplateStylePresets, STYLE_PRESETS, StylePreset } from './TemplateStylePresets';
import { LayoutPresets, LAYOUT_PRESETS, LayoutPreset } from './LayoutPresets';
import CustomizationPanel from './CustomizationPanel';
import { Sparkles, Settings } from 'lucide-react';

interface TemplateBuilderProps {
  template: CVTemplate;
  onLayoutUpdate?: (layoutConfig: Record<string, any>) => void;
}

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ template, onLayoutUpdate }) => {
  const [layoutConfig, setLayoutConfig] = useState(template.layout_config || {});
  const [selectedStylePreset, setSelectedStylePreset] = useState<string>('');
  const [selectedLayoutPreset, setSelectedLayoutPreset] = useState<string>('');
  const [activeTab, setActiveTab] = useState('presets');

  // Initialize presets based on current config
  useEffect(() => {
    const currentLayoutType = layoutConfig.layoutType || 'single-column';
    setSelectedLayoutPreset(currentLayoutType);
    
    console.log('TemplateBuilder useEffect - layout config:', {
      layoutConfig,
      currentLayoutType,
      templateLayoutConfig: template.layout_config
    });
    
    // Try to match current colors to a preset
    const matchingPreset = STYLE_PRESETS.find(preset => 
      preset.config.primaryColor === layoutConfig.primaryColor &&
      preset.config.secondaryColor === layoutConfig.secondaryColor &&
      preset.config.accentColor === layoutConfig.accentColor
    );
    if (matchingPreset) {
      setSelectedStylePreset(matchingPreset.id);
    }
  }, [layoutConfig]);

  const updateLayoutConfig = (key: string, value: any) => {
    const newConfig = {
      ...layoutConfig,
      [key]: value
    };
    
    console.log('TemplateBuilder updateLayoutConfig:', {
      key,
      value,
      oldConfig: layoutConfig,
      newConfig
    });
    
    setLayoutConfig(newConfig);
    
    if (onLayoutUpdate) {
      onLayoutUpdate(newConfig);
    }
  };

  const handleStylePresetSelect = (preset: StylePreset) => {
    setSelectedStylePreset(preset.id);
    
    console.log('TemplateBuilder handleStylePresetSelect:', {
      presetId: preset.id,
      presetConfig: preset.config
    });
    
    // Apply all preset values
    const updatedConfig = {
      ...layoutConfig,
      ...preset.config
    };
    setLayoutConfig(updatedConfig);
    
    if (onLayoutUpdate) {
      onLayoutUpdate(updatedConfig);
    }
  };

  const handleLayoutPresetSelect = (preset: LayoutPreset) => {
    setSelectedLayoutPreset(preset.id);
    
    console.log('TemplateBuilder handleLayoutPresetSelect:', {
      presetId: preset.id,
      presetConfig: preset.config,
      oldLayoutType: layoutConfig.layoutType
    });
    
    // Apply layout preset values
    const updatedConfig = {
      ...layoutConfig,
      ...preset.config
    };
    setLayoutConfig(updatedConfig);
    
    if (onLayoutUpdate) {
      onLayoutUpdate(updatedConfig);
    }
  };

  const resetToDefaults = () => {
    const defaultConfig = {
      layoutType: 'single-column',
      primaryColor: '#1f2937',
      secondaryColor: '#6b7280',
      accentColor: '#3b82f6',
      primaryFont: 'Arial',
      baseFontSize: 12,
      headingSize: 16,
      subheadingSize: 14,
      lineHeight: 1.4,
      margin: 20,
      columnGap: 10,
      sectionSpacing: 16,
      itemSpacing: 8
    };
    
    console.log('TemplateBuilder resetToDefaults:', {
      oldConfig: layoutConfig,
      defaultConfig
    });
    
    setLayoutConfig(defaultConfig);
    setSelectedStylePreset('professional');
    setSelectedLayoutPreset('single-column');
    
    if (onLayoutUpdate) {
      onLayoutUpdate(defaultConfig);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Style Your Template</h3>
          <p className="text-xs text-gray-500">Make it look exactly how you want</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetToDefaults}
          className="text-xs"
        >
          Reset to Default
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 text-xs">
          <TabsTrigger value="presets" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Quick Styles
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            Customize
          </TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="space-y-4 mt-4">
          <LayoutPresets
            selectedLayout={selectedLayoutPreset}
            onLayoutSelect={handleLayoutPresetSelect}
          />
          
          <TemplateStylePresets
            selectedPreset={selectedStylePreset}
            onPresetSelect={handleStylePresetSelect}
          />
        </TabsContent>

        <TabsContent value="custom" className="mt-4">
          <CustomizationPanel
            layoutConfig={layoutConfig}
            onConfigUpdate={updateLayoutConfig}
          />
        </TabsContent>
      </Tabs>

      {/* Live Preview Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <div>
              <p className="text-xs font-medium text-blue-900">Live Preview</p>
              <p className="text-xs text-blue-700">
                Changes are applied instantly to the preview on the left. 
                Don't forget to save your template when you're happy with the design!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateBuilder;
