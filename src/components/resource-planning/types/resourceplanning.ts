export interface ResourcePlanningData {
  id: string;
  profile_id: string;
  engagement_percentage: number;
  billing_percentage: number;
  release_date: string;
  engagement_start_date: string;
  engagement_complete: boolean;
  weekly_validation: boolean;
  is_forecasted: boolean;
  created_at: string;
  updated_at: string;
  profile: {
    id: string;
    employee_id: string;
    first_name: string;
    last_name: string;
    current_designation: string;
    has_overhead: boolean;
  };
  bill_type: {
    id: string;
    name: string;
  } | null;
  project: {
    id: string;
    project_name: string;
    project_manager: string;
    client_name: string;
    budget: number;
    project_level?: string;
    project_bill_type?: string;
    project_type_name?: string;
  } | null;
  manager: {
    id: string;
    first_name: string;
    last_name: string;
    employee_id: string;
    full_name: string;
  } | null;
  expertise: string;
}