import React, { useState } from 'react';
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
  onEditProject: (resourceId: string, projectIndex: number) => void;
  onDuplicateProject: (resourceId: string, projectIndex: number) => void;
  onDeleteProject: (resourceId: string, projectIndex: number) => void;
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

  const getProjectKey = (resourceId: string, projectIndex: number) => 
    `${resourceId}-${projectIndex}`;

  // Separate projects based on isForecasted property
  const actualProjects = resource.projects.filter(p => !p.isForecasted);
  const forecastedProjects = resource.projects.filter(p => p.isForecasted);

  console.log(`Resource ${resource.profileName}:`, {
    totalProjects: resource.projects.length,
    actualProjects: actualProjects.length,
    forecastedProjects: forecastedProjects.length,
    projects: resource.projects.map(p => ({ name: p.name, isForecasted: p.isForecasted }))
  });

  // Fixed row height for consistency
  const rowHeight = 160;

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
        
        return (
          <div 
            key={monthKey}
            className="relative border-l border-border/30 group" 
            style={{ height: `${rowHeight}px` }}
            onMouseEnter={() => setHoveredMonth(monthKey)}
            onMouseLeave={() => setHoveredMonth(null)}
          >
            {/* Background zones */}
            <div className="absolute inset-0">
              {/* Actual projects zone (top 60%) */}
              <div 
                className="absolute top-0 left-0 right-0 bg-muted/5 border-b border-dashed border-muted-foreground/20"
                style={{ height: `${rowHeight * 0.6}px` }}
              >
                {isHovered && actualProjects.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
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
                {isHovered && forecastedProjects.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-primary/70 bg-background/80 px-2 py-1 rounded">
                      Forecasted Projects (Click to add)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actual project bars (read-only) */}
            <div 
              className="absolute inset-0 p-1"
              style={{ height: `${rowHeight * 0.6}px` }}
            >
              {actualProjects.map((project, idx) => (
                <div key={`actual-${idx}`}>
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

            {/* Forecasted project bars and slots */}
            <div 
              className="absolute p-1"
              style={{ 
                top: `${rowHeight * 0.6}px`,
                left: 0,
                right: 0,
                height: `${rowHeight * 0.4}px`
              }}
            >
              {/* Existing forecasted projects */}
              {forecastedProjects.map((project, idx) => {
                const projectKey = getProjectKey(resource.profileId, actualProjects.length + idx);
                return (
                  <div key={`forecasted-${idx}`}>
                    <ForecastedProjectBar
                      project={project}
                      month={month}
                      index={idx}
                      colorCode={resource.billTypeColorCode}
                      resourceId={resource.profileId}
                      onEdit={() => onEditProject(resource.profileId, actualProjects.length + idx)}
                      onDuplicate={() => onDuplicateProject(resource.profileId, actualProjects.length + idx)}
                      onDelete={() => onDeleteProject(resource.profileId, actualProjects.length + idx)}
                      isSelected={selectedProjects.has(projectKey)}
                      onSelect={() => onSelectProject(resource.profileId, actualProjects.length + idx)}
                    />
                  </div>
                );
              })}

              {/* Always show 2 forecast slots per month */}
              {Array.from({ length: 2 }, (_, slotIdx) => {
                // Only show the slot if there's no forecasted project in this position
                const hasProjectInSlot = forecastedProjects.length > slotIdx;
                return (
                  <ForecastSlot
                    key={`slot-${slotIdx}`}
                    month={month}
                    resourceId={resource.profileId}
                    onCreateForecast={onCreateForecast}
                    isEmpty={!hasProjectInSlot}
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
