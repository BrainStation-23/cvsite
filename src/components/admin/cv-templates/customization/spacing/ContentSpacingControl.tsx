
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Ruler } from 'lucide-react';

interface ContentSpacingControlProps {
  layoutConfig: Record<string, any>;
  onConfigUpdate: (key: string, value: any) => void;
}

export const ContentSpacingControl: React.FC<ContentSpacingControlProps> = ({
  layoutConfig,
  onConfigUpdate
}) => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-gray-100 rounded-md">
          <Ruler className="h-4 w-4 text-gray-600" />
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-900">Content Spacing</Label>
          <p className="text-xs text-gray-600">Control spacing between CV sections and elements</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div>
          <Label className="text-xs font-medium text-gray-700 mb-3 block flex items-center gap-2">
            Section Spacing
            <span className="text-xs text-gray-500">(Space between sections)</span>
          </Label>
          <Slider
            value={[layoutConfig.sectionSpacing || 16]}
            onValueChange={([value]) => onConfigUpdate('sectionSpacing', value)}
            max={30}
            min={8}
            step={2}
            className="mb-3"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Tight</span>
            <span className="text-xs font-medium text-gray-700 bg-white px-3 py-1 rounded-full border shadow-sm">
              {layoutConfig.sectionSpacing || 16}pt
            </span>
            <span className="text-xs text-gray-500">Spacious</span>
          </div>
        </div>
        
        {(layoutConfig.layoutType === 'two-column' || layoutConfig.layoutType === 'sidebar') && (
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-3 block flex items-center gap-2">
              Column Gap
              <span className="text-xs text-gray-500">(Space between columns)</span>
            </Label>
            <Slider
              value={[layoutConfig.columnGap || 10]}
              onValueChange={([value]) => onConfigUpdate('columnGap', value)}
              max={20}
              min={5}
              step={1}
              className="mb-3"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Narrow</span>
              <span className="text-xs font-medium text-gray-700 bg-white px-3 py-1 rounded-full border shadow-sm">
                {layoutConfig.columnGap || 10}mm
              </span>
              <span className="text-xs text-gray-500">Wide</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
