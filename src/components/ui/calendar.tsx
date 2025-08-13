
import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { format, setMonth, setYear, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Button } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

type ViewMode = 'calendar' | 'months' | 'years';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const monthsShort = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

interface CalendarHeaderProps {
  currentDate: Date
  onPrevious: () => void
  onNext: () => void
  onMonthClick: () => void
  onYearClick: () => void
  viewMode: ViewMode
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPrevious,
  onNext,
  onMonthClick,
  onYearClick,
  viewMode,
}) => {
  const getTitle = () => {
    switch (viewMode) {
      case 'months':
        return format(currentDate, 'yyyy')
      case 'years':
        const currentYear = currentDate.getFullYear()
        const startYear = Math.floor(currentYear / 12) * 12
        return `${startYear} - ${startYear + 11}`
      default:
        return null
    }
  }

  const title = getTitle()

  return (
    <div className="flex items-center justify-between p-3 border-b">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center space-x-1">
        {viewMode === 'calendar' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMonthClick}
              className="text-sm font-medium hover:bg-accent"
            >
              {format(currentDate, 'MMMM')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onYearClick}
              className="text-sm font-medium hover:bg-accent"
            >
              {format(currentDate, 'yyyy')}
            </Button>
          </>
        )}
        {title && (
          <div className="text-sm font-medium px-2">
            {title}
          </div>
        )}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface MonthGridProps {
  currentDate: Date
  onMonthSelect: (monthIndex: number) => void
}

const MonthGrid: React.FC<MonthGridProps> = ({ currentDate, onMonthSelect }) => {
  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-2">
        {monthsShort.map((month, index) => (
          <Button
            key={month}
            variant={currentDate.getMonth() === index ? "default" : "ghost"}
            size="sm"
            className="h-11 text-sm font-normal"
            onClick={() => onMonthSelect(index)}
          >
            {month}
          </Button>
        ))}
      </div>
    </div>
  )
}

interface YearGridProps {
  currentDate: Date
  onYearSelect: (year: number) => void
}

const YearGrid: React.FC<YearGridProps> = ({ currentDate, onYearSelect }) => {
  const currentYear = currentDate.getFullYear()
  const startYear = Math.floor(currentYear / 12) * 12
  const years = Array.from({ length: 12 }, (_, i) => startYear + i)

  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-2">
        {years.map(year => (
          <Button
            key={year}
            variant={currentDate.getFullYear() === year ? "default" : "ghost"}
            size="sm"
            className="h-11 text-sm font-normal"
            onClick={() => onYearSelect(year)}
          >
            {year}
          </Button>
        ))}
      </div>
    </div>
  )
}

interface DayGridProps {
  currentDate: Date
  selectedDate?: Date
  onDateSelect: (date: Date) => void
}

const DayGrid: React.FC<DayGridProps> = ({ currentDate, selectedDate, onDateSelect }) => {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  // Calculate starting day of week (0 = Sunday)
  const startDayOfWeek = monthStart.getDay()
  const paddingDays = Array.from({ length: startDayOfWeek }, (_, i) => i)

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <div className="p-4">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for padding */}
        {paddingDays.map(i => (
          <div key={`padding-${i}`} className="h-9" />
        ))}
        
        {/* Days */}
        {days.map(day => {
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isTodayDate = isToday(day)
          
          return (
            <Button
              key={day.toISOString()}
              variant="ghost"
              size="sm"
              className={cn(
                "h-9 w-9 p-0 font-normal",
                isTodayDate && "bg-accent text-accent-foreground font-medium",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
              onClick={() => onDateSelect(day)}
            >
              {format(day, 'd')}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [viewMode, setViewMode] = React.useState<ViewMode>('calendar')
  const [currentDate, setCurrentDate] = React.useState<Date>(
    props.month || props.defaultMonth || new Date()
  )

  React.useEffect(() => {
    if (props.month && props.month !== currentDate) {
      setCurrentDate(props.month)
    }
  }, [props.month])

  const handlePrevious = () => {
    let newDate: Date
    switch (viewMode) {
      case 'months':
        newDate = setYear(currentDate, currentDate.getFullYear() - 1)
        break
      case 'years':
        newDate = setYear(currentDate, currentDate.getFullYear() - 12)
        break
      default:
        newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    }
    setCurrentDate(newDate)
    props.onMonthChange?.(newDate)
  }

  const handleNext = () => {
    let newDate: Date
    switch (viewMode) {
      case 'months':
        newDate = setYear(currentDate, currentDate.getFullYear() + 1)
        break
      case 'years':
        newDate = setYear(currentDate, currentDate.getFullYear() + 12)
        break
      default:
        newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    }
    setCurrentDate(newDate)
    props.onMonthChange?.(newDate)
  }

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = setMonth(currentDate, monthIndex)
    setCurrentDate(newDate)
    setViewMode('calendar')
    props.onMonthChange?.(newDate)
  }

  const handleYearSelect = (year: number) => {
    const newDate = setYear(currentDate, year)
    setCurrentDate(newDate)
    setViewMode('calendar')
    props.onMonthChange?.(newDate)
  }

  const handleDateSelect = (date: Date) => {
    props.onSelect?.(date)
  }

  const renderContent = () => {
    switch (viewMode) {
      case 'months':
        return (
          <MonthGrid
            currentDate={currentDate}
            onMonthSelect={handleMonthSelect}
          />
        )
      case 'years':
        return (
          <YearGrid
            currentDate={currentDate}
            onYearSelect={handleYearSelect}
          />
        )
      default:
        return (
          <DayGrid
            currentDate={currentDate}
            selectedDate={props.selected}
            onDateSelect={handleDateSelect}
          />
        )
    }
  }

  return (
    <div className={cn("w-[280px] rounded-md border shadow pointer-events-auto", className)}>
      <CalendarHeader
        currentDate={currentDate}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onMonthClick={() => setViewMode('months')}
        onYearClick={() => setViewMode('years')}
        viewMode={viewMode}
      />
      {renderContent()}
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
