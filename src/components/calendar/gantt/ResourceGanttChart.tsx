import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ResourceCalendarData } from '@/hooks/use-resource-calendar-data';
import { GanttHeader } from './GanttHeader';
import { GanttRow } from './GanttRow';
import { transformResourceDataToGantt, generateTimeline } from './utils';
import { GanttEngagement } from './types';

interface ResourceGanttChartProps {
  resourceData: ResourceCalendarData[];
  currentMonth: Date;
  isLoading?: boolean;
  onEngagementClick?: (engagement: GanttEngagement) => void;
  onEmptySpaceClick?: (resourceId: string, clickDate: Date) => void;
}

export const ResourceGanttChart: React.FC<ResourceGanttChartProps> = ({
  resourceData,
  currentMonth,
  isLoading = false,
  onEngagementClick,
  onEmptySpaceClick
}) => {
  // --- Add sort state ---
  const [sortBy, setSortBy] = useState<'last_name' | 'employee_id'>('last_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const ganttData = useMemo(() => 
    transformResourceDataToGantt(resourceData), 
    [resourceData]
  );

  // --- Sort ganttData based on sortBy and sortOrder ---
  const sortedGanttData = useMemo(() => {
    const sorted = [...ganttData];
    sorted.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      if (sortBy === 'last_name') {
        aValue = a.profile.last_name?.toLowerCase() || '';
        bValue = b.profile.last_name?.toLowerCase() || '';
      } else if (sortBy === 'employee_id') {
        aValue = a.profile.employee_id || '';
        bValue = b.profile.employee_id || '';
      }
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [ganttData, sortBy, sortOrder]);

  const timeline = useMemo(() => 
    generateTimeline(currentMonth), 
    [currentMonth]
  );

  // infinite scroll state
  const [visibleCount, setVisibleCount] = useState(20);
  const listRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if( !el) return;
    if ( el.scrollTop + el.clientHeight >= el.scrollHeight - 100 ) {
      setVisibleCount((prev)=> Math.min(prev + 20 , ganttData.length))
    }
  }, [ganttData]);

  useEffect(()=>{
    setVisibleCount(20);
  }, [ganttData]);

  // --- Sorting handler ---
  const handleSort = (column: 'last_name' | 'employee_id') => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (ganttData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/20 rounded-lg border-2 border-dashed border-muted">
        <div className="text-center">
          <p className="text-muted-foreground">No resource data available</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your filters or date range
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg border overflow-hidden">
      <GanttHeader
        timeline={timeline}
        resourceCount={ganttData.length}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
      <div className="h-full max-h-[700px] overflow-auto" ref={listRef} onScroll={handleScroll}>
        {sortedGanttData.slice(0, visibleCount).map((resource) => (
          <GanttRow
            key={resource.profile.id}
            resource={resource}
            timeline={timeline}
            onEngagementClick={onEngagementClick}
            onEmptySpaceClick={onEmptySpaceClick}
          />
        ))}
        {visibleCount < ganttData.length && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Scroll down to load more...
          </div>
        )}
      </div>
    </div>
  );
};