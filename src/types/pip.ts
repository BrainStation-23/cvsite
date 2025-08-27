
export interface PIP {
  pip_id: string;
  profile_id: string;
  overall_feedback: string | null;
  start_date: string;
  mid_date: string | null;
  end_date: string;
  final_review: string | null;
  status: 'hr_initiation' | 'pm_feedback' | 'hr_review' | 'ld_goal_setting' | 'mid_review' | 'final_review';
  created_at: string;
  updated_at: string;
  employee_name: string;
  employee_id: string;
  designation: string | null;
  profile_image: string | null;
  sbu_name: string | null;
  sbu_id: string | null;
  expertise_name: string | null;
  expertise_id: string | null;
  manager_name: string | null;
  manager_id: string | null;
}

export interface PIPFormData {
  profile_id: string;
  overall_feedback: string;
  start_date: string;
  mid_date?: string;
  end_date: string;
  final_review?: string;
}

export interface PIPPMFeedback {
  id: string;
  pip_id: string;
  skill_areas: string[];
  skill_gap_description: string | null;
  skill_gap_example: string | null;
  behavioral_areas: string[];
  behavioral_gap_description: string | null;
  behavioral_gap_example: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PIPPMFeedbackFormData {
  skill_areas: string[];
  skill_gap_description: string;
  skill_gap_example: string;
  behavioral_areas: string[];
  behavioral_gap_description: string;
  behavioral_gap_example: string;
}

export interface PIPDetailsResponse {
  pip: {
    id: string;
    profile_id: string;
    overall_feedback: string | null;
    start_date: string;
    mid_date: string | null;
    end_date: string;
    final_review: string | null;
    status: string;
    created_at: string;
    updated_at: string;
  };
  profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    employee_id: string | null;
    email: string | null;
    profile_image: string | null;
    current_designation: string | null;
    biography: string | null;
    resource_planning: ResourcePlanningItem[];
  };
  sbu: {
    id: string;
    name: string;
  } | null;
  expertise: {
    id: string;
    name: string;
  } | null;
  manager: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    employee_id: string | null;
  } | null;
  pm_feedback: PIPPMFeedback | null;
}

export interface ResourcePlanningItem {
  id: string;
  project_name: string | null;
  client_name: string | null;
  project_manager: string | null;
  engagement_percentage: number;
  billing_percentage: number;
  bill_type_name: string | null;
  engagement_start_date: string;
  release_date: string | null;
  is_current: boolean;
}

export interface ProfileDetails {
  id: string;
  first_name: string | null;
  last_name: string | null;
  employee_id: string | null;
  profile_image: string | null;
  sbu_name: string | null;
  expertise_name: string | null;
  manager_name: string | null;
  manager_id: string | null;
  current_designation: string | null;
  resource_planning: ResourcePlanningItem[];
  total_utilization: number;
}
