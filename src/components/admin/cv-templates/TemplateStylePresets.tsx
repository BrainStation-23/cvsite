
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface StylePreset {
  id: string;
  name: string;
  description: string;
  preview: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    font: string;
  };
  config: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    primaryFont: string;
    baseFontSize: number;
    headingSize: number;
    subheadingSize: number;
    lineHeight: number;
  };
}

const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean and corporate look',
    preview: {
      primaryColor: '#1f2937',
      secondaryColor: '#6b7280',
      accentColor: '#3b82f6',
      font: 'Arial'
    },
    config: {
      primaryColor: '#1f2937',
      secondaryColor: '#6b7280',
      accentColor: '#3b82f6',
      primaryFont: 'Arial',
      baseFontSize: 11,
      headingSize: 16,
      subheadingSize: 13,
      lineHeight: 1.4
    }
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary and stylish',
    preview: {
      primaryColor: '#0f172a',
      secondaryColor: '#64748b',
      accentColor: '#8b5cf6',
      font: 'Helvetica'
    },
    config: {
      primaryColor: '#0f172a',
      secondaryColor: '#64748b',
      accentColor: '#8b5cf6',
      primaryFont: 'Helvetica',
      baseFontSize: 12,
      headingSize: 18,
      subheadingSize: 14,
      lineHeight: 1.5
    }
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold and expressive',
    preview: {
      primaryColor: '#7c2d12',
      secondaryColor: '#a3a3a3',
      accentColor: '#f97316',
      font: 'Georgia'
    },
    config: {
      primaryColor: '#7c2d12',
      secondaryColor: '#a3a3a3',
      accentColor: '#f97316',
      primaryFont: 'Georgia',
      baseFontSize: 12,
      headingSize: 20,
      subheadingSize: 15,
      lineHeight: 1.6
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and elegant',
    preview: {
      primaryColor: '#374151',
      secondaryColor: '#9ca3af',
      accentColor: '#059669',
      font: 'Calibri'
    },
    config: {
      primaryColor: '#374151',
      secondaryColor: '#9ca3af',
      accentColor: '#059669',
      primaryFont: 'Calibri',
      baseFontSize: 11,
      headingSize: 15,
      subheadingSize: 13,
      lineHeight: 1.3
    }
  }
];

interface TemplateStylePresetsProps {
  selectedPreset?: string;
  onPresetSelect: (preset: StylePreset) => void;
}

const TemplateStylePresets: React.FC<TemplateStylePresetsProps> = ({
  selectedPreset,
  onPresetSelect
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2">Style Templates</h4>
        <p className="text-xs text-gray-500 mb-4">
          Choose a pre-designed style that fits your needs
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {STYLE_PRESETS.map((preset) => (
          <Card 
            key={preset.id}
            className={`p-3 cursor-pointer transition-all hover:shadow-md ${
              selectedPreset === preset.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => onPresetSelect(preset)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="text-sm font-medium">{preset.name}</h5>
                  {selectedPreset === preset.id && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2">{preset.description}</p>
                
                {/* Color Preview */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div 
                      className="w-3 h-3 rounded-full border border-gray-200"
                      style={{ backgroundColor: preset.preview.primaryColor }}
                      title="Primary Color"
                    />
                    <div 
                      className="w-3 h-3 rounded-full border border-gray-200"
                      style={{ backgroundColor: preset.preview.secondaryColor }}
                      title="Secondary Color"
                    />
                    <div 
                      className="w-3 h-3 rounded-full border border-gray-200"
                      style={{ backgroundColor: preset.preview.accentColor }}
                      title="Accent Color"
                    />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {preset.preview.font}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export { TemplateStylePresets, STYLE_PRESETS };
export type { StylePreset };
