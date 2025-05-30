
import React from 'react';
import ColorCustomization from './customization/ColorCustomization';
import TypographyCustomization from './customization/TypographyCustomization';
import SpacingCustomization from './customization/SpacingCustomization';

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

      <ColorCustomization 
        layoutConfig={layoutConfig}
        onConfigUpdate={onConfigUpdate}
      />

      <TypographyCustomization 
        layoutConfig={layoutConfig}
        onConfigUpdate={onConfigUpdate}
      />

      <SpacingCustomization 
        layoutConfig={layoutConfig}
        onConfigUpdate={onConfigUpdate}
      />
    </div>
  );
};

export default CustomizationPanel;
