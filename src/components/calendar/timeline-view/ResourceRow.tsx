
import React from 'react';
import { ProjectBar } from './ProjectBar';

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

interface ResourceRowProps {
  resource: ResourceData;
  months: Date[];
}

export const ResourceRow: React.FC<ResourceRowProps> = ({ resource, months }) => {
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
      {months.map((month) => (
        <div 
          key={month.toISOString()} 
          className="relative border-l border-border/30" 
          style={{ height: `${Math.max(resource.projects.length * 35, 40)}px` }}
        >
          <div className="absolute inset-0 p-1">
            {resource.projects.map((project, idx) => (
              <ProjectBar
                key={idx}
                project={project}
                month={month}
                index={idx}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
