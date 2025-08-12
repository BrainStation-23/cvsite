
import React from 'react';
import CompactSmartDatePicker from '@/components/ui/compact-smart-date-picker';

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
    <CompactSmartDatePicker
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

export default CompactDatePicker;
