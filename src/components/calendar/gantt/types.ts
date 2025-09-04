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
  project_manager: string;
  start_date: Date;
  end_date: Date | null;
  engagement_percentage: number;
  billing_percentage: number;
  bill_type: {
    name: string;
    color_code: string;
  } | null;
  is_forecasted: boolean;
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