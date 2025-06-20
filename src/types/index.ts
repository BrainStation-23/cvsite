
export interface Skill {
  id: string;
  name: string;
  proficiency: number;
  priority: number;
}

export interface Experience {
  id: string;
  companyName: string;
  designation: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description?: string;
}

export interface Education {
  id: string;
  university: string;
  degree?: string;
  department?: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  gpa?: string;
}

export interface Training {
  id: string;
  title: string;
  provider: string;
  date: Date;
  description?: string;
  certificateUrl?: string;
}

export interface Achievement {
  id: string;
  title: string;
  date: Date;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  role: string;
  description: string;
  responsibility: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  technologiesUsed: string[];
  url?: string;
}

export interface Reference {
  id: string;
  name: string;
  designation: string;
  company: string;
  email?: string;
  phone?: string;
}

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  employee_id?: string;
  sbu_id?: string;
  created_at: string;
  updated_at: string;
  role: UserRole;
  profileImageUrl?: string;
}

export type UserRole = 'admin' | 'manager' | 'employee';
