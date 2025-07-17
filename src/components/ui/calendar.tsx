
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(props.month || new Date());
  const [view, setView] = React.useState<'days' | 'months' | 'years'>('days');

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const currentYear = new Date().getFullYear();
  const startYear = Math.floor(currentYear / 10) * 10 - 10;
  const years = Array.from({ length: 30 }, (_, i) => startYear + i);

  const handleMonthSelect = (monthIndex: number) => {
    const newMonth = new Date(currentMonth.getFullYear(), monthIndex, 1);
    setCurrentMonth(newMonth);
    props.onMonthChange?.(newMonth);
    setView('days');
  };

  const handleYearSelect = (year: number) => {
    const newMonth = new Date(year, currentMonth.getMonth(), 1);
    setCurrentMonth(newMonth);
    props.onMonthChange?.(newMonth);
    setView('days');
  };

  const handlePrevious = () => {
    if (view === 'days') {
      const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
      setCurrentMonth(newMonth);
      props.onMonthChange?.(newMonth);
    } else if (view === 'months') {
      const newMonth = new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1);
      setCurrentMonth(newMonth);
    } else if (view === 'years') {
      const newMonth = new Date(currentMonth.getFullYear() - 10, currentMonth.getMonth(), 1);
      setCurrentMonth(newMonth);
    }
  };

  const handleNext = () => {
    if (view === 'days') {
      const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
      setCurrentMonth(newMonth);
      props.onMonthChange?.(newMonth);
    } else if (view === 'months') {
      const newMonth = new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1);
      setCurrentMonth(newMonth);
    } else if (view === 'years') {
      const newMonth = new Date(currentMonth.getFullYear() + 10, currentMonth.getMonth(), 1);
      setCurrentMonth(newMonth);
    }
  };

  const customComponents = {
    IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
    IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
    Caption: ({ displayMonth }: { displayMonth: Date }) => {
      if (view === 'months') {
        return (
          <div className="flex flex-col space-y-2 p-2">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => setView('years')}
                className="text-sm font-medium"
              >
                {displayMonth.getFullYear()}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {months.map((month, index) => (
                <Button
                  key={month}
                  variant={index === displayMonth.getMonth() ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleMonthSelect(index)}
                  className="h-8 text-xs"
                >
                  {month}
                </Button>
              ))}
            </div>
          </div>
        );
      }

      if (view === 'years') {
        const currentDecade = Math.floor(displayMonth.getFullYear() / 10) * 10;
        const yearGrid = Array.from({ length: 12 }, (_, i) => currentDecade - 1 + i);
        
        return (
          <div className="flex flex-col space-y-2 p-2">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium">
                {currentDecade} - {currentDecade + 9}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {yearGrid.map((year) => (
                <Button
                  key={year}
                  variant={year === displayMonth.getFullYear() ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleYearSelect(year)}
                  className="h-8 text-xs"
                  disabled={year < currentDecade || year > currentDecade + 9}
                >
                  {year}
                </Button>
              ))}
            </div>
          </div>
        );
      }

      return (
        <div className="flex items-center justify-between py-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              onClick={() => setView('months')}
              className="text-sm font-medium"
            >
              {months[displayMonth.getMonth()]}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setView('years')}
              className="text-sm font-medium"
            >
              {displayMonth.getFullYear()}
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      );
    }
  };

  if (view !== 'days') {
    return (
      <div className={cn("p-3 pointer-events-auto", className)}>
        {customComponents.Caption({ displayMonth: currentMonth })}
      </div>
    );
  }

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={customComponents}
      month={currentMonth}
      onMonthChange={setCurrentMonth}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
