
import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  theme?: 'blue' | 'green' | 'purple' | 'orange' | 'gray';
  icon?: React.ReactNode;
  onClear?: () => void;
  showClear?: boolean;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  theme = 'gray',
  icon,
  onClear,
  showClear = false,
  className,
  value,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const hasValue = value && value.toString().length > 0;
  const shouldFloat = isFocused || hasValue;

  const themeClasses = {
    blue: {
      container: 'bg-blue-50/30 border-blue-200 focus-within:border-blue-400',
      label: 'text-blue-600 peer-focus:text-blue-600',
      icon: 'text-blue-500',
      input: 'focus:outline-none focus:ring-0'
    },
    green: {
      container: 'bg-green-50/30 border-green-200 focus-within:border-green-400',
      label: 'text-green-600 peer-focus:text-green-600',
      icon: 'text-green-500',
      input: 'focus:outline-none focus:ring-0'
    },
    purple: {
      container: 'bg-purple-50/30 border-purple-200 focus-within:border-purple-400',
      label: 'text-purple-600 peer-focus:text-purple-600',
      icon: 'text-purple-500',
      input: 'focus:outline-none focus:ring-0'
    },
    orange: {
      container: 'bg-orange-50/30 border-orange-200 focus-within:border-orange-400',
      label: 'text-orange-600 peer-focus:text-orange-600',
      icon: 'text-orange-500',
      input: 'focus:outline-none focus:ring-0'
    },
    gray: {
      container: 'bg-gray-50/30 border-gray-200 focus-within:border-gray-400',
      label: 'text-gray-600 peer-focus:text-gray-600',
      icon: 'text-gray-500',
      input: 'focus:outline-none focus:ring-0'
    }
  };

  const currentTheme = themeClasses[theme];

  return (
    <div 
      className={cn(
        'relative border rounded-md transition-all duration-200',
        currentTheme.container,
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center px-3 py-2">
        {icon && (
          <div className={cn('mr-2 flex-shrink-0', currentTheme.icon)}>
            {icon}
          </div>
        )}
        
        <div className="relative flex-1">
          <input
            ref={inputRef}
            className={cn(
              'peer w-full bg-transparent text-sm placeholder-transparent',
              currentTheme.input,
              shouldFloat ? 'pt-4 pb-0' : 'py-1'
            )}
            value={value}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={label}
            {...props}
          />
          
          <label
            className={cn(
              'absolute left-0 transition-all duration-200 pointer-events-none text-sm',
              currentTheme.label,
              shouldFloat
                ? 'top-0 text-xs opacity-70'
                : 'top-1/2 -translate-y-1/2 opacity-60'
            )}
          >
            {label}
          </label>
        </div>
        
        {showClear && hasValue && (isHovered || isFocused) && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="ml-2 p-1 hover:bg-black/10 rounded-full transition-colors"
          >
            <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
};

export default FloatingLabelInput;
