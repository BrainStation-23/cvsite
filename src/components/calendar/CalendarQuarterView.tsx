
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, startOfQuarter, endOfQuarter, eachMonthOfInterval, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarDay } from '@/hooks/use-resource-calendar';

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
  calendarDays: CalendarDay[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

const RESOURCES_PER_PAGE = 10;

export const CalendarQuarterView: React.FC<CalendarQuarterViewProps> = ({
  currentDate,
  calendarDays,
  selectedDate,
  onDateSelect,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const quarterStart = startOfQuarter(currentDate);
  const quarterEnd = endOfQuarter(currentDate);
  const months = eachMonthOfInterval({ start: quarterStart, end: quarterEnd });

  // Get unique resources with all their projects
  const allResources = useMemo((): ResourceData[] => {
    const resourceMap = new Map<string, ResourceData>();
    
    calendarDays.forEach(day => {
      day.resources.forEach(resource => {
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
    });
    
    return Array.from(resourceMap.values()).sort((a, b) => a.profileName.localeCompare(b.profileName));
  }, [calendarDays]);

  // Pagination calculations
  const totalPages = Math.ceil(allResources.length / RESOURCES_PER_PAGE);
  const startIndex = (currentPage - 1) * RESOURCES_PER_PAGE;
  const endIndex = startIndex + RESOURCES_PER_PAGE;
  const paginatedResources = allResources.slice(startIndex, endIndex);

  // Reset to first page when resources change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [allResources.length]);

  // Helper function to calculate project bar position and width for a month
  const getProjectBarStyle = (project: Project, month: Date) => {
    if (!project.startDate) return null;
    
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const projectStart = new Date(project.startDate);
    const projectEnd = project.endDate ? new Date(project.endDate) : new Date('2099-12-31');
    
    // Check if project overlaps with this month
    const overlaps = isWithinInterval(monthStart, { start: projectStart, end: projectEnd }) ||
                    isWithinInterval(monthEnd, { start: projectStart, end: projectEnd }) ||
                    isWithinInterval(projectStart, { start: monthStart, end: monthEnd }) ||
                    isWithinInterval(projectEnd, { start: monthStart, end: monthEnd });
    
    if (!overlaps) return null;
    
    // Calculate start and end positions within the month (0-100%)
    const startPos = projectStart <= monthStart ? 0 : 
      ((projectStart.getTime() - monthStart.getTime()) / (monthEnd.getTime() - monthStart.getTime())) * 100;
    
    const endPos = projectEnd >= monthEnd ? 100 :
      ((projectEnd.getTime() - monthStart.getTime()) / (monthEnd.getTime() - monthStart.getTime())) * 100;
    
    const width = endPos - startPos;
    
    return {
      left: `${startPos}%`,
      width: `${width}%`,
    };
  };

  const getProjectColor = (projectName: string) => {
    const colors = [
      'hsl(var(--primary))',
      'hsl(220, 70%, 50%)',
      'hsl(280, 70%, 50%)',
      'hsl(340, 70%, 50%)',
      'hsl(40, 70%, 50%)',
      'hsl(160, 70%, 50%)',
      'hsl(200, 70%, 50%)',
      'hsl(320, 70%, 50%)',
    ];
    
    const hash = projectName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">
          Q{Math.ceil((quarterStart.getMonth() + 1) / 3)} {quarterStart.getFullYear()} - Resource Timeline
        </h2>
        <p className="text-muted-foreground">
          {format(quarterStart, 'MMM d')} - {format(quarterEnd, 'MMM d, yyyy')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Resource Project Timeline</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, allResources.length)} of {allResources.length} resources
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {/* Header Row */}
            <div className="grid grid-cols-4 gap-0 border-b border-border mb-4 pb-2">
              <div className="col-span-1 font-semibold text-sm">Employee</div>
              {months.map((month) => (
                <div key={month.toISOString()} className="text-center font-semibold text-sm">
                  {format(month, 'MMM yyyy')}
                </div>
              ))}
            </div>

            {/* Resource Rows */}
            <div className="space-y-4">
              {paginatedResources.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No resources found for this quarter</p>
                </div>
              ) : (
                paginatedResources.map((resource) => (
                  <div key={resource.profileId} className="grid grid-cols-4 gap-0 py-4 border-b border-border/50">
                    {/* Employee Info */}
                    <div className="col-span-1 pr-4">
                      <div className="text-sm font-medium">{resource.profileName}</div>
                      <div className="text-xs text-muted-foreground">{resource.employeeId}</div>
                    </div>

                    {/* Month Columns */}
                    {months.map((month) => (
                      <div key={month.toISOString()} className="relative border-l border-border/30" style={{ height: `${Math.max(resource.projects.length * 35, 40)}px` }}>
                        <div className="absolute inset-0 p-1">
                          {resource.projects.map((project, idx) => {
                            const barStyle = getProjectBarStyle(project, month);
                            if (!barStyle) return null;

                            return (
                              <div
                                key={idx}
                                className="absolute rounded text-xs text-white flex items-center justify-center overflow-hidden shadow-sm"
                                style={{
                                  ...barStyle,
                                  backgroundColor: getProjectColor(project.name),
                                  top: `${idx * 30}px`,
                                  height: '24px',
                                  fontSize: '10px',
                                  fontWeight: '500'
                                }}
                                title={`${project.name} (${project.engagementPercentage}%)`}
                              >
                                <span className="truncate px-2">{project.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
