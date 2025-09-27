export interface ResourcePlanningProjectManager {
  id: string | null;
  first_name: string | null;
  last_name: string | null;
  employee_id: string | null;
  full_name: string;
}

export interface ResourcePlanningProject {
  id: string;
  project_name: string;
  client_name: string | null;
  description: string | null;
  budget: number;
  is_active: boolean;
  project_level: string | null;
  project_bill_type: string | null;
  project_type_name: string | null;
  project_manager: ResourcePlanningProjectManager;
}

export interface ResourcePlanningBillType {
  id: string;
  name: string;
  is_billable: boolean;
  non_billed: boolean;
  is_support: boolean;
  color_code: string;
}

export interface ResourcePlanningProfile {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  email: string;
  profile_image: string | null;
  has_overhead: boolean;
  current_designation: string;
}

export interface ResourcePlanningSBU {
  id: string;
  name: string;
  sbu_head_name: string | null;
  sbu_head_email: string | null;
}

export interface ResourcePlanningManager {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  full_name: string;
}

export interface ResourcePlanningData {
  id: string;
  profile_id: string;
  project_id: string;
  bill_type_id: string | null;
  engagement_percentage: number;
  billing_percentage: number;
  engagement_start_date: string;
  release_date: string;
  engagement_complete: boolean;
  weekly_validation: boolean;
  is_forecasted: boolean;
  created_at: string;
  updated_at: string;
  profile: ResourcePlanningProfile;
  expertise: string | null;
  sbu: ResourcePlanningSBU;
  manager: ResourcePlanningManager | null;
  project: ResourcePlanningProject | null;
  bill_type: ResourcePlanningBillType | null;
}