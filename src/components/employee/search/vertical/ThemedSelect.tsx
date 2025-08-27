
import React from 'react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown } from 'lucide-react';

interface ThemedSelectProps {
  label: string;
  theme?: 'blue' | 'green' | 'purple' | 'orange' | 'gray';
  icon?: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
}

const ThemedSelect: React.FC<ThemedSelectProps> = ({
  label,
  theme = 'gray',
  icon,
  value = '',
  onValueChange,
  placeholder,
  children
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
      <div className="flex items-center px-3 py-2">
        {icon && (
          <div className={cn('mr-2 flex-shrink-0', currentTheme.icon)}>
            {icon}
          </div>
        )}
        
        <div className="relative flex-1">
          {hasValue && (
            <label className={cn(
              'absolute left-0 top-0 text-xs opacity-70 transition-all duration-200',
              currentTheme.label
            )}>
              {label}
            </label>
          )}
          
          <Select value={value || ''} onValueChange={onValueChange}>
            <SelectTrigger className={cn(
              'border-0 bg-transparent p-0 focus:ring-0 h-auto shadow-none',
              hasValue ? 'pt-4 pb-0' : 'py-1'
            )}>
              <SelectValue placeholder={hasValue ? placeholder : label} />
            </SelectTrigger>
            <SelectContent>
              {children}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ThemedSelect;
