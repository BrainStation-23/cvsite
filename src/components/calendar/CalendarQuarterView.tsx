
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfQuarter, endOfQuarter, eachMonthOfInterval, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Users } from 'lucide-react';
import type { CalendarResource } from '@/hooks/use-resource-calendar';
import { QuarterHeader } from './quarter-view/QuarterHeader';
import { ResourceRow } from './quarter-view/ResourceRow';
import { PaginationControls } from './quarter-view/PaginationControls';
import { EmptyResourcesState } from './quarter-view/EmptyResourcesState';

interface Project {
  name: string;
  startDate: string;
  endDate: string | null;
  engagementPercentage: number;
}

interface ResourceData {
  profileId: string;
  profileName: string;
  employeeId: string;
  projects: Project[];
}

interface CalendarQuarterViewProps {
  currentDate: Date;
  calendarData: CalendarResource[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

const RESOURCES_PER_PAGE = 10;

export const CalendarQuarterView: React.FC<CalendarQuarterViewProps> = ({
  currentDate,
  calendarData,
  selectedDate,
  onDateSelect,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const quarterStart = startOfQuarter(currentDate);
  const quarterEnd = endOfQuarter(currentDate);
  const months = eachMonthOfInterval({ start: quarterStart, end: quarterEnd });

  // Process the calendar data into resources with projects
  const allResources = useMemo((): ResourceData[] => {
    console.log('Processing quarter view data:', {
      totalCalendarData: calendarData.length,
      quarterStart: quarterStart.toISOString(),
      quarterEnd: quarterEnd.toISOString()
    });

    const resourceMap = new Map<string, ResourceData>();
    
    calendarData.forEach(resource => {
      const key = resource.profileId;
      if (!resourceMap.has(key)) {
        resourceMap.set(key, {
          profileId: resource.profileId,
          profileName: resource.profileName,
          employeeId: resource.employeeId,
          projects: []
        });
      }
      
      const resourceData = resourceMap.get(key)!;
      const projectName = resource.projectName || 'Unassigned';
      
      // Check if this project already exists for this resource
      const existingProject = resourceData.projects.find(p => p.name === projectName);
      if (!existingProject) {
        resourceData.projects.push({
          name: projectName,
          startDate: resource.engagementStartDate || '',
          endDate: resource.releaseDate,
          engagementPercentage: resource.engagementPercentage || 0
        });
      }
    });
    
    const result = Array.from(resourceMap.values()).sort((a, b) => a.profileName.localeCompare(b.profileName));
    
    console.log('Processed resources for quarter view:', {
      uniqueResources: result.length,
      sampleResource: result[0] ? {
        name: result[0].profileName,
        projectCount: result[0].projects.length
      } : null
    });

    return result;
  }, [calendarData, quarterStart, quarterEnd]);

  // Pagination calculations
  const totalPages = Math.ceil(allResources.length / RESOURCES_PER_PAGE);
  const startIndex = (currentPage - 1) * RESOURCES_PER_PAGE;
  const endIndex = startIndex + RESOURCES_PER_PAGE;
  const paginatedResources = allResources.slice(startIndex, endIndex);

  // Reset to first page when resources change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [allResources.length]);

  return (
    <div className="space-y-6">
      <QuarterHeader 
        quarterStart={quarterStart}
        quarterEnd={quarterEnd}
        months={months}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Resource Project Timeline</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {/* Resource Rows */}
            <div className="space-y-4">
              {paginatedResources.length === 0 ? (
                <EmptyResourcesState />
              ) : (
                paginatedResources.map((resource) => (
                  <ResourceRow
                    key={resource.profileId}
                    resource={resource}
                    months={months}
                  />
                ))
              )}
            </div>
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalResources={allResources.length}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
};
