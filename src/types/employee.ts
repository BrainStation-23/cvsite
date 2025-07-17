
export interface EmployeeSkill {
  id: string;
  name: string;
  proficiency: number;
}

export interface EmployeeTraining {
  id: string;
  title: string;
  provider: string;
  certification_date: string;
  is_renewable?: boolean;
  expiry_date?: string;
  certificate_url?: string;
}

export interface GeneralInformation {
  first_name: string;
  last_name: string;
  biography?: string;
  profile_image?: string;
  current_designation?: string;
}

export interface EnhancedEmployeeProfile {
  id: string;
  employee_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  created_at: string;
  updated_at: string;
  general_information?: GeneralInformation;
  technical_skills?: EmployeeSkill[];
  specialized_skills?: EmployeeSkill[];
  trainings?: EmployeeTraining[];
}
