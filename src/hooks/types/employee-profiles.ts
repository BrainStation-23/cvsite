
export interface ResourcePlanningBreakdownItem {
  id: string;
  project_id: string | null;
  project_name: string | null;
  client_name: string | null;
  project_manager: string | null;
  bill_type_id: string | null;
  bill_type_name: string | null;
  engagement_percentage: number | null;
  billing_percentage: number | null;
  engagement_start_date: string | null;
  release_date: string | null;
  engagement_complete: boolean;
  weekly_validation: boolean;
}

export interface ResourcePlanningInfo {
  availability_status: string;
  days_until_available: number;
  cumulative_engagement_percent: number | null;
  cumulative_billing_percent: number | null;
  final_release_date: string | null;
  breakdown: ResourcePlanningBreakdownItem[];
  
  // Legacy fields for backward compatibility (will be deprecated)
  id?: string;
  engagement_percentage?: number;
  billing_percentage?: number;
  engagement_start_date?: string;
  release_date?: string;
  engagement_complete?: boolean;
  weekly_validation?: boolean;
  current_project?: {
    id: string;
    project_name: string;
    client_name?: string;
    project_manager?: string;
  };
  bill_type?: {
    id: string;
    name: string;
  };
}

export interface EmployeeProfile {
  id: string;
  employee_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  created_at: string;
  updated_at: string;
  date_of_joining?: string;
  career_start_date?: string;
  expertise_id?: string;
  expertise_name?: string;
  total_experience_years?: number;
  company_experience_years?: number;
  resource_planning?: ResourcePlanningInfo;
  general_information?: {
    first_name?: string;
    last_name?: string;
    biography?: string;
    profile_image?: string;
    current_designation?: string;
  };
  technical_skills?: Array<{
    id: string;
    name: string;
    proficiency: number;
    priority?: number;
  }>;
  specialized_skills?: Array<{
    id: string;
    name: string;
    proficiency: number;
  }>;
  trainings?: Array<{
    id: string;
    title: string;
    provider: string;
    certification_date: string;
    is_renewable?: boolean;
    expiry_date?: string;
    certificate_url?: string;
  }>;
  experiences?: Array<{
    id: string;
    company_name: string;
    designation: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    description?: string;
  }>;
  education?: Array<{
    id: string;
    university: string;
    degree: string;
    department: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    gpa?: string;
  }>;
  achievements?: Array<{
    id: string;
    title: string;
    date: string;
    description: string;
  }>;
  projects?: Array<{
    id: string;
    name: string;
    role: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    description: string;
    responsibility?: string;
    technologies_used?: string[];
    url?: string;
    display_order?: number;
  }>;
}

export interface EmployeeProfilesPagination {
  totalCount: number;
  filteredCount: number;
  page: number;
  perPage: number;
  pageCount: number;
}

export interface EmployeeProfilesResponse {
  profiles: EmployeeProfile[];
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
}

export type EmployeeProfileSortColumn = 
  | 'first_name' 
  | 'last_name' 
  | 'employee_id' 
  | 'created_at' 
  | 'updated_at'
  | 'total_experience'
  | 'company_experience'
  | 'engagement_percentage'
  | 'billing_percentage'
  | 'release_date'
  | 'availability_status';

export type EmployeeProfileSortOrder = 'asc' | 'desc';
