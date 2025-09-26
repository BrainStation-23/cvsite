export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  firstName: string;
  lastName: string;
  employee_id?: string;
  profileImageUrl?: string;
  created_at: string;
  updated_at: string;
  customRole?: CustomRole;
  sbuContext?: string;
  permissions?: UserPermission[];
}

export interface UserPermission {
  id: string;
  role_id: string;
  module_id: string;
  module_name: string;
  sub_module_id?: string;
  sub_module_name?: string;
  permission_type: 'create' | 'read' | 'update' | 'delete' | 'manage';
  sbu_restrictions?: string[];
  route_path?: string;
  table_names?: string[];
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
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
}

export interface Education {
  id: string;
  university: string;
  degree?: string;
  department?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  gpa?: string;
}

export interface Training {
  id: string;
  title: string;
  provider: string;
  description?: string;
  date: string;
  certificateUrl?: string;
  isRenewable?: boolean;
  expiryDate?: string;
}

export interface Achievement {
  id: string;
  title: string;
  date: string;
  description: string;
}

// RBAC Types
export interface Module {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubModule {
  id: string;
  module_id: string;
  name: string;
  description?: string;
  icon?: string;
  route_path?: string;
  table_names?: string[];
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionType {
  id: string;
  name: 'create' | 'read' | 'update' | 'delete' | 'manage';
  description?: string;
  created_at: string;
}

export interface CustomRole {
  id: string;
  name: string;
  description?: string;
  is_sbu_bound: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_system_role: boolean;
}

export interface RolePermission {
  id: string;
  role_id: string;
  module_id: string;
  sub_module_id?: string;
  permission_type_id: string;
  sbu_restrictions?: string[];
  created_at: string;
  updated_at: string;
}

export interface UserCustomRole {
  id: string;
  user_id: string;
  role_id: string;
  sbu_context?: string;
  created_at: string;
  updated_at: string;
}

export interface SBU {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  role: string;
  description: string;
  startDate: string;
  endDate?: string;
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
