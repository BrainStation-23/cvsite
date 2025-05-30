
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Ruler, Square, Move } from 'lucide-react';

interface SpacingCustomizationProps {
  layoutConfig: Record<string, any>;
  onConfigUpdate: (key: string, value: any) => void;
}

const SpacingCustomization: React.FC<SpacingCustomizationProps> = ({
  layoutConfig,
  onConfigUpdate
}) => {
  // Initialize individual margins from the existing margin value or defaults
  const getMarginValue = (side: string) => {
    if (layoutConfig[`margin${side.charAt(0).toUpperCase() + side.slice(1)}`] !== undefined) {
      return layoutConfig[`margin${side.charAt(0).toUpperCase() + side.slice(1)}`];
    }
    return layoutConfig.margin || 20;
  };

  const handleMarginChange = (side: string, value: number) => {
    const marginKey = `margin${side.charAt(0).toUpperCase() + side.slice(1)}`;
    onConfigUpdate(marginKey, value);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Ruler className="h-4 w-4" />
          Spacing & Layout
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Page Margins with Improved Square Layout */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-blue-100 rounded-md">
              <Square className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <Label className="text-sm font-semibold text-blue-900">Page Margins</Label>
              <p className="text-xs text-blue-700">Adjust the spacing around your CV content</p>
            </div>
          </div>
          
          <div className="relative max-w-72 mx-auto">
            {/* Top Margin */}
            <div className="flex flex-col items-center mb-4">
              <Label className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                <Move className="h-3 w-3" />
                Top
              </Label>
              <div className="w-32">
                <Slider
                  value={[getMarginValue('top')]}
                  onValueChange={([value]) => handleMarginChange('top', value)}
                  max={40}
                  min={10}
                  step={2}
                  className="mb-2"
                />
                <div className="text-center">
                  <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-md">
                    {getMarginValue('top')}mm
                  </span>
                </div>
              </div>
            </div>

            {/* Middle row with Left, Center, Right */}
            <div className="flex items-center justify-between mb-4">
              {/* Left Margin */}
              <div className="flex flex-col items-center w-20">
                <Label className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                  <Move className="h-3 w-3" />
                  Left
                </Label>
                <div className="flex flex-col items-center h-24">
                  <Slider
                    value={[getMarginValue('left')]}
                    onValueChange={([value]) => handleMarginChange('left', value)}
                    max={40}
                    min={10}
                    step={2}
                    orientation="vertical"
                    className="h-16 mb-2"
                  />
                  <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-md">
                    {getMarginValue('left')}mm
                  </span>
                </div>
              </div>

              {/* Center Visual */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-white border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center shadow-sm">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded mb-1"></div>
                      <span className="text-xs font-medium text-blue-600">CV</span>
                    </div>
                  </div>
                  <div className="absolute -top-1 -left-1 w-18 h-18 border border-blue-200 rounded-lg opacity-30"></div>
                </div>
              </div>

              {/* Right Margin */}
              <div className="flex flex-col items-center w-20">
                <Label className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                  <Move className="h-3 w-3" />
                  Right
                </Label>
                <div className="flex flex-col items-center h-24">
                  <Slider
                    value={[getMarginValue('right')]}
                    onValueChange={([value]) => handleMarginChange('right', value)}
                    max={40}
                    min={10}
                    step={2}
                    orientation="vertical"
                    className="h-16 mb-2"
                  />
                  <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-md">
                    {getMarginValue('right')}mm
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Margin */}
            <div className="flex flex-col items-center">
              <div className="w-32">
                <Slider
                  value={[getMarginValue('bottom')]}
                  onValueChange={([value]) => handleMarginChange('bottom', value)}
                  max={40}
                  min={10}
                  step={2}
                  className="mb-2"
                />
                <div className="text-center">
                  <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-md">
                    {getMarginValue('bottom')}mm
                  </span>
                </div>
              </div>
              <Label className="text-xs font-medium text-gray-600 mt-2 flex items-center gap-1">
                <Move className="h-3 w-3" />
                Bottom
              </Label>
            </div>
          </div>
        </div>

        {/* Content Spacing Controls */}
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
      </CardContent>
    </Card>
  );
};

export default SpacingCustomization;
