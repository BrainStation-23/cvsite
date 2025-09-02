
import React, { useState, useEffect } from 'react';
import { ForecastedProjectBar } from './ForecastedProjectBar';
import { ActualProjectBar } from './ActualProjectBar';
import { ForecastSlot } from './ForecastSlot';

interface Project {
  id?: string;
  name: string;
  startDate: string;
  endDate: string | null;
  engagementPercentage: number;
  isForecasted?: boolean;
  billTypeId?: string;
}

interface ResourceData {
  billTypeColorCode: string;
  profileId: string;
  profileName: string;
  employeeId: string;
  projects: Project[];
}

interface ImprovedInteractiveResourceRowProps {
  resource: ResourceData;
  months: Date[];
  selectedProjects: Set<string>;
  onSelectProject: (resourceId: string, projectIndex: number) => void;
  onEditProject: (resourceId: string, projectIndex: number, project: Project) => void;
  onDuplicateProject: (resourceId: string, projectIndex: number, project: Project) => void;
  onDeleteProject: (resourceId: string, projectIndex: number, project: Project) => void;
  onCreateForecast: (startDate: Date, resourceId: string) => void;
}

export const ImprovedInteractiveResourceRow: React.FC<ImprovedInteractiveResourceRowProps> = ({
  resource,
  months,
  selectedProjects,
  onSelectProject,
  onEditProject,
  onDuplicateProject,
  onDeleteProject,
  onCreateForecast,
}) => {
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  // Clear hover state on unmount or rapid changes
  useEffect(() => {
    return () => setHoveredMonth(null);
  }, []);

  const getProjectKey = (resourceId: string, projectIndex: number) => 
    `${resourceId}-${projectIndex}`;

  // Separate projects based on isForecasted property
  const actualProjects = resource.projects.filter(p => !p.isForecasted);
  const forecastedProjects = resource.projects.filter(p => p.isForecasted);

  // Fixed row height for consistency
  const rowHeight = 160;
  const maxForecastSlots = 2;

  return (
    <div 
      className="grid gap-0 py-4 border-b border-border/50"
      style={{ gridTemplateColumns: `250px repeat(${months.length}, 1fr)` }}
    >
      {/* Employee Info */}
      <div className="pr-4 flex flex-col justify-center">
        <div className="text-sm font-medium">{resource.profileName}</div>
        <div className="text-xs text-muted-foreground">{resource.employeeId}</div>
      </div>

      {/* Month Columns */}
      {months.map((month) => {
        const monthKey = month.toISOString();
        const isHovered = hoveredMonth === monthKey;
        
        // Get forecasted projects for this specific month
        const monthForecastedProjects = forecastedProjects.filter(project => {
          const projectStartMonth = new Date(project.startDate).getMonth();
          const projectStartYear = new Date(project.startDate).getFullYear();
          return projectStartMonth === month.getMonth() && projectStartYear === month.getFullYear();
        });
        
        return (
          <div 
            key={monthKey}
            className="relative border-l border-border/30 group" 
            style={{ height: `${rowHeight}px` }}
            onMouseEnter={() => setHoveredMonth(monthKey)}
            onMouseLeave={() => setHoveredMonth(null)}
          >
            {/* Background zones with pointer-events: none to prevent hover conflicts */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Actual projects zone (top 60%) */}
              <div 
                className="absolute top-0 left-0 right-0 bg-muted/5 border-b border-dashed border-muted-foreground/20"
                style={{ height: `${rowHeight * 0.6}px` }}
              >
                {isHovered && actualProjects.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                      Actual Projects (Read-only)
                    </span>
                  </div>
                )}
              </div>
              
              {/* Forecasted projects zone (bottom 40%) */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-primary/5 border-t border-dashed border-primary/20"
                style={{ height: `${rowHeight * 0.4}px` }}
              >
                {isHovered && monthForecastedProjects.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xs text-primary/70 bg-background/80 px-2 py-1 rounded">
                      Forecasted Projects (Click to add)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actual project bars (read-only) - z-index 10 */}
            <div 
              className="absolute inset-0 p-1 pointer-events-none"
              style={{ height: `${rowHeight * 0.6}px`, zIndex: 10 }}
            >
              {actualProjects.map((project, idx) => (
                <div key={`actual-${idx}`} className="pointer-events-auto">
                  <ActualProjectBar
                    project={project}
                    month={month}
                    index={idx}
                    colorCode={resource.billTypeColorCode}
                    resourceId={resource.profileId}
                  />
                </div>
              ))}
            </div>

            {/* Forecasted project bars and slots - z-index 15 */}
            <div 
              className="absolute p-1"
              style={{ 
                top: `${rowHeight * 0.6}px`,
                left: 0,
                right: 0,
                height: `${rowHeight * 0.4}px`,
                zIndex: 15
              }}
            >
              {/* Existing forecasted projects for this month */}
              {monthForecastedProjects.map((project, idx) => {
                const globalProjectIndex = actualProjects.length + forecastedProjects.indexOf(project);
                const projectKey = getProjectKey(resource.profileId, globalProjectIndex);
                return (
                  <div key={`forecasted-${project.id || idx}`}>
                    <ForecastedProjectBar
                      project={project}
                      month={month}
                      index={idx}
                      colorCode={resource.billTypeColorCode}
                      resourceId={resource.profileId}
                      onEdit={() => onEditProject(resource.profileId, globalProjectIndex, project)}
                      onDuplicate={() => onDuplicateProject(resource.profileId, globalProjectIndex, project)}
                      onDelete={() => onDeleteProject(resource.profileId, globalProjectIndex, project)}
                      isSelected={selectedProjects.has(projectKey)}
                      onSelect={() => onSelectProject(resource.profileId, globalProjectIndex)}
                    />
                  </div>
                );
              })}

              {/* Forecast slots - only show empty slots */}
              {Array.from({ length: maxForecastSlots }, (_, slotIdx) => {
                // Only show slot if there's no forecasted project in this position for this month
                const hasProjectInSlot = slotIdx < monthForecastedProjects.length;
                
                if (hasProjectInSlot) return null;
                
                return (
                  <ForecastSlot
                    key={`slot-${monthKey}-${slotIdx}`}
                    month={month}
                    resourceId={resource.profileId}
                    onCreateForecast={onCreateForecast}
                    isEmpty={true}
                    slotIndex={slotIdx}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
