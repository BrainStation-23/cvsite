
import React from 'react';
import SmartDatePicker from '@/components/ui/smart-date-picker';

interface CompactDatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const CompactDatePicker: React.FC<CompactDatePickerProps> = ({
  value,
  onChange,
  placeholder = "dd-mm-yyyy",
  disabled = false
}) => {
  return (
    <SmartDatePicker
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="text-xs h-7"
    />
  );
};

export default CompactDatePicker;
