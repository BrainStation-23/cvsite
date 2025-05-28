
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { CVTemplate } from '@/types/cv-templates';
import { Palette, Type, Layout, Ruler } from 'lucide-react';
import { useCVTemplates } from '@/hooks/use-cv-templates';
import { useToast } from '@/hooks/use-toast';

interface TemplateBuilderProps {
  template: CVTemplate;
  onLayoutUpdate?: (layoutConfig: Record<string, any>) => void;
}

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ template, onLayoutUpdate }) => {
  const [layoutConfig, setLayoutConfig] = useState(template.layout_config || {});
  const [isSaving, setIsSaving] = useState(false);
  const { updateTemplate } = useCVTemplates();
  const { toast } = useToast();

  const updateLayoutConfig = (key: string, value: any) => {
    const newConfig = {
      ...layoutConfig,
      [key]: value
    };
    setLayoutConfig(newConfig);
    
    // Notify parent component of changes
    if (onLayoutUpdate) {
      onLayoutUpdate(newConfig);
    }
  };

  const handleSaveLayout = async () => {
    try {
      setIsSaving(true);
      const success = await updateTemplate(template.id, {
        layout_config: layoutConfig
      });
      
      if (success) {
        toast({
          title: "Success",
          description: "Layout configuration saved successfully"
        });
      }
    } catch (error) {
      console.error('Error saving layout configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save layout configuration",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Page Layout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Margin (mm)</Label>
              <Slider
                value={[layoutConfig.margin || 20]}
                onValueChange={([value]) => updateLayoutConfig('margin', value)}
                max={50}
                min={10}
                step={5}
                className="mt-2"
              />
              <span className="text-sm text-gray-500">{layoutConfig.margin || 20}mm</span>
            </div>
            <div>
              <Label>Column Gap (mm)</Label>
              <Slider
                value={[layoutConfig.columnGap || 10]}
                onValueChange={([value]) => updateLayoutConfig('columnGap', value)}
                max={30}
                min={5}
                step={2}
                className="mt-2"
              />
              <span className="text-sm text-gray-500">{layoutConfig.columnGap || 10}mm</span>
            </div>
          </div>
          
          <div>
            <Label>Layout Type</Label>
            <Select 
              value={layoutConfig.layoutType || 'single-column'} 
              onValueChange={(value) => updateLayoutConfig('layoutType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single-column">Single Column</SelectItem>
                <SelectItem value="two-column">Two Column</SelectItem>
                <SelectItem value="sidebar">Sidebar Layout</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primary Font</Label>
              <Select 
                value={layoutConfig.primaryFont || 'Arial'} 
                onValueChange={(value) => updateLayoutConfig('primaryFont', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Calibri">Calibri</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Base Font Size (pt)</Label>
              <Slider
                value={[layoutConfig.baseFontSize || 12]}
                onValueChange={([value]) => updateLayoutConfig('baseFontSize', value)}
                max={16}
                min={8}
                step={1}
                className="mt-2"
              />
              <span className="text-sm text-gray-500">{layoutConfig.baseFontSize || 12}pt</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Heading Size (pt)</Label>
              <Slider
                value={[layoutConfig.headingSize || 16]}
                onValueChange={([value]) => updateLayoutConfig('headingSize', value)}
                max={24}
                min={12}
                step={1}
                className="mt-2"
              />
              <span className="text-sm text-gray-500">{layoutConfig.headingSize || 16}pt</span>
            </div>
            <div>
              <Label>Subheading Size (pt)</Label>
              <Slider
                value={[layoutConfig.subheadingSize || 14]}
                onValueChange={([value]) => updateLayoutConfig('subheadingSize', value)}
                max={20}
                min={10}
                step={1}
                className="mt-2"
              />
              <span className="text-sm text-gray-500">{layoutConfig.subheadingSize || 14}pt</span>
            </div>
            <div>
              <Label>Line Height</Label>
              <Slider
                value={[layoutConfig.lineHeight || 1.4]}
                onValueChange={([value]) => updateLayoutConfig('lineHeight', value)}
                max={2.0}
                min={1.0}
                step={0.1}
                className="mt-2"
              />
              <span className="text-sm text-gray-500">{layoutConfig.lineHeight || 1.4}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Scheme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Primary Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="color"
                  value={layoutConfig.primaryColor || '#1f2937'}
                  onChange={(e) => updateLayoutConfig('primaryColor', e.target.value)}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={layoutConfig.primaryColor || '#1f2937'}
                  onChange={(e) => updateLayoutConfig('primaryColor', e.target.value)}
                  placeholder="#1f2937"
                />
              </div>
            </div>
            <div>
              <Label>Secondary Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="color"
                  value={layoutConfig.secondaryColor || '#6b7280'}
                  onChange={(e) => updateLayoutConfig('secondaryColor', e.target.value)}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={layoutConfig.secondaryColor || '#6b7280'}
                  onChange={(e) => updateLayoutConfig('secondaryColor', e.target.value)}
                  placeholder="#6b7280"
                />
              </div>
            </div>
            <div>
              <Label>Accent Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="color"
                  value={layoutConfig.accentColor || '#3b82f6'}
                  onChange={(e) => updateLayoutConfig('accentColor', e.target.value)}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={layoutConfig.accentColor || '#3b82f6'}
                  onChange={(e) => updateLayoutConfig('accentColor', e.target.value)}
                  placeholder="#3b82f6"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spacing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Spacing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Section Spacing (pt)</Label>
              <Slider
                value={[layoutConfig.sectionSpacing || 16]}
                onValueChange={([value]) => updateLayoutConfig('sectionSpacing', value)}
                max={40}
                min={8}
                step={2}
                className="mt-2"
              />
              <span className="text-sm text-gray-500">{layoutConfig.sectionSpacing || 16}pt</span>
            </div>
            <div>
              <Label>Item Spacing (pt)</Label>
              <Slider
                value={[layoutConfig.itemSpacing || 8]}
                onValueChange={([value]) => updateLayoutConfig('itemSpacing', value)}
                max={20}
                min={4}
                step={1}
                className="mt-2"
              />
              <span className="text-sm text-gray-500">{layoutConfig.itemSpacing || 8}pt</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveLayout} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Layout Configuration'}
        </Button>
      </div>
    </div>
  );
};

export default TemplateBuilder;
