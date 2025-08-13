
import * as React from "react";
import { format, parse } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

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
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(
    value ? format(new Date(value), 'dd-MM-yyyy') : ''
  );

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const displayDate = format(selectedDate, 'dd-MM-yyyy');
      setInputValue(displayDate);
      onChange(formattedDate);
    } else {
      setInputValue('');
      onChange('');
    }
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    setInputValue(inputVal);
    
    // Try to parse the input as dd-MM-yyyy
    if (inputVal.length === 10) {
      try {
        const parsedDate = parse(inputVal, 'dd-MM-yyyy', new Date());
        if (!isNaN(parsedDate.getTime())) {
          setDate(parsedDate);
          onChange(format(parsedDate, 'yyyy-MM-dd'));
        }
      } catch (error) {
        // Invalid date format, ignore
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full  text-xs cursor-pointer"
          onClick={() => setOpen(true)}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          className="pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
};

export default CompactDatePicker;
