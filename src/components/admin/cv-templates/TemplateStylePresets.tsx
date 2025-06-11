
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
    // Layout-specific background colors
    sidebarBg: string;
    secondaryColumnBg: string;
    mainColumnBg: string;
  };
}

const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean and corporate look with navy sidebar',
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
      lineHeight: 1.4,
      sidebarBg: '#1f2937',
      secondaryColumnBg: '#f8fafc',
      mainColumnBg: 'transparent'
    }
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary dark slate with purple accents',
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
      baseFontSize: 11,
      headingSize: 16,
      subheadingSize: 13,
      lineHeight: 1.4,
      sidebarBg: '#0f172a',
      secondaryColumnBg: '#f1f5f9',
      mainColumnBg: 'transparent'
    }
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold earth tones with warm orange accents',
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
      baseFontSize: 11,
      headingSize: 16,
      subheadingSize: 13,
      lineHeight: 1.4,
      sidebarBg: '#7c2d12',
      secondaryColumnBg: '#fef7ed',
      mainColumnBg: 'transparent'
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean gray tones with green accents',
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
      headingSize: 16,
      subheadingSize: 13,
      lineHeight: 1.4,
      sidebarBg: '#374151',
      secondaryColumnBg: '#f0fdf4',
      mainColumnBg: 'transparent'
    }
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Sophisticated deep blue with gold accents',
    preview: {
      primaryColor: '#1e3a8a',
      secondaryColor: '#64748b',
      accentColor: '#f59e0b',
      font: 'Times New Roman'
    },
    config: {
      primaryColor: '#1e3a8a',
      secondaryColor: '#64748b',
      accentColor: '#f59e0b',
      primaryFont: 'Times New Roman',
      baseFontSize: 11,
      headingSize: 16,
      subheadingSize: 13,
      lineHeight: 1.4,
      sidebarBg: '#1e3a8a',
      secondaryColumnBg: '#fffbeb',
      mainColumnBg: 'transparent'
    }
  },
  {
    id: 'tech',
    name: 'Tech',
    description: 'Modern tech look with cyan highlights',
    preview: {
      primaryColor: '#1f2937',
      secondaryColor: '#6b7280',
      accentColor: '#06b6d4',
      font: 'Arial'
    },
    config: {
      primaryColor: '#1f2937',
      secondaryColor: '#6b7280',
      accentColor: '#06b6d4',
      primaryFont: 'Arial',
      baseFontSize: 11,
      headingSize: 16,
      subheadingSize: 13,
      lineHeight: 1.4,
      sidebarBg: '#1f2937',
      secondaryColumnBg: '#ecfeff',
      mainColumnBg: 'transparent'
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
          Choose a pre-designed style with consistent colors and typography
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
                
                {/* Enhanced Color Preview with layout colors */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div 
                      className="w-3 h-3 rounded-full border border-gray-200"
                      style={{ backgroundColor: preset.preview.primaryColor }}
                      title="Primary/Sidebar Color"
                    />
                    <div 
                      className="w-3 h-3 rounded-full border border-gray-200"
                      style={{ backgroundColor: preset.config.secondaryColumnBg }}
                      title="Secondary Column Background"
                    />
                    <div 
                      className="w-3 h-3 rounded-full border border-gray-200"
                      style={{ backgroundColor: preset.preview.accentColor }}
                      title="Accent Color"
                    />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {preset.preview.font} {preset.config.baseFontSize}pt
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
        <p className="font-medium mb-1">Style includes:</p>
        <ul className="space-y-1">
          <li>• Consistent typography (11pt base, 16pt headings)</li>
          <li>• Complementary sidebar and content backgrounds</li>
          <li>• Coordinated color schemes for all layout types</li>
          <li>• Optimized contrast for readability</li>
        </ul>
      </div>
    </div>
  );
};

export { TemplateStylePresets, STYLE_PRESETS };
export type { StylePreset };
