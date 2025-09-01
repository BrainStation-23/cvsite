import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { eachMonthOfInterval, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Users } from 'lucide-react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import type { CalendarResource } from '@/hooks/use-resource-calendar';
import { TimelineHeader } from './timeline-view/TimelineHeader';
import { InteractiveResourceRow } from './timeline-view/InteractiveResourceRow';
import { PaginationControls } from './timeline-view/PaginationControls';
import { EmptyResourcesState } from './timeline-view/EmptyResourcesState';
import { EngagementModal } from './timeline-view/EngagementModal';
import { useInteractiveTimeline } from '@/hooks/use-interactive-timeline';

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
  billTypeColorCode: string;
}

interface CalendarTimelineViewProps {
  startingMonth: Date;
  monthsToShow: number;
  calendarData: CalendarResource[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onIncreaseMonths: () => void;
  onDecreaseMonths: () => void;
}

const RESOURCES_PER_PAGE = 100;

export const CalendarTimelineView: React.FC<CalendarTimelineViewProps> = ({
  startingMonth,
  monthsToShow,
  calendarData,
  onPreviousMonth,
  onNextMonth,
  onIncreaseMonths,
  onDecreaseMonths,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
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

  const timelineStart = startOfMonth(startingMonth);
  const timelineEnd = endOfMonth(addMonths(startingMonth, monthsToShow - 1));
  const months = eachMonthOfInterval({ start: timelineStart, end: timelineEnd });

  // Process the calendar data into resources with projects
  const allResources = useMemo((): ResourceData[] => {
    console.log('Processing timeline view data:', {
      totalCalendarData: calendarData.length,
      timelineStart: timelineStart.toISOString(),
      timelineEnd: timelineEnd.toISOString()
    });

    const resourceMap = new Map<string, ResourceData>();
    
    calendarData.forEach(resource => {
      const key = resource.profileId;
      if (!resourceMap.has(key)) {
        resourceMap.set(key, {
          profileId: resource.profileId,
          profileName: resource.profileName,
          employeeId: resource.employeeId,
          projects: [],
          billTypeColorCode: resource.billTypeColorCode
        });
      }
      
      const resourceData = resourceMap.get(key)!;
      
      // Determine project name with priority logic:
      // 1. If forecasted_project exists, use it (highest priority)
      // 2. If project exists, use it
      // 3. Otherwise, use 'Unassigned'
      let projectName = 'Unassigned';
      
      if (resource.forecastedProject && resource.forecastedProject.trim()) {
        projectName = resource.forecastedProject.trim();
      } else if (resource.projectName && resource.projectName.trim()) {
        projectName = resource.projectName.trim();
      }
      
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
    
    console.log('Processed resources for timeline view:', {
      uniqueResources: result.length,
      sampleResource: result[0] ? {
        name: result[0].profileName,
        projectCount: result[0].projects.length,
        sampleProjects: result[0].projects.map(p => p.name)
      } : null
    });

    return result;
  }, [calendarData, timelineStart, timelineEnd]);

  // Pagination calculations
  const totalPages = Math.ceil(allResources.length / RESOURCES_PER_PAGE);
  const startIndex = (currentPage - 1) * RESOURCES_PER_PAGE;
  const endIndex = startIndex + RESOURCES_PER_PAGE;
  const paginatedResources = allResources.slice(startIndex, endIndex);

  // Reset to first page when resources change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [allResources.length]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (!over) return;

    console.log('Drag ended:', { active: active.data.current, over: over.data.current });
    
    // Handle the drag and drop logic here
    // This would involve updating the engagement dates based on the drop location
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        <TimelineHeader 
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          months={months}
          monthsToShow={monthsToShow}
          onPreviousMonth={onPreviousMonth}
          onNextMonth={onNextMonth}
          onIncreaseMonths={onIncreaseMonths}
          onDecreaseMonths={onDecreaseMonths}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Interactive Resource Timeline</span>
              </div>
              {selectedProjects.size > 0 && (
                <div className="text-sm text-muted-foreground">
                  {selectedProjects.size} selected • 
                  <button 
                    onClick={clearSelection}
                    className="ml-2 text-primary hover:underline"
                  >
                    Clear selection
                  </button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="space-y-4">
                {paginatedResources.length === 0 ? (
                  <EmptyResourcesState />
                ) : (
                  paginatedResources.map((resource) => (
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

        <EngagementModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          onSave={handleSaveEngagement}
          initialData={modalState.data}
          preselectedResourceId={modalState.preselectedResourceId}
          preselectedStartDate={modalState.preselectedStartDate}
          mode={modalState.mode}
        />
      </div>

      <DragOverlay>
        {/* Drag overlay content would go here */}
      </DragOverlay>
    </DndContext>
  );
};
