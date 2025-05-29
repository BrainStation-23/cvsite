
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Type, Ruler } from 'lucide-react';

interface CustomizationPanelProps {
  layoutConfig: Record<string, any>;
  onConfigUpdate: (key: string, value: any) => void;
}

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  layoutConfig,
  onConfigUpdate
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-2">Fine-tune Your Style</h4>
        <p className="text-xs text-gray-500 mb-4">
          Adjust specific details to match your preferences
        </p>
      </div>

      {/* Colors */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-2 block">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={layoutConfig.primaryColor || '#1f2937'}
                onChange={(e) => onConfigUpdate('primaryColor', e.target.value)}
                className="w-12 h-10 p-1 rounded border cursor-pointer"
              />
              <Input
                value={layoutConfig.primaryColor || '#1f2937'}
                onChange={(e) => onConfigUpdate('primaryColor', e.target.value)}
                className="text-xs h-10 flex-1"
                placeholder="#1f2937"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-700 mb-2 block">Secondary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={layoutConfig.secondaryColor || '#6b7280'}
                onChange={(e) => onConfigUpdate('secondaryColor', e.target.value)}
                className="w-12 h-10 p-1 rounded border cursor-pointer"
              />
              <Input
                value={layoutConfig.secondaryColor || '#6b7280'}
                onChange={(e) => onConfigUpdate('secondaryColor', e.target.value)}
                className="text-xs h-10 flex-1"
                placeholder="#6b7280"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-700 mb-2 block">Accent Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={layoutConfig.accentColor || '#3b82f6'}
                onChange={(e) => onConfigUpdate('accentColor', e.target.value)}
                className="w-12 h-10 p-1 rounded border cursor-pointer"
              />
              <Input
                value={layoutConfig.accentColor || '#3b82f6'}
                onChange={(e) => onConfigUpdate('accentColor', e.target.value)}
                className="text-xs h-10 flex-1"
                placeholder="#3b82f6"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Type className="h-4 w-4" />
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-2 block">Font Family</Label>
            <Select 
              value={layoutConfig.primaryFont || 'Arial'} 
              onValueChange={(value) => onConfigUpdate('primaryFont', value)}
            >
              <SelectTrigger className="h-10 text-sm">
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
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-3 block">Base Font Size</Label>
              <Slider
                value={[layoutConfig.baseFontSize || 12]}
                onValueChange={([value]) => onConfigUpdate('baseFontSize', value)}
                max={16}
                min={8}
                step={1}
                className="mb-2"
              />
              <div className="text-center">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {layoutConfig.baseFontSize || 12}pt
                </span>
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-3 block">Line Height</Label>
              <Slider
                value={[layoutConfig.lineHeight || 1.4]}
                onValueChange={([value]) => onConfigUpdate('lineHeight', value)}
                max={2.0}
                min={1.0}
                step={0.1}
                className="mb-2"
              />
              <div className="text-center">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {layoutConfig.lineHeight || 1.4}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spacing */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Spacing & Layout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-3 block">Page Margin</Label>
              <Slider
                value={[layoutConfig.margin || 20]}
                onValueChange={([value]) => onConfigUpdate('margin', value)}
                max={40}
                min={10}
                step={2}
                className="mb-2"
              />
              <div className="text-center">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {layoutConfig.margin || 20}mm
                </span>
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-3 block">Section Spacing</Label>
              <Slider
                value={[layoutConfig.sectionSpacing || 16]}
                onValueChange={([value]) => onConfigUpdate('sectionSpacing', value)}
                max={30}
                min={8}
                step={2}
                className="mb-2"
              />
              <div className="text-center">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {layoutConfig.sectionSpacing || 16}pt
                </span>
              </div>
            </div>
          </div>
          
          {(layoutConfig.layoutType === 'two-column' || layoutConfig.layoutType === 'sidebar') && (
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-3 block">Column Gap</Label>
              <Slider
                value={[layoutConfig.columnGap || 10]}
                onValueChange={([value]) => onConfigUpdate('columnGap', value)}
                max={20}
                min={5}
                step={1}
                className="mb-2"
              />
              <div className="text-center">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {layoutConfig.columnGap || 10}mm
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomizationPanel;
