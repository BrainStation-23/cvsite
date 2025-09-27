import { Database } from '@/integrations/supabase/types';

// ===== SUPABASE TYPE EXPORTS =====
// These types are now sourced directly from the database schema
// for better accuracy and automatic sync with schema changes

export type PermissionType = Database['public']['Tables']['permission_types']['Row'];
export type PermissionTypeEnum = Database["public"]["Enums"]["permission_type_enum"];
export type RolePermission = Database['public']['Tables']['role_permissions']['Row'];
export type Module = Database['public']['Tables']['modules']['Row'];
export type SubModule = Database['public']['Tables']['sub_modules']['Row'];
export type CustomRole = Database['public']['Tables']['custom_roles']['Row'];
export type NoteCategory = Database['public']['Tables']['note_categories']['Row'];
export type Note = Database['public']['Tables']['notes']['Row'];

// Legacy interface types (keeping existing application compatibility)
export interface Achievement {
  id: string;
  title: string;
  date: string;
  description: string;
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

export interface Experience {
  id: string;
  companyName: string;
  designation: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
}

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
  permission_type: 'create' | 'read' | 'update' | 'delete' | 'manage' | 'write';
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




export type UserRole = 'admin' | 'manager' | 'employee';

export interface UserRoleRecord {
  user_id: string;
  role?: UserRole;
  custom_role_id?: string;
  sbu_context?: string;
  assigned_by?: string;
  assigned_at: string;
  created_at: string;
  updated_at: string;
}
