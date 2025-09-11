export interface GanttResourceData {
  profile: {
    id: string;
    employee_id: string;
    first_name: string;
    last_name: string;
    current_designation: string;
  };
  engagements: GanttEngagement[];
}

export interface GanttEngagement {
  id: string;
  project_name: string;
  client_name: string;
  project_manager: {
    id: string;
    first_name: string;
    last_name: string;
    employee_id: string;
    full_name: string;
  };
  start_date: Date;
  end_date: Date | null;
  engagement_percentage: number;
  billing_percentage: number;
  bill_type: {
    name: string;
    color_code: string;
  } | null;
  is_forecasted: boolean;
  project: {
    project_level: string;
    project_bill_type: string;
    project_type_name: string;
  } | null;
}

export interface GanttEngagementPosition {
  left: number;
  width: number;
  track: number;
  trackHeight: number;
}

export interface GanttTimelineWeek {
  weekStart: Date;
  weekEnd: Date;
  isCurrentWeek: boolean;
}

export interface GanttTimelineMonth {
  month: Date;
  weeks: GanttTimelineWeek[];
}