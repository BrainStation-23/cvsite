
import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, setMonth, setYear, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek } from "date-fns"

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
        className="h-7 w-7 p-0"
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
              className="text-sm font-medium hover:bg-accent h-7 px-2"
            >
              {format(currentDate, 'MMMM')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onYearClick}
              className="text-sm font-medium hover:bg-accent h-7 px-2"
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
        className="h-7 w-7 p-0"
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
    <div className="h-[252px] flex items-center justify-center">
      <div className="grid grid-cols-3 gap-2">
        {monthsShort.map((month, index) => (
          <Button
            key={month}
            variant={currentDate.getMonth() === index ? "default" : "ghost"}
            size="sm"
            className="h-10 w-16 text-sm font-normal"
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
    <div className="h-[252px] flex items-center justify-center">
      <div className="grid grid-cols-3 gap-2">
        {years.map(year => (
          <Button
            key={year}
            variant={currentDate.getFullYear() === year ? "default" : "ghost"}
            size="sm"
            className="h-10 w-16 text-sm font-normal"
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
  selected?: Date
  onDateSelect: (date: Date) => void
}

const DayGrid: React.FC<DayGridProps> = ({ currentDate, selected, onDateSelect }) => {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  
  // Get the full calendar grid (6 weeks worth of days)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  
  // Ensure we always have 6 weeks (42 days)
  const weeksToShow = 6
  const daysToShow = weeksToShow * 7
  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  
  // Pad to exactly 42 days if needed
  while (allDays.length < daysToShow) {
    const lastDay = allDays[allDays.length - 1]
    const nextDay = new Date(lastDay)
    nextDay.setDate(nextDay.getDate() + 1)
    allDays.push(nextDay)
  }

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <div className="p-3">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground h-6 flex items-center justify-center">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid - fixed height for 6 weeks */}
      <div className="grid grid-cols-7 gap-1" style={{ height: '216px' }}>
        {allDays.slice(0, daysToShow).map((day, index) => {
          const isSelected = selected && isSameDay(day, selected)
          const isTodayDate = isToday(day)
          const isCurrentMonth = day.getMonth() === currentDate.getMonth()
          
          return (
            <Button
              key={day.toISOString()}
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 font-normal text-sm",
                !isCurrentMonth && "text-muted-foreground opacity-50",
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

// Dummy DayPicker type for compatibility
interface DayPickerProps {
  mode?: 'single' | 'multiple' | 'range'
  selected?: Date | Date[]
  onSelect?: (date: Date | Date[] | undefined) => void
  month?: Date
  defaultMonth?: Date
  onMonthChange?: (month: Date) => void
  className?: string
  classNames?: any
  showOutsideDays?: boolean
}

const DayPicker: React.FC<DayPickerProps> = () => null

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
    // Handle different DayPicker modes
    if (props.mode === 'single') {
      (props as any).onSelect?.(date)
    } else {
      // For backwards compatibility, also call onSelect if it exists
      (props as any).onSelect?.(date)
    }
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
            selected={props.mode === 'single' ? props.selected as Date : undefined}
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
