
import React from 'react';
import { InteractiveResourceRow } from './InteractiveResourceRow';
import { EngagementModal } from './EngagementModal';
import { useInteractiveTimeline } from '@/hooks/use-interactive-timeline';

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

interface InteractiveTimelineViewProps {
  resources: ResourceData[];
  months: Date[];
}

export const InteractiveTimelineView: React.FC<InteractiveTimelineViewProps> = ({
  resources,
  months,
}) => {
  const {
    selectedProjects,
    modalState,
    handleSelectProject,
    clearSelection,
    handleEditProject,
    handleDuplicateProject,
    handleDeleteProject,
    handleCreateEngagement,
    handleSaveEngagement,
    closeModal,
    isLoading,
  } = useInteractiveTimeline();

  return (
    <>
      <div className="space-y-0">
        {/* Timeline Header */}
        <div 
          className="grid gap-0 py-2 bg-muted/30 border-b-2 border-border sticky top-0 z-20"
          style={{ gridTemplateColumns: `250px repeat(${months.length}, 1fr)` }}
        >
          <div className="pr-4 font-medium text-sm">Employee</div>
          {months.map((month) => (
            <div 
              key={month.toISOString()}
              className="text-center text-sm font-medium border-l border-border/30 py-2"
            >
              {month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          ))}
        </div>

        {/* Resource Rows */}
        {resources.map((resource) => (
          <InteractiveResourceRow
            key={resource.profileId}
            resource={resource}
            months={months}
            selectedProjects={selectedProjects}
            onSelectProject={handleSelectProject}
            onEditProject={handleEditProject}
            onDuplicateProject={handleDuplicateProject}
            onDeleteProject={handleDeleteProject}
            onCreateEngagement={handleCreateEngagement}
          />
        ))}
      </div>

      {/* Engagement Modal */}
      <EngagementModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSave={handleSaveEngagement}
        initialData={modalState.data}
        preselectedResourceId={modalState.preselectedResourceId}
        preselectedStartDate={modalState.preselectedStartDate}
        mode={modalState.mode}
      />
    </>
  );
};
