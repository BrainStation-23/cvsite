
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Type } from 'lucide-react';

interface TypographyCustomizationProps {
  layoutConfig: Record<string, any>;
  onConfigUpdate: (key: string, value: any) => void;
}

const TypographyCustomization: React.FC<TypographyCustomizationProps> = ({
  layoutConfig,
  onConfigUpdate
}) => {
  return (
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
  );
};

export default TypographyCustomization;
