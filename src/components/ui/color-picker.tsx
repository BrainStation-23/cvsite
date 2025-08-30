
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Palette } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

const predefinedColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85BDCB', '#D2B4DE'
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setInputValue(color);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Validate hex color format
    if (/^#[0-9A-F]{6}$/i.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleInputBlur = () => {
    // Reset to current value if invalid
    if (!/^#[0-9A-F]{6}$/i.test(inputValue)) {
      setInputValue(value);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            className="w-10 h-10 p-0 border-2"
            style={{ backgroundColor: value }}
          >
            <Palette className="h-4 w-4" style={{ color: value === '#FFFFFF' ? '#000000' : '#FFFFFF' }} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Color</label>
              <Input
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="#FFFFFF"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Presets</label>
              <div className="grid grid-cols-5 gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        placeholder="#FFFFFF"
        className="w-24 text-xs"
        disabled={disabled}
      />
    </div>
  );
};
