
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
  | 'company_experience';

export type EmployeeProfileSortOrder = 'asc' | 'desc';
