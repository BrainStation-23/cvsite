
import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Button } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

type ViewMode = 'calendar' | 'months' | 'years';

interface MonthYearSelectorProps {
  date: Date
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
}

const MonthYearSelector: React.FC<MonthYearSelectorProps> = ({
  date,
  onMonthChange,
  onYearChange,
}) => {
  const [viewMode, setViewMode] = React.useState<ViewMode>('calendar')

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  const generateYearRange = () => {
    const currentYear = date.getFullYear()
    const startYear = Math.floor(currentYear / 12) * 12
    return Array.from({ length: 12 }, (_, i) => startYear + i)
  }

  const handleMonthSelect = (monthIndex: number) => {
    onMonthChange(monthIndex)
    setViewMode('calendar')
  }

  const handleYearSelect = (year: number) => {
    onYearChange(year)
    setViewMode('calendar')
  }

  const handlePreviousYearRange = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newYear = date.getFullYear() - 12
    onYearChange(newYear)
  }

  const handleNextYearRange = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newYear = date.getFullYear() + 12
    onYearChange(newYear)
  }

  const handlePreviousYear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newYear = date.getFullYear() - 1
    onYearChange(newYear)
  }

  const handleNextYear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newYear = date.getFullYear() + 1
    onYearChange(newYear)
  }

  if (viewMode === 'months') {
    return (
      <div className="w-[252px]">
        <div className="flex items-center justify-between p-2 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousYear}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('years')}
            className="font-medium text-sm"
          >
            {format(date, 'yyyy')}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextYear}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-3">
          <div className="grid grid-cols-3 gap-2">
            {months.map((month, index) => (
              <Button
                key={month}
                variant={date.getMonth() === index ? "default" : "ghost"}
                size="sm"
                className="h-9 text-xs font-normal"
                onClick={() => handleMonthSelect(index)}
              >
                {month}
              </Button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (viewMode === 'years') {
    const years = generateYearRange()
    
    return (
      <div className="w-[252px]">
        <div className="flex items-center justify-between p-2 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousYearRange}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="font-medium text-sm">
            {years[0]} - {years[years.length - 1]}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextYearRange}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-3">
          <div className="grid grid-cols-3 gap-2">
            {years.map(year => (
              <Button
                key={year}
                variant={date.getFullYear() === year ? "default" : "ghost"}
                size="sm"
                className="h-9 text-xs font-normal"
                onClick={() => handleYearSelect(year)}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center space-x-1">
      <Button
        variant="ghost"
        size="sm"
        className="text-sm font-medium hover:bg-accent"
        onClick={() => setViewMode('months')}
      >
        {format(date, 'MMMM')}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-sm font-medium hover:bg-accent"
        onClick={() => setViewMode('years')}
      >
        {format(date, 'yyyy')}
      </Button>
    </div>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [month, setMonth] = React.useState<Date>(
    props.month || props.defaultMonth || new Date()
  )

  React.useEffect(() => {
    if (props.month && props.month !== month) {
      setMonth(props.month)
    }
  }, [props.month])

  const handleMonthChange = (monthIndex: number) => {
    const newDate = new Date(month.getFullYear(), monthIndex, 1)
    setMonth(newDate)
    props.onMonthChange?.(newDate)
  }

  const handleYearChange = (year: number) => {
    const newDate = new Date(year, month.getMonth(), 1)
    setMonth(newDate)
    props.onMonthChange?.(newDate)
  }

  const handlePreviousMonth = () => {
    const newDate = new Date(month.getFullYear(), month.getMonth() - 1, 1)
    setMonth(newDate)
    props.onMonthChange?.(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(month.getFullYear(), month.getMonth() + 1, 1)
    setMonth(newDate)
    props.onMonthChange?.(newDate)
  }

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto w-fit", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-[252px]",
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
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-8 w-8 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100 text-sm"
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
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        Caption: ({ displayMonth }) => (
          <MonthYearSelector
            date={displayMonth}
            onMonthChange={handleMonthChange}
            onYearChange={handleYearChange}
          />
        ),
      }}
      month={month}
      onMonthChange={setMonth}
      onPrevClick={handlePreviousMonth}
      onNextClick={handleNextMonth}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
