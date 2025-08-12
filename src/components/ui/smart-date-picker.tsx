
import * as React from "react";
import { format, setMonth, setYear, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface SmartDatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

type ViewMode = 'days' | 'months' | 'years';

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const SmartDatePicker: React.FC<SmartDatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  className
}) => {
  const [open, setOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<ViewMode>('days');
  const [viewDate, setViewDate] = React.useState(() => value ? new Date(value) : new Date());
  
  const selectedDate = value ? new Date(value) : undefined;

  const handleDateSelect = (date: Date) => {
    onChange(format(date, 'yyyy-MM-dd'));
    setOpen(false);
    setViewMode('days');
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = setMonth(viewDate, monthIndex);
    setViewDate(newDate);
    setViewMode('days');
  };

  const handleYearSelect = (year: number) => {
    const newDate = setYear(viewDate, year);
    setViewDate(newDate);
    setViewMode('days');
  };

  const generateYearRange = () => {
    const currentYear = viewDate.getFullYear();
    const startYear = Math.floor(currentYear / 12) * 12;
    return Array.from({ length: 12 }, (_, i) => startYear + i);
  };

  const renderDaysView = () => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Calculate starting day of week (0 = Sunday, 1 = Monday, etc.)
    const startDayOfWeek = monthStart.getDay();
    const paddingDays = Array.from({ length: startDayOfWeek }, (_, i) => i);

    return (
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('months')}
              className="font-medium"
            >
              {format(viewDate, 'MMMM')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('years')}
              className="font-medium"
            >
              {format(viewDate, 'yyyy')}
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Padding days */}
          {paddingDays.map(i => (
            <div key={`padding-${i}`} className="p-2" />
          ))}
          
          {/* Actual days */}
          {days.map(day => (
            <Button
              key={day.toISOString()}
              variant="ghost"
              size="sm"
              className={cn(
                "h-9 w-9 p-0 font-normal",
                isToday(day) && "bg-accent text-accent-foreground",
                selectedDate && isSameDay(day, selectedDate) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
              onClick={() => handleDateSelect(day)}
            >
              {format(day, 'd')}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthsView = () => (
    <div className="p-3">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth()))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewMode('years')}
          className="font-medium"
        >
          {format(viewDate, 'yyyy')}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth()))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {months.map((month, index) => (
          <Button
            key={month}
            variant="ghost"
            size="sm"
            className={cn(
              "h-12 font-normal",
              viewDate.getMonth() === index && "bg-primary text-primary-foreground"
            )}
            onClick={() => handleMonthSelect(index)}
          >
            {month}
          </Button>
        ))}
      </div>
    </div>
  );

  const renderYearsView = () => {
    const years = generateYearRange();
    
    return (
      <div className="p-3">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewDate(new Date(viewDate.getFullYear() - 12, viewDate.getMonth()))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="font-medium">
            {years[0]} - {years[years.length - 1]}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewDate(new Date(viewDate.getFullYear() + 12, viewDate.getMonth()))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {years.map(year => (
            <Button
              key={year}
              variant="ghost"
              size="sm"
              className={cn(
                "h-12 font-normal",
                viewDate.getFullYear() === year && "bg-primary text-primary-foreground"
              )}
              onClick={() => handleYearSelect(year)}
            >
              {year}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderView = () => {
    switch (viewMode) {
      case 'months':
        return renderMonthsView();
      case 'years':
        return renderYearsView();
      default:
        return renderDaysView();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, 'PPP') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {renderView()}
      </PopoverContent>
    </Popover>
  );
};

export default SmartDatePicker;
