
export interface EmployeeSkill {
  id: string;
  name: string;
  proficiency: number;
}

export interface EmployeeExperience {
  id: string;
  company_name: string;
  designation: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
}

export interface EmployeeEducation {
  id: string;
  university: string;
  degree?: string;
  department?: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  gpa?: string;
}

export interface EmployeeTraining {
  id: string;
  title: string;
  provider: string;
  certification_date: string;
  description?: string;
  certificate_url?: string;
}

export interface EmployeeAchievement {
  id: string;
  title: string;
  date: string;
  description: string;
}

export interface EmployeeProject {
  id: string;
  name: string;
  role: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  description: string;
  technologies_used?: string[];
  url?: string;
}

export interface EmployeeProfile {
  id: string;
  employee_id?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
  biography?: string;
  profile_image?: string;
  technical_skills?: EmployeeSkill[];
  specialized_skills?: EmployeeSkill[];
  experiences?: EmployeeExperience[];
  education?: EmployeeEducation[];
  trainings?: EmployeeTraining[];
  achievements?: EmployeeAchievement[];
  projects?: EmployeeProject[];
}

export interface EmployeeProfilesPagination {
  total_count: number;
  filtered_count: number;
  page: number;
  per_page: number;
  page_count: number;
}

export interface EmployeeProfilesResponse {
  profiles: EmployeeProfile[];
  pagination: EmployeeProfilesPagination;
}

export type EmployeeProfileSortColumn = 'first_name' | 'last_name' | 'employee_id' | 'created_at' | 'updated_at';
export type EmployeeProfileSortOrder = 'asc' | 'desc';
