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
      project_name: item.project?.project_name || 'Unknown Project',
      client_name: item.project?.client_name || 'Unknown Client',
      project_manager: item.project?.project_manager || 'Unknown PM',
      start_date: new Date(item.engagement_start_date),
      end_date: item.release_date ? new Date(item.release_date) : null,
      engagement_percentage: item.engagement_percentage,
      billing_percentage: item.billing_percentage,
      bill_type: item.bill_type,
      is_forecasted: !!item.forecasted_project
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

export function calculateEngagementPosition(
  engagement: GanttEngagement,
  timelineStart: Date,
  timelineEnd: Date,
  totalWidth: number
): { left: number; width: number } {
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
  
  return { left, width };
}

export function formatEngagementTooltip(engagement: GanttEngagement): string {
  const startDate = format(engagement.start_date, 'MMM dd, yyyy');
  const endDate = engagement.end_date ? format(engagement.end_date, 'MMM dd, yyyy') : 'Ongoing';
  
  return `
    Project: ${engagement.project_name}
    Client: ${engagement.client_name}
    PM: ${engagement.project_manager}
    Duration: ${startDate} - ${endDate}
    Engagement: ${engagement.engagement_percentage}%
    Billing: ${engagement.billing_percentage}%
    Type: ${engagement.bill_type?.name || 'Unknown'}
  `.trim();
}