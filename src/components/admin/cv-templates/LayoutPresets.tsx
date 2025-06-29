
import React from 'react';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { getLayoutConfiguration, getSupportedLayouts } from './layout/LayoutConfigurations';

interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  preview: React.ReactNode;
  config: {
    layoutType: string;
    columnGap: number;
    margin: number;
    sectionSpacing: number;
    itemSpacing: number;
  };
}

// Generate layout presets from configuration
const generateLayoutPresets = (): LayoutPreset[] => {
  const supportedLayouts = getSupportedLayouts();
  
  const iconMap: Record<string, React.ReactNode> = {
    'single-column': <div className="w-4 h-4 bg-gray-400 rounded"></div>,
    'two-column': <div className="w-4 h-4 bg-gray-400 rounded flex gap-0.5"><div className="flex-1 bg-gray-500"></div><div className="flex-1 bg-gray-500"></div></div>,
    'sidebar': <div className="w-4 h-4 bg-gray-400 rounded flex gap-0.5"><div className="w-1/3 bg-blue-500"></div><div className="flex-1 bg-gray-500"></div></div>
  };

  const previewMap: Record<string, React.ReactNode> = {
    'single-column': (
      <div className="w-full h-12 bg-gray-100 rounded border flex flex-col gap-1 p-2">
        <div className="h-2 bg-gray-300 rounded w-full"></div>
        <div className="h-2 bg-gray-300 rounded w-3/4"></div>
        <div className="h-2 bg-gray-300 rounded w-1/2"></div>
      </div>
    ),
    'two-column': (
      <div className="w-full h-12 bg-gray-100 rounded border flex gap-1 p-2">
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-2 bg-gray-300 rounded w-full"></div>
          <div className="h-2 bg-gray-300 rounded w-2/3"></div>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-2 bg-gray-300 rounded w-full"></div>
          <div className="h-2 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    ),
    'sidebar': (
      <div className="w-full h-12 bg-gray-100 rounded border flex gap-1 p-2">
        <div className="w-1/3 flex flex-col gap-1">
          <div className="h-2 bg-blue-200 rounded w-full"></div>
          <div className="h-2 bg-blue-200 rounded w-2/3"></div>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-2 bg-gray-300 rounded w-full"></div>
          <div className="h-2 bg-gray-300 rounded w-4/5"></div>
        </div>
      </div>
    )
  };

  return supportedLayouts.map(layoutId => {
    const config = getLayoutConfiguration(layoutId);
    return {
      id: layoutId,
      name: config.name,
      description: config.description,
      icon: iconMap[layoutId] || iconMap['single-column'],
      preview: previewMap[layoutId] || previewMap['single-column'],
      config: {
        layoutType: layoutId,
        columnGap: config.gap,
        margin: 20,
        sectionSpacing: layoutId === 'two-column' ? 14 : 16,
        itemSpacing: layoutId === 'two-column' ? 6 : 8
      }
    };
  });
};

const LAYOUT_PRESETS = generateLayoutPresets();

interface LayoutPresetsProps {
  selectedLayout?: string;
  onLayoutSelect: (preset: LayoutPreset) => void;
}

const LayoutPresets: React.FC<LayoutPresetsProps> = ({
  selectedLayout,
  onLayoutSelect
}) => {
  const handleLayoutSelect = (preset: LayoutPreset) => {
    console.log('LayoutPresets handleLayoutSelect:', {
      presetId: preset.id,
      presetConfig: preset.config,
      selectedLayout
    });
    onLayoutSelect(preset);
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2">Layout Options</h4>
        <p className="text-xs text-gray-500 mb-4">
          Choose how content is arranged on the page
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {LAYOUT_PRESETS.map((preset) => (
          <Card 
            key={preset.id}
            className={`p-3 cursor-pointer transition-all hover:shadow-md ${
              selectedLayout === preset.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => handleLayoutSelect(preset)}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {preset.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="text-sm font-medium">{preset.name}</h5>
                  {selectedLayout === preset.id && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <p className="text-xs text-gray-500">{preset.description}</p>
              </div>
              <div className="flex-shrink-0 w-16">
                {preset.preview}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export { LayoutPresets, LAYOUT_PRESETS };
export type { LayoutPreset };
