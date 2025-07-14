
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfQuarter, endOfQuarter, eachMonthOfInterval, isSameMonth, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { CalendarDays, Users, AlertTriangle } from 'lucide-react';
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
  projects: Map<string, Project>;
}

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

  // Get unique resources with their projects
  const getResourceProjects = (): ResourceData[] => {
    const resourceMap = new Map<string, ResourceData>();
    
    calendarDays.forEach(day => {
      day.resources.forEach(resource => {
        const key = resource.profileId;
        if (!resourceMap.has(key)) {
          resourceMap.set(key, {
            profileId: resource.profileId,
            profileName: resource.profileName,
            employeeId: resource.employeeId,
            projects: new Map<string, Project>()
          });
        }
        
        const resourceData = resourceMap.get(key)!;
        const projectKey = resource.projectName || 'Unassigned';
        
        if (!resourceData.projects.has(projectKey)) {
          resourceData.projects.set(projectKey, {
            name: projectKey,
            startDate: resource.engagementStartDate || '',
            endDate: resource.releaseDate,
            engagementPercentage: resource.engagementPercentage || 0
          });
        }
      });
    });
    
    return Array.from(resourceMap.values());
  };

  const resources = getResourceProjects();

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
      'hsl(var(--secondary))', 
      'hsl(220, 70%, 50%)',
      'hsl(280, 70%, 50%)',
      'hsl(340, 70%, 50%)',
      'hsl(40, 70%, 50%)',
      'hsl(160, 70%, 50%)',
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
          Q{Math.ceil((quarterStart.getMonth() + 1) / 3)} {quarterStart.getFullYear()} - Gantt View
        </h2>
        <p className="text-muted-foreground">
          {format(quarterStart, 'MMM d')} - {format(quarterEnd, 'MMM d, yyyy')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Resource Timeline</span>
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
            <div className="space-y-2">
              {resources.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No resources found for this quarter</p>
                </div>
              ) : (
                resources.map((resource) => (
                  <div key={resource.profileId} className="grid grid-cols-4 gap-0 py-2 border-b border-border/50">
                    {/* Employee Info */}
                    <div className="col-span-1 pr-4">
                      <div className="text-sm font-medium">{resource.profileName}</div>
                      <div className="text-xs text-muted-foreground">{resource.employeeId}</div>
                    </div>

                    {/* Month Columns */}
                    {months.map((month) => (
                      <div key={month.toISOString()} className="relative h-8 border-l border-border/30">
                        <div className="absolute inset-0 p-1">
                          {Array.from(resource.projects.values()).map((project, idx) => {
                            const barStyle = getProjectBarStyle(project, month);
                            if (!barStyle) return null;

                            return (
                              <div
                                key={idx}
                                className="absolute h-6 rounded text-xs text-white flex items-center justify-center overflow-hidden"
                                style={{
                                  ...barStyle,
                                  backgroundColor: getProjectColor(project.name),
                                  top: `${idx * 20}%`,
                                  height: '18px',
                                  fontSize: '10px'
                                }}
                                title={`${project.name} (${project.engagementPercentage}%)`}
                              >
                                <span className="truncate px-1">{project.name}</span>
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

          {/* Legend */}
          {resources.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="text-sm font-medium mb-2">Projects Legend</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(
                  resources.flatMap(r => Array.from(r.projects.values()).map(p => p.name))
                )).map((projectName) => (
                  <div key={projectName} className="flex items-center space-x-2 text-xs">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: getProjectColor(projectName) }}
                    />
                    <span>{projectName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
