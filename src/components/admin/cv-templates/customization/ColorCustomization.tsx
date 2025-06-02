
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Palette } from 'lucide-react';

interface ColorCustomizationProps {
  layoutConfig: Record<string, any>;
  onConfigUpdate: (key: string, value: any) => void;
}

const ColorCustomization: React.FC<ColorCustomizationProps> = ({
  layoutConfig,
  onConfigUpdate
}) => {
  return (
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
  );
};

export default ColorCustomization;
