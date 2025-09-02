
export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  firstName: string;
  lastName: string;
  employee_id?: string;
  role: UserRole;
  profileImageUrl?: string;
  created_at: string;
  updated_at: string;
}

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
  description?: string;
  startDate: string | Date;
  endDate?: string | Date;
  isCurrent?: boolean;
}

export interface Education {
  id: string;
  university: string;
  degree?: string;
  department?: string;
  startDate: string | Date;
  endDate?: string | Date;
  isCurrent?: boolean;
  gpa?: string;
}

export interface Training {
  id: string;
  title: string;
  provider: string;
  description?: string;
  date: string | Date;
  certificateUrl?: string;
  isRenewable?: boolean;
  expiryDate?: string | Date;
}

export interface Achievement {
  id: string;
  title: string;
  date: string | Date;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  role: string;
  description: string;
  startDate: string | Date;
  endDate?: string | Date;
  isCurrent?: boolean;
  technologiesUsed?: string[];
  url?: string;
  displayOrder?: number;
  responsibility?: string;
}

export interface GeneralInfo {
  firstName: string;
  lastName: string;
  biography?: string;
  profileImage?: string;
  currentDesignation?: string;
}

export interface NoteCategory {
  id: string;
  name: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  profile_id: string;
  category_id?: string;
  title: string;
  content?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  category?: NoteCategory;
}
