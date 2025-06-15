export type UserRole = "admin" | "manager" | "employee";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profileImageUrl?: string;
}

export interface EmployeeProfile {
  id: string;
  userId: string;
  designation: string;
  biography: string;
  technicalSkills: Skill[];
  specializedSkills: Skill[];
  experiences: Experience[];
  education: Education[];
  training: Training[];
  achievements: Achievement[];
  projects: Project[];
}

export interface Skill {
  id: string;
  name: string;
  proficiency: number; // 1-5
  priority: number;
}

export interface Experience {
  id: string;
  companyName: string;
  designation: string;
  startDate: Date;
  endDate?: Date;
  isCurrent?: boolean;
  description: string;
}

export interface Education {
  id: string;
  university: string;
  degree: string;
  department?: string;
  startDate: Date;
  endDate?: Date;
  isCurrent?: boolean;
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
  startDate: Date;
  endDate?: Date;
  isCurrent?: boolean;
  description: string;
  technologiesUsed: string[];
  url?: string;
}

export interface PlatformSettings {
  universities: string[];
  departments: string[];
  degrees: string[];
  designations: string[];
  references: string[];
  sbus: string[]; // Strategic Business Units
}
