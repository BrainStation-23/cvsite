
import React from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CalendarDay as CalendarDayType } from '@/hooks/use-resource-calendar';

interface CalendarDayViewProps {
  selectedDate: Date;
  dayData: CalendarDayType | null;
}

export const CalendarDayView: React.FC<CalendarDayViewProps> = ({
  selectedDate,
  dayData,
}) => {
  const isCurrentDay = isToday(selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={cn(
          "text-3xl font-bold",
          isCurrentDay && "text-blue-600"
        )}>
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h2>
        {isCurrentDay && (
          <Badge variant="secondary">Today</Badge>
        )}
      </div>

      {dayData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Statistics Cards */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Day Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Available</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">
                    {dayData.availableResources}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="font-medium">Over-allocated</span>
                  </div>
                  <span className="text-xl font-bold text-red-600">
                    {dayData.overAllocatedResources}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Total Resources</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">
                    {dayData.resources.length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resource List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Resources ({dayData.resources.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {dayData.resources.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {dayData.resources.map((resource, idx) => (
                      <div key={`${resource.id}-${idx}`} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-lg">{resource.profileName}</div>
                            <div className="text-sm text-gray-600">{resource.employeeId}</div>
                          </div>
                          <Badge variant={resource.engagementPercentage > 100 ? 'destructive' : 'secondary'}>
                            {resource.engagementPercentage}%
                          </Badge>
                        </div>
                        
                        {resource.projectName && (
                          <div className="text-sm text-gray-700 mb-1">
                            <strong>Project:</strong> {resource.projectName}
                          </div>
                        )}
                        
                        {resource.billTypeName && (
                          <div className="text-sm text-gray-700">
                            <strong>Type:</strong> {resource.billTypeName}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No resources allocated for this day</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500">No resource data available for this date</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
