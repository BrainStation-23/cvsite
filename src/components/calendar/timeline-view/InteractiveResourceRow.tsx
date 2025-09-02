import React from 'react';
import { ImprovedInteractiveResourceRow } from './ImprovedInteractiveResourceRow';

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

export const InteractiveResourceRow: React.FC<InteractiveResourceRowProps> = (props) => {
  // Use the improved component
  return <ImprovedInteractiveResourceRow {...props} onCreateForecast={props.onCreateEngagement} />;
};
