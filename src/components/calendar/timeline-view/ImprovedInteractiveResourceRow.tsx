
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

  // Separate projects into actual and forecasted
  const actualProjects = resource.projects.filter(p => !p.isForecasted);
  const forecastedProjects = resource.projects.filter(p => p.isForecasted);

  // Calculate row height based on max projects in any month
  const maxProjectsPerMonth = Math.max(
    actualProjects.length + forecastedProjects.length + 2, // +2 for empty forecast slots
    4 // Minimum height for 4 slots
  );
  const rowHeight = Math.max(maxProjectsPerMonth * 35, 140);

  return (
    <div 
      className="grid gap-0 py-4 border-b border-border/50"
      style={{ gridTemplateColumns: `250px repeat(${months.length}, 1fr)` }}
    >
      {/* Employee Info */}
      <div className="pr-4">
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
              {/* Actual projects zone (top half) */}
              <div 
                className="absolute top-0 left-0 right-0 bg-muted/10 border-b border-dashed border-muted-foreground/20"
                style={{ height: `${rowHeight * 0.6}px` }}
              >
                {isHovered && actualProjects.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                      Actual Projects Zone
                    </span>
                  </div>
                )}
              </div>
              
              {/* Forecasted projects zone (bottom half) */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-primary/5"
                style={{ height: `${rowHeight * 0.4}px` }}
              >
                {isHovered && forecastedProjects.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                      Forecasted Projects Zone
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actual project bars (read-only) */}
            <div className="absolute inset-0 p-1 pointer-events-none">
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

            {/* Forecasted project bars (interactive) */}
            <div 
              className="absolute p-1 pointer-events-none"
              style={{ 
                top: `${rowHeight * 0.6}px`,
                left: 0,
                right: 0,
                bottom: 0
              }}
            >
              {forecastedProjects.map((project, idx) => {
                const projectKey = getProjectKey(resource.profileId, actualProjects.length + idx);
                return (
                  <div key={`forecasted-${idx}`} className="pointer-events-auto">
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

              {/* Empty forecast slots */}
              {Array.from({ length: 2 - forecastedProjects.length }, (_, slotIdx) => (
                <ForecastSlot
                  key={`slot-${slotIdx}`}
                  month={month}
                  resourceId={resource.profileId}
                  onCreateForecast={onCreateForecast}
                  isEmpty={true}
                  slotIndex={forecastedProjects.length + slotIdx}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
