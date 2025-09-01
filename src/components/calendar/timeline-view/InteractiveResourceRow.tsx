
import React, { useState } from 'react';
import { InteractiveProjectBar } from './InteractiveProjectBar';
import { InteractiveEmptySpace } from './InteractiveEmptySpace';

interface Project {
  id?: string;
  name: string;
  startDate: string;
  endDate: string | null;
  engagementPercentage: number;
}

interface ResourceData {
  billTypeColorCode: string;
  profileId: string;
  profileName: string;
  employeeId: string;
  projects: Project[];
}

interface InteractiveResourceRowProps {
  resource: ResourceData;
  months: Date[];
  selectedProjects: Set<string>;
  onSelectProject: (resourceId: string, projectIndex: number) => void;
  onEditProject: (resourceId: string, projectIndex: number) => void;
  onDuplicateProject: (resourceId: string, projectIndex: number) => void;
  onDeleteProject: (resourceId: string, projectIndex: number) => void;
  onCreateEngagement: (startDate: Date, resourceId: string) => void;
}

export const InteractiveResourceRow: React.FC<InteractiveResourceRowProps> = ({
  resource,
  months,
  selectedProjects,
  onSelectProject,
  onEditProject,
  onDuplicateProject,
  onDeleteProject,
  onCreateEngagement,
}) => {
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  const getProjectKey = (resourceId: string, projectIndex: number) => 
    `${resourceId}-${projectIndex}`;

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
            style={{ height: `${Math.max(resource.projects.length * 35, 40)}px` }}
            onMouseEnter={() => setHoveredMonth(monthKey)}
            onMouseLeave={() => setHoveredMonth(null)}
          >
            {/* Empty space for creating new engagements */}
            <InteractiveEmptySpace
              month={month}
              resourceId={resource.profileId}
              onCreateEngagement={onCreateEngagement}
            />

            {/* Project bars */}
            <div className="absolute inset-0 p-1 pointer-events-none">
              {resource.projects.map((project, idx) => {
                const projectKey = getProjectKey(resource.profileId, idx);
                return (
                  <div key={idx} className="pointer-events-auto">
                    <InteractiveProjectBar
                      project={project}
                      month={month}
                      index={idx}
                      colorCode={resource.billTypeColorCode}
                      resourceId={resource.profileId}
                      onEdit={() => onEditProject(resource.profileId, idx)}
                      onDuplicate={() => onDuplicateProject(resource.profileId, idx)}
                      onDelete={() => onDeleteProject(resource.profileId, idx)}
                      isSelected={selectedProjects.has(projectKey)}
                      onSelect={() => onSelectProject(resource.profileId, idx)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
