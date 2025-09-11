import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, startOfDay, endOfDay } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface DateRangePickerWithPresetsProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateRangeChange: (range: DateRange) => void;
}

const DATE_PRESETS = [
  {
    label: "This Week",
    getValue: () => ({
      startDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
      endDate: endOfWeek(new Date(), { weekStartsOn: 1 })
    })
  },
  {
    label: "Last Week", 
    getValue: () => ({
      startDate: startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
      endDate: endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 })
    })
  },
  {
    label: "This Month",
    getValue: () => ({
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date())
    })
  },
  {
    label: "Last Month",
    getValue: () => ({
      startDate: startOfMonth(subMonths(new Date(), 1)),
      endDate: endOfMonth(subMonths(new Date(), 1))
    })
  },
  {
    label: "Last 30 Days",
    getValue: () => ({
      startDate: startOfDay(subWeeks(new Date(), 4)),
      endDate: endOfDay(new Date())
    })
  }
];

export const DateRangePickerWithPresets: React.FC<DateRangePickerWithPresetsProps> = ({
  startDate,
  endDate,
  onDateRangeChange
}) => {
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(startDate || undefined);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(endDate || undefined);
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetClick = (preset: typeof DATE_PRESETS[0]) => {
    const range = preset.getValue();
    onDateRangeChange(range);
    setTempStartDate(range.startDate || undefined);
    setTempEndDate(range.endDate || undefined);
    setIsOpen(false);
  };

  const handleApplyCustomRange = () => {
    onDateRangeChange({
      startDate: tempStartDate || null,
      endDate: tempEndDate || null
    });
    setIsOpen(false);
  };

  const handleClearRange = () => {
    onDateRangeChange({ startDate: null, endDate: null });
    setTempStartDate(undefined);
    setTempEndDate(undefined);
    setIsOpen(false);
  };

  const formatDateRange = () => {
    if (!startDate && !endDate) return "Select date range";
    if (startDate && endDate) {
      return `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd, yyyy")}`;
    }
    if (startDate) return `From ${format(startDate, "MMM dd, yyyy")}`;
    if (endDate) return `Until ${format(endDate, "MMM dd, yyyy")}`;
    return "Select date range";
  };

  return (
    <div className="space-y-2">
      <Label>Date Range</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !startDate && !endDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Presets */}
            <div className="border-r p-3 space-y-1 min-w-[120px]">
              <Label className="text-xs font-medium text-muted-foreground">PRESETS</Label>
              <div className="space-y-1">
                {DATE_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-8"
                    onClick={() => handlePresetClick(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <Separator className="my-2" />
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-8 text-muted-foreground"
                onClick={handleClearRange}
              >
                Clear
              </Button>
            </div>
            
            {/* Custom Date Selection */}
            <div className="p-3">
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">CUSTOM RANGE</Label>
              <div className="flex gap-3">
                <div>
                  <Label className="text-xs">Start Date</Label>
                  <Calendar
                    mode="single"
                    selected={tempStartDate}
                    onSelect={setTempStartDate}
                    className="p-0"
                  />
                </div>
                <div>
                  <Label className="text-xs">End Date</Label>
                  <Calendar
                    mode="single"
                    selected={tempEndDate}
                    onSelect={setTempEndDate}
                    className="p-0"
                  />
                </div>

              </div>
              <div className="flex justify-end gap-2 mt-3">
                  <Button size="sm" onClick={handleApplyCustomRange}>
                    Apply
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};