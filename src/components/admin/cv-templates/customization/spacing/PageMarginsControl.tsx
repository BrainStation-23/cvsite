
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Square, Move } from 'lucide-react';

interface PageMarginsControlProps {
  layoutConfig: Record<string, any>;
  onConfigUpdate: (key: string, value: any) => void;
}

export const PageMarginsControl: React.FC<PageMarginsControlProps> = ({
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

  const handleMarginChange = (side: string, value: string) => {
    const numericValue = parseInt(value) || 10;
    // Clamp value between 10 and 40
    const clampedValue = Math.min(Math.max(numericValue, 10), 40);
    const marginKey = `margin${side.charAt(0).toUpperCase() + side.slice(1)}`;
    onConfigUpdate(marginKey, clampedValue);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-blue-100 rounded-md">
          <Square className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <Label className="text-sm font-semibold text-blue-900">Page Margins</Label>
          <p className="text-xs text-blue-700">Adjust the spacing around your CV content (10-40mm)</p>
        </div>
      </div>
      
      <div className="relative max-w-80 mx-auto">
        {/* Top Margin */}
        <div className="flex flex-col items-center mb-6">
          <Label className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
            <Move className="h-3 w-3" />
            Top
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="10"
              max="40"
              value={getMarginValue('top')}
              onChange={(e) => handleMarginChange('top', e.target.value)}
              className="w-16 h-8 text-center text-xs"
            />
            <span className="text-xs text-blue-700 font-medium">mm</span>
          </div>
        </div>

        {/* Middle row with Left, Center, Right */}
        <div className="flex items-center justify-between mb-6">
          {/* Left Margin */}
          <div className="flex flex-col items-center">
            <Label className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
              <Move className="h-3 w-3" />
              Left
            </Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min="10"
                max="40"
                value={getMarginValue('left')}
                onChange={(e) => handleMarginChange('left', e.target.value)}
                className="w-16 h-8 text-center text-xs"
              />
              <span className="text-xs text-blue-700 font-medium">mm</span>
            </div>
          </div>

          {/* Center Visual */}
          <div className="flex flex-col items-center mx-8">
            <div className="relative">
              <div className="w-20 h-24 bg-white border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center shadow-sm">
                <div className="text-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded mb-2"></div>
                  <span className="text-xs font-medium text-blue-600">CV Content</span>
                </div>
              </div>
              <div className="absolute -top-1 -left-1 w-22 h-26 border border-blue-200 rounded-lg opacity-30"></div>
            </div>
          </div>

          {/* Right Margin */}
          <div className="flex flex-col items-center">
            <Label className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
              <Move className="h-3 w-3" />
              Right
            </Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min="10"
                max="40"
                value={getMarginValue('right')}
                onChange={(e) => handleMarginChange('right', e.target.value)}
                className="w-16 h-8 text-center text-xs"
              />
              <span className="text-xs text-blue-700 font-medium">mm</span>
            </div>
          </div>
        </div>

        {/* Bottom Margin */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <Input
              type="number"
              min="10"
              max="40"
              value={getMarginValue('bottom')}
              onChange={(e) => handleMarginChange('bottom', e.target.value)}
              className="w-16 h-8 text-center text-xs"
            />
            <span className="text-xs text-blue-700 font-medium">mm</span>
          </div>
          <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
            <Move className="h-3 w-3" />
            Bottom
          </Label>
        </div>
      </div>
    </div>
  );
};
