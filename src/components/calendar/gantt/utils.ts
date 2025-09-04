import { startOfWeek, endOfWeek, addWeeks, startOfMonth, endOfMonth, addMonths, isSameWeek, format } from 'date-fns';
import { ResourceCalendarData } from '@/hooks/use-resource-calendar-data';
import { GanttResourceData, GanttEngagement, GanttTimelineMonth, GanttTimelineWeek } from './types';

export function transformResourceDataToGantt(resourceData: ResourceCalendarData[]): GanttResourceData[] {
  const resourceMap = new Map<string, GanttResourceData>();

  resourceData.forEach(item => {
    const profileId = item.profile.id;
    
    if (!resourceMap.has(profileId)) {
      resourceMap.set(profileId, {
        profile: item.profile,
        engagements: []
      });
    }

    const engagement: GanttEngagement = {
      id: item.id,
      project_name: item.project?.project_name || null,
      client_name: item.project?.client_name || null,
      project_manager: item.project?.project_manager || {
        id: '',
        first_name: '',
        last_name: '',
        employee_id: '',
        full_name: ''
      },
      start_date: new Date(item.engagement_start_date),
      end_date: item.release_date ? new Date(item.release_date) : null,
      engagement_percentage: item.engagement_percentage,
      billing_percentage: item.billing_percentage,
      bill_type: item.bill_type,
      is_forecasted: !!item.forecasted_project,
      forecasted_project: item.forecasted_project
    };

    resourceMap.get(profileId)!.engagements.push(engagement);
  });

  return Array.from(resourceMap.values());
}

export function generateTimeline(startMonth: Date): GanttTimelineMonth[] {
  const months: GanttTimelineMonth[] = [];
  
  for (let i = 0; i < 6; i++) {
    const monthDate = addMonths(startMonth, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    
    const weeks: GanttTimelineWeek[] = [];
    let currentWeek = startOfWeek(monthStart, { weekStartsOn: 1 });
    
    while (currentWeek <= monthEnd) {
      const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
      weeks.push({
        weekStart: currentWeek,
        weekEnd: weekEnd,
        isCurrentWeek: isSameWeek(currentWeek, new Date(), { weekStartsOn: 1 })
      });
      currentWeek = addWeeks(currentWeek, 1);
    }
    
    months.push({
      month: monthDate,
      weeks
    });
  }
  
  return months;
}

// Check if two engagements overlap in time
function engagementsOverlap(a: GanttEngagement, b: GanttEngagement): boolean {
  const aEnd = a.end_date || new Date('2099-12-31'); // Use far future for ongoing engagements
  const bEnd = b.end_date || new Date('2099-12-31');
  
  return a.start_date < bEnd && b.start_date < aEnd;
}

// Assign tracks to engagements to avoid overlaps
export function assignEngagementTracks(engagements: GanttEngagement[]): Map<string, number> {
  const trackAssignments = new Map<string, number>();
  
  // Sort engagements by start date for better track assignment
  const sortedEngagements = [...engagements].sort((a, b) => 
    a.start_date.getTime() - b.start_date.getTime()
  );
  
  // Track which tracks are occupied by time ranges
  const trackOccupancy: Array<{ engagement: GanttEngagement; track: number }> = [];
  
  for (const engagement of sortedEngagements) {
    let assignedTrack = 0;
    
    // Find the first available track
    while (true) {
      const conflictingEngagement = trackOccupancy.find(occupied => 
        occupied.track === assignedTrack && engagementsOverlap(occupied.engagement, engagement)
      );
      
      if (!conflictingEngagement) {
        break; // Found an available track
      }
      
      assignedTrack++;
    }
    
    trackAssignments.set(engagement.id, assignedTrack);
    trackOccupancy.push({ engagement, track: assignedTrack });
  }
  
  return trackAssignments;
}

// Calculate the maximum number of concurrent engagements (tracks needed)
export function calculateMaxTracks(engagements: GanttEngagement[]): number {
  if (engagements.length === 0) return 1;
  
  const trackAssignments = assignEngagementTracks(engagements);
  return Math.max(...Array.from(trackAssignments.values())) + 1;
}

export function calculateEngagementPosition(
  engagement: GanttEngagement,
  timelineStart: Date,
  timelineEnd: Date,
  totalWidth: number,
  track: number = 0,
  trackHeight: number = 24
): { left: number; width: number; track: number; trackHeight: number } {
  const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
  
  const engagementStart = engagement.start_date;
  const engagementEnd = engagement.end_date || timelineEnd;
  
  // Clamp dates to timeline bounds
  const clampedStart = new Date(Math.max(engagementStart.getTime(), timelineStart.getTime()));
  const clampedEnd = new Date(Math.min(engagementEnd.getTime(), timelineEnd.getTime()));
  
  const startOffset = Math.ceil((clampedStart.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
  const duration = Math.ceil((clampedEnd.getTime() - clampedStart.getTime()) / (1000 * 60 * 60 * 24));
  
  const left = (startOffset / totalDays) * totalWidth;
  const width = Math.max((duration / totalDays) * totalWidth, 2); // Minimum 2px width
  
  return { left, width, track, trackHeight };
}

export function formatEngagementTooltip(engagement: GanttEngagement): string {
  const startDate = format(engagement.start_date, 'MMM dd, yyyy');
  const endDate = engagement.end_date ? format(engagement.end_date, 'MMM dd, yyyy') : 'Ongoing';
  
  const lines = [
    `Project: ${engagement.project_name || engagement.forecasted_project || 'N/A'}`,
    ...(engagement.client_name ? [`Client: ${engagement.client_name}`] : []),
    ...(engagement.project_manager?.full_name ? [`PM: ${engagement.project_manager.full_name}`] : []),
    `Duration: ${startDate} - ${endDate}`,
    `Engagement: ${engagement.engagement_percentage}%`,
    `Billing: ${engagement.billing_percentage}%`,
    `Type: ${engagement.bill_type?.name || 'Unknown'}`
  ];
  
  return lines.join('\n');
}