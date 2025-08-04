
import React from 'react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

interface ThemedSliderProps {
  label: string;
  theme?: 'blue' | 'green' | 'purple' | 'orange' | 'gray';
  icon?: React.ReactNode;
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  formatValue?: (value: number[]) => string;
}

const ThemedSlider: React.FC<ThemedSliderProps> = ({
  label,
  theme = 'gray',
  icon,
  value,
  onValueChange,
  min = 0,
  max = 20,
  step = 1,
  formatValue = (val) => `${val[0]}-${val[1]} years`
}) => {
  const themeClasses = {
    blue: {
      container: 'bg-blue-50/30 border-blue-200',
      label: 'text-blue-600',
      icon: 'text-blue-500',
      valueText: 'text-blue-700'
    },
    green: {
      container: 'bg-green-50/30 border-green-200',
      label: 'text-green-600',
      icon: 'text-green-500',
      valueText: 'text-green-700'
    },
    purple: {
      container: 'bg-purple-50/30 border-purple-200',
      label: 'text-purple-600',
      icon: 'text-purple-500',
      valueText: 'text-purple-700'
    },
    orange: {
      container: 'bg-orange-50/30 border-orange-200',
      label: 'text-orange-600',
      icon: 'text-orange-500',
      valueText: 'text-orange-700'
    },
    gray: {
      container: 'bg-gray-50/30 border-gray-200',
      label: 'text-gray-600',
      icon: 'text-gray-500',
      valueText: 'text-gray-700'
    }
  };

  const currentTheme = themeClasses[theme];

  return (
    <div className={cn(
      'border rounded-md px-3 py-3 transition-all duration-200',
      currentTheme.container
    )}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && (
              <div className={cn('flex-shrink-0', currentTheme.icon)}>
                {icon}
              </div>
            )}
            <label className={cn('text-xs font-medium', currentTheme.label)}>
              {label}
            </label>
          </div>
          <span className={cn('text-xs font-medium', currentTheme.valueText)}>
            {formatValue(value)}
          </span>
        </div>
        
        <Slider
          value={value}
          onValueChange={onValueChange}
          max={max}
          min={min}
          step={step}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default ThemedSlider;
