
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
  startDate: Date;
  endDate?: Date;
  isCurrent?: boolean;
}

export interface Education {
  id: string;
  university: string;
  degree?: string;
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
  description?: string;
  date: Date;
  certificateUrl?: string;
  isRenewable?: boolean;
  expiryDate?: Date;
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
  startDate: Date;
  endDate?: Date;
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
