
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfQuarter, endOfQuarter, eachMonthOfInterval, isSameMonth } from 'date-fns';
import { CalendarDays, Users, AlertTriangle } from 'lucide-react';
import type { CalendarDay } from '@/hooks/use-resource-calendar';

interface CalendarQuarterViewProps {
  currentDate: Date;
  calendarDays: CalendarDay[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

export const CalendarQuarterView: React.FC<CalendarQuarterViewProps> = ({
  currentDate,
  calendarDays,
  selectedDate,
  onDateSelect,
}) => {
  const quarterStart = startOfQuarter(currentDate);
  const quarterEnd = endOfQuarter(currentDate);
  const months = eachMonthOfInterval({ start: quarterStart, end: quarterEnd });

  // Group calendar days by month
  const getMonthData = (month: Date) => {
    return calendarDays.filter(day => isSameMonth(day.date, month));
  };

  const getMonthSummary = (monthDays: CalendarDay[]) => {
    const totalResources = new Set(monthDays.flatMap(day => day.resources.map(r => r.profileId))).size;
    const totalOverAllocated = monthDays.reduce((sum, day) => sum + day.overAllocatedResources, 0);
    const totalAvailable = monthDays.reduce((sum, day) => sum + day.availableResources, 0);
    const avgUtilization = monthDays.length > 0 
      ? Math.round(monthDays.reduce((sum, day) => sum + day.totalEngagement, 0) / monthDays.length)
      : 0;

    return {
      totalResources,
      totalOverAllocated,
      totalAvailable,
      avgUtilization,
      activeDays: monthDays.filter(day => day.resources.length > 0).length,
    };
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">
          Q{Math.ceil((quarterStart.getMonth() + 1) / 3)} {quarterStart.getFullYear()}
        </h2>
        <p className="text-muted-foreground">
          {format(quarterStart, 'MMM d')} - {format(quarterEnd, 'MMM d, yyyy')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {months.map((month) => {
          const monthDays = getMonthData(month);
          const summary = getMonthSummary(monthDays);

          return (
            <Card key={month.toISOString()} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  {format(month, 'MMMM yyyy')}
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Month Summary Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-2xl font-bold">{summary.totalResources}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Resources</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <CalendarDays className="h-4 w-4 text-green-500" />
                      <span className="text-2xl font-bold">{summary.activeDays}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Active Days</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg Utilization</span>
                    <span className="font-medium">{summary.avgUtilization}%</span>
                  </div>
                  
                  {summary.totalOverAllocated > 0 && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">{summary.totalOverAllocated} over-allocations</span>
                    </div>
                  )}
                </div>

                {/* Recent Activity Preview */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Recent Activity</h4>
                  <div className="space-y-1">
                    {monthDays
                      .filter(day => day.resources.length > 0)
                      .slice(0, 3)
                      .map((day, idx) => (
                        <div 
                          key={idx}
                          className="flex justify-between items-center text-xs cursor-pointer hover:bg-muted/50 p-1 rounded"
                          onClick={() => onDateSelect(day.date)}
                        >
                          <span>{format(day.date, 'MMM d')}</span>
                          <span className="text-muted-foreground">
                            {day.resources.length} resource{day.resources.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      ))
                    }
                    {monthDays.filter(day => day.resources.length > 0).length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{monthDays.filter(day => day.resources.length > 0).length - 3} more days
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
