
import React from 'react';
import { cn } from '@/lib/utils';

interface ThemedComboboxProps {
  label: string;
  theme?: 'blue' | 'green' | 'purple' | 'orange' | 'gray';
  icon?: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  component: React.ComponentType<any>; // The actual combobox component
  disabled?: boolean;
}

const ThemedCombobox: React.FC<ThemedComboboxProps> = ({
  label,
  theme = 'gray',
  icon,
  value,
  onValueChange,
  placeholder,
  component: ComboboxComponent,
  disabled
}) => {
  const hasValue = value && value.length > 0;

  const themeClasses = {
    blue: {
      container: 'bg-blue-50/30 border-blue-200 focus-within:border-blue-400',
      label: 'text-blue-600',
      icon: 'text-blue-500',
    },
    green: {
      container: 'bg-green-50/30 border-green-200 focus-within:border-green-400',
      label: 'text-green-600',
      icon: 'text-green-500',
    },
    purple: {
      container: 'bg-purple-50/30 border-purple-200 focus-within:border-purple-400',
      label: 'text-purple-600',
      icon: 'text-purple-500',
    },
    orange: {
      container: 'bg-orange-50/30 border-orange-200 focus-within:border-orange-400',
      label: 'text-orange-600',
      icon: 'text-orange-500',
    },
    gray: {
      container: 'bg-gray-50/30 border-gray-200 focus-within:border-gray-400',
      label: 'text-gray-600',
      icon: 'text-gray-500',
    }
  };

  const currentTheme = themeClasses[theme];

  return (
    <div className={cn(
      'relative border rounded-md transition-all duration-200',
      currentTheme.container
    )}>
      <div className="px-3 py-2">
        {hasValue && (
          <label className={cn(
            'text-xs font-medium mb-1 block',
            currentTheme.label
          )}>
            {label}
          </label>
        )}
        
        <div className="flex items-center">
          {icon && (
            <div className={cn('mr-2 flex-shrink-0', currentTheme.icon)}>
              {icon}
            </div>
          )}
          
          <ComboboxComponent
            value={value || ''}
            onValueChange={onValueChange || (() => {})}
            placeholder={hasValue ? placeholder : label}
            disabled={disabled}
            className="border-0 bg-transparent focus:ring-0 shadow-none p-0 w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ThemedCombobox;
