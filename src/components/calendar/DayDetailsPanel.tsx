
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, AlertTriangle } from 'lucide-react';
import type { CalendarDay as CalendarDayType } from '@/hooks/use-resource-calendar';

interface DayDetailsPanelProps {
  selectedDate: Date | null;
  dayData: CalendarDayType | null;
}

export const DayDetailsPanel: React.FC<DayDetailsPanelProps> = ({ 
  selectedDate, 
  dayData 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select a date'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {dayData ? (
          <DayDetails dayData={dayData} />
        ) : (
          <p className="text-gray-500 text-sm">Click on a calendar day to view resource details</p>
        )}
      </CardContent>
    </Card>
  );
};

interface DayDetailsProps {
  dayData: CalendarDayType;
}

const DayDetails: React.FC<DayDetailsProps> = ({ dayData }) => {
  const { resources, overAllocatedResources, availableResources } = dayData;

  return (
    <div className="space-y-4">
      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <Users className="h-4 w-4 mx-auto mb-1 text-green-600" />
          <div className="text-sm font-medium">{availableResources}</div>
          <div className="text-xs text-gray-600">Available</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-red-600" />
          <div className="text-sm font-medium">{overAllocatedResources}</div>
          <div className="text-xs text-gray-600">Over-allocated</div>
        </div>
      </div>

      {/* Resource List */}
      {resources.length > 0 ? (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Resources ({resources.length})</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {resources.map((resource) => (
              <div key={`${resource.id}-${resource.profileId}`} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-sm">{resource.profileName}</div>
                    <div className="text-xs text-gray-600">{resource.employeeId}</div>
                  </div>
                  <Badge variant={resource.engagementPercentage > 100 ? 'destructive' : 'secondary'}>
                    {resource.engagementPercentage}%
                  </Badge>
                </div>
                
                {resource.projectName && (
                  <div className="text-xs text-gray-600 mb-1">
                    Project: {resource.projectName}
                  </div>
                )}
                
                {resource.billTypeName && (
                  <div className="text-xs text-gray-600">
                    Type: {resource.billTypeName}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No resources allocated</p>
        </div>
      )}
    </div>
  );
};
